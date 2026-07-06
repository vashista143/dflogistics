// models/Job.js

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
    },

    requirements: [
      {
        type: String,
      },
    ],

    responsibilities: [
      {
        type: String,
      },
    ],

    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract"],
      default: "Full-Time",
    },

    experience: {
      type: String,
      default: "Not Specified",
    },

    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: "USA",
      },
    },

    salary: {
      min: Number,
      max: Number,
      period: {
        type: String,
        enum: ["hour", "week", "month", "year", "mile"],
        default: "year",
      },
    },

    benefits: [
      {
        type: String,
      },
    ],

    openings: {
      type: Number,
      default: 1,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    applicationDeadline: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
