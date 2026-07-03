const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobById,
  applyForJob,
  getAppliedJobs,
} = require("../controllers/jobscontroller");

const authMiddleware = require("../middleware/middleware");

// Get all available jobs
router.get("/", authMiddleware, getAllJobs);

// Get applied jobs
router.get("/applications", authMiddleware, getAppliedJobs);

// Get a specific job
router.get("/:id", authMiddleware, getJobById);

// Apply for a job
router.post("/:id/apply", authMiddleware, applyForJob);


module.exports = router;