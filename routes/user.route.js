const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateCurrentLocation,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/middleware");

router.get("/profile", authMiddleware, getUserProfile);

router.put("/location", authMiddleware, updateCurrentLocation);

router.put("/profile", authMiddleware, updateUserProfile );

module.exports = router;