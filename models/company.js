const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Required if not registering through Google OAuth
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "USA" },
    },
    dotNumber: {
      type: String,
      default: "", // USDOT Number if applicable
    },
    mcNumber: {
      type: String,
      default: "", // Motor Carrier Number if applicable
    },
    role: {
      type: String,
      enum: ["company", "admin"],
      default: "company",
    },
    // Subscription Management
    subscription: {
      sku: {
        type: String,
        default: "com.dflogistics.truckerkit.company.monthly",
      },
      isSubscribed: {
        type: Boolean,
        default: false,
      },
      subscribedAt: {
        type: Date,
      },
      expiresAt: {
        type: Date,
      },
      transactionReceipt: {
        type: String,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", CompanySchema);
