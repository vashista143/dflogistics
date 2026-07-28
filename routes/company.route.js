const express = require("express");
const router = express.Router();
const {
  registerCompany,
  loginCompany,
  googleAuthCompany,
} = require("../controllers/companyAuthController");

// POST /auth/company/register
router.post("/register", registerCompany);

// POST /auth/company/login
router.post("/login", loginCompany);

// POST /auth/company/google
router.post("/google", googleAuthCompany);

module.exports = router;