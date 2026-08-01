const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getPendingJobs, // New: Get pending submissions
  getJobById,
  applyForJob,
  getAppliedJobs,
  createJob,
  verifyJob, // New: Admin approves job
  updateJob,
  getPostedJobs,
  getApplicants,
  updateApplicationStatus,
} = require("../controllers/jobscontroller");

const authMiddleware = require("../middleware/middleware");

// ======================================
// Job Routes
// ======================================

// Public/Driver feed (Only returns active/verified jobs)
router.get("/", authMiddleware, getAllJobs);

// Admin route to fetch pending submissions awaiting review
router.get("/pending", authMiddleware, getPendingJobs);

// Application routes
router.get("/applications", authMiddleware, getAppliedJobs);
router.put(
  "/applications/:id/status",
  authMiddleware,
  updateApplicationStatus
);

// Company posted jobs
router.get("/my-posted", authMiddleware, getPostedJobs);

// Post job (Admin = Auto-published, Company = Pending review)
router.post("/", authMiddleware, createJob);

// Admin route to verify/approve a job submission
router.put("/:id/verify", authMiddleware, verifyJob);

// Job Application & Applicant management
router.post("/:id/apply", authMiddleware, applyForJob);
router.get("/:id/applicants", authMiddleware, getApplicants);

// Edit Job
router.put("/:id", authMiddleware, updateJob);

// Single Job Details (Keep at bottom so static routes like /pending or /my-posted aren't captured as an ID)
router.get("/:id", authMiddleware, getJobById);

module.exports = router;
