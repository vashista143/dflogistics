const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/middleware"); // Ensure your JWT auth middleware is imported
const {
  registerCompany,
  loginCompany,
  googleAuthCompany,
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyAccount,
  logoutCompany,
} = require("../controllers/companyAuthController");

// Public
router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/google", googleAuthCompany);

// Authenticated Company Endpoints
router.get("/profile", authMiddleware, getCompanyProfile);
router.put("/profile", authMiddleware, updateCompanyProfile);
router.delete("/delete-account", authMiddleware, deleteCompanyAccount);
router.post("/logout", authMiddleware, logoutCompany);

module.exports = router;
