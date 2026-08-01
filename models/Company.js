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
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    iscompany: {
      type: Boolean,
      default: true,
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
      default: "",
    },
    mcNumber: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["company", "admin"],
      default: "company",
    },
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
