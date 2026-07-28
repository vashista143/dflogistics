const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate access and refresh tokens
const generateTokens = (companyId) => {
  const accessToken = jwt.sign(
    { id: companyId, role: "company" },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: companyId, role: "company" },
    process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret",
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

// Company Register
exports.registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, phoneNumber, dotNumber, mcNumber } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ message: "Company name, email, and password are required" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already registered with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const company = new Company({
      companyName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "",
      dotNumber: dotNumber || "",
      mcNumber: mcNumber || "",
    });

    const { accessToken, refreshToken } = generateTokens(company._id);
    company.refreshTokens.push(refreshToken);
    await company.save();

    const companyData = company.toObject();
    delete companyData.password;
    delete companyData.refreshTokens;

    res.status(201).json({
      accessToken,
      refreshToken,
      company: companyData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Company Email/Password Login
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const company = await Company.findOne({ email });
    if (!company || !company.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(company._id);

    company.refreshTokens.push(refreshToken);
    await company.save();

    const companyData = company.toObject();
    delete companyData.password;
    delete companyData.refreshTokens;

    res.status(200).json({
      accessToken,
      refreshToken,
      company: companyData,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Company Google Auth
exports.googleAuthCompany = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID Token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_WEB_CLIENT_ID,
      ].filter(Boolean),
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;

    let company = await Company.findOne({ $or: [{ googleId }, { email }] });

    if (!company) {
      company = new Company({
        companyName: name || "Company",
        email,
        googleId,
        isVerified: true,
      });
    } else if (!company.googleId) {
      company.googleId = googleId;
    }

    const { accessToken, refreshToken } = generateTokens(company._id);
    company.refreshTokens.push(refreshToken);
    await company.save();

    const companyData = company.toObject();
    delete companyData.password;
    delete companyData.refreshTokens;

    res.status(200).json({
      accessToken,
      refreshToken,
      company: companyData,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};