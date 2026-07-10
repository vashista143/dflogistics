const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobById,
  applyForJob,
  getAppliedJobs,
  createJob,
  updateJob,
  getPostedJobs,
  getApplicants,
  updateApplicationStatus,
} = require("../controllers/jobscontroller");

const authMiddleware = require("../middleware/middleware");

router.get("/", authMiddleware, getAllJobs);
router.put(
  "/applications/:id/status",
  authMiddleware,
  updateApplicationStatus
);
router.post("/", authMiddleware, createJob);

router.get("/applications", authMiddleware, getAppliedJobs);

router.get("/my-posted", authMiddleware, getPostedJobs);

router.post("/:id/apply", authMiddleware, applyForJob);

router.get("/:id/applicants", authMiddleware, getApplicants);

router.put("/:id", authMiddleware, updateJob);

router.get("/:id", authMiddleware, getJobById);
module.exports = router;