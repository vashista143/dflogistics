const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updates = req.body;
    console.log(req.user);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const allowedFields = [
      "name",
      "phoneNumber",
      "profileImage",
      "dateOfBirth",
      "gender",

      "country",
      "state",
      "city",
      "zipCode",
      "homeAddress",

      "location",
      "currentlocation",
      "trucktype",
      "profileimageurl",
      "drivingexp",

      "preferredJobTypes",
      "preferredEquipment",
      "preferredRadius",
      "preferredStates",
      "minimumRatePerMile",
      "preferredFuelBrand",

      "emergencyContact",

      "notificationSettings",

      "language",
      "theme",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId).select(
  "-password -refreshToken"
);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateCurrentLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be numbers.",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        currentLocation: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON => [lng, lat]
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("currentLocation");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Current location updated successfully.",
      data: updatedUser.currentLocation,
    });
  } catch (error) {
    console.error("Update Current Location Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateCurrentLocation,
};