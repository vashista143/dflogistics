const mongoose = require("mongoose");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");

// ======================================
// GET /api/jobs
// Get all jobs
// ======================================
const getAllJobs = async (req, res) => {
  try {
    const {
      type,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (type) {
      filter.jobType = type;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          company: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "location.city": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "location.state": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Jobs fetched successfully.",
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalJobs,
        totalPages: Math.ceil(totalJobs / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// GET /api/jobs/:id
// Get single job
// ======================================
const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(jobId).populate(
      "postedBy",
      "name email"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job fetched successfully.",
      data: job,
    });
  } catch (error) {
    console.error("Get Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// POST /api/jobs/:id/apply
// Apply for Job
// ======================================
const applyForJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    const alreadyApplied = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    await JobApplication.create({
      job: jobId,
      applicant: userId,
    });

    job.applicants.push(userId);
    await job.save();

    res.status(201).json({
      success: true,
      message: "Applied successfully.",
    });
  } catch (error) {
    console.error("Apply Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// GET /api/jobs/applications
// Get applied jobs
// ======================================
const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await JobApplication.find({
      applicant: userId,
    })
      .populate("job")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      message: "Applications fetched successfully.",
      data: applications,
    });
  } catch (error) {
    console.error("Applications Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  applyForJob,
  getAppliedJobs,
};