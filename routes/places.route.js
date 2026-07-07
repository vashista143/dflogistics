const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/middleware");
const {
  getNearbyParking,
  getNearbyFuelStations,
} = require("../controllers/placesController");

router.get("/parking", authMiddleware, getNearbyParking);
router.get("/fuel", authMiddleware, getNearbyFuelStations);

module.exports = router;