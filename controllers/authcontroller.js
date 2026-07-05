const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const {generateAccessToken, generateRefreshToken,} = require("../utils/generateTokens");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    const trimmedMobileNumber = mobileNumber?.trim();
    if (!trimmedName||
      !trimmedEmail ||
      !trimmedPassword ||
      typeof trimmedName !=="string"||
      typeof trimmedEmail !== "string" ||
      typeof trimmedPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }
    if (
    !trimmedMobileNumber ||
    typeof trimmedMobileNumber !== "string"
    ) {
    return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
    });
    }

    const mobileRegex = /^[6-9]\d{9}$/;

    if (!mobileRegex.test(trimmedMobileNumber)) {
    return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
    });
    }
    const existingMobile = await User.findOne({
    mobileNumber: trimmedMobileNumber,
    });

    if (existingMobile) {
    return res.status(409).json({
        success: false,
        message: "Mobile number already registered.",
    });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }
    if (trimmedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }
    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with Email already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const user = await User.create({
    name: trimmedName,
    email: trimmedEmail,
    password: hashedPassword,
    mobileNumber: trimmedMobileNumber,

    });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    accessToken,
    refreshToken,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        location: user.location,
    },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
        success: false,
        message: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const {email, password}=req.body;
    if(!email || !password){
        return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }
    const user= await User.findOne({email: email});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"No account exist with given mail"
        })
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password.",
        });
        }
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.refreshToken = null;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token does not match.",
      });
    }
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};
