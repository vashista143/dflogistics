const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateCurrentLocation,
} = require("../controllers/usercontroller");

const authMiddleware = require("../middleware/middleware");

router.get("/profile", authMiddleware, getUserProfile);

router.put("/location", authMiddleware, updateCurrentLocation);

router.put("/profile", authMiddleware, updateUserProfile );

router.put("/profile-image",  authMiddleware, upload.single("image"),  updateProfileImage);

module.exports = router;