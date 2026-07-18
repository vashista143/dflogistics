const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  applelogin,
} = require("../controllers/authcontroller");

const authMiddleware = require("../middleware/middleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/apple", applelogin);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
