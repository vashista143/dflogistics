// models/JobApplication.js

const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
  type: Map,
  of: String,
  default: {},
},
    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Accepted",
        "Rejected"
      ],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
