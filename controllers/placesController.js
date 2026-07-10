const axios = require("axios");
const User = require("../models/User");

const getNearbyParking = async (req, res) => {
  try {
    // Logged in user
    const user = await User.findById(req.user.id).select("currentLocation");

    if (!user || !user.currentLocation) {
      return res.status(404).json({
        success: false,
        message: "User location not found.",
      });
    }

    const [longitude, latitude] = user.currentLocation.coordinates;

    const url = "https://api.tomtom.com/maps/orbis/places/search/parking.json";

    const response = await axios.get(url, {
      params: {
        key: process.env.TOMTOM_API_KEY,
        apiVersion: 1,
        geobias: `point:${latitude},${longitude}`,
        radius: 5000,
      },
    });

    // Original results from TomTom
    const results = response.data.results || [];

    // Remove garage door repair businesses
    const parkingPlaces = results.filter((place) => {
      const name = place.poi?.name?.toLowerCase() || "";
      const website = place.poi?.url?.toLowerCase() || "";

      const isGarageDoorBusiness =
        name.includes("garage door") ||
        name.includes("door repair") ||
        name.includes("door services") ||
        name.includes("door pros") ||
        website.includes("garagedoorrepairsusa.com");

      return !isGarageDoorBusiness;
    });
const formattedParking = parkingPlaces.map((place) => ({
  id: place.id,
  name: place.poi?.name || "Parking",
  distanceInMeters: Math.round(place.dist),
  distanceInKm: (place.dist / 1000).toFixed(2),
  latitude: place.position?.lat,
  longitude: place.position?.lon,
  address: place.address?.freeformAddress,
  city: place.address?.municipality,
  state: place.address?.countrySubdivisionCode,
  phone: place.poi?.phone || null,
  website: place.poi?.url || null,
  category: "Parking",
  routingPoint:
    place.entryPoints?.find((e) => e.preferredRouting)?.position ||
    place.position,
}));

return res.status(200).json({
  success: true,
  count: formattedParking.length,
  data: formattedParking,
});
  } catch (err) {
    console.error(err.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch nearby parking.",
    });
  }
};


const getNearbyFuelStations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("currentLocation");

    if (!user || !user.currentLocation) {
      return res.status(404).json({
        success: false,
        message: "User location not found.",
      });
    }

    const [longitude, latitude] = user.currentLocation.coordinates;

    const response = await axios.get(
      "https://api.tomtom.com/maps/orbis/places/search/fuel.json",
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          apiVersion: 1,
          geobias: `point:${latitude},${longitude}`,
          radius: 5000,
        },
      }
    );

    const results = (response.data.results || []).filter((place) => {
  const categories = (place.poi?.categories || []).map((c) => c.toLowerCase());

  return categories.some((category) =>
    [
      "fuel station",
      "gas station",
      "petrol station",
      "service station",
    ].includes(category)
  );
});

    const fuelStations = results.map((place) => ({
      id: place.id,
      name: place.poi?.name,
      distanceInMeters: Math.round(place.dist),
      distanceInKm: (place.dist / 1000).toFixed(2),
      latitude: place.position?.lat,
      longitude: place.position?.lon,
      address: place.address?.freeformAddress,
      city: place.address?.municipality,
      state: place.address?.countrySubdivisionCode,
      phone: place.poi?.phone || null,
      website: place.poi?.url || null,
      category: place.poi?.categories?.[0] || "Fuel Station",
      routingPoint:
        place.entryPoints?.find((e) => e.preferredRouting)?.position ||
        place.position,
    }));

    return res.status(200).json({
      success: true,
      count: fuelStations.length,
      data: fuelStations,
    });
  } catch (err) {
    console.error(err.response?.data || err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch nearby fuel stations.",
    });
  }
};

module.exports = {
  getNearbyParking,
  getNearbyFuelStations,
};