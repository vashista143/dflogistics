const mongoose = require("mongoose");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");

// ======================================
// GET /api/jobs
// Get all jobs (Only returns published/active jobs)
// ======================================
const getAllJobs = async (req, res) => {
  try {
    const { type, search } = req.query;

    const filter = {
      isActive: true,
    };

    if (type) {
      filter.jobType = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All jobs fetched successfully.",
      count: jobs.length,
      data: jobs,
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
// GET /api/jobs/pending
// Get all pending job submissions (Admin Only)
// ======================================
const getPendingJobs = async (req, res) => {
  try {
    // Find any job that is inactive OR unverified
    const pendingJobs = await Job.find({
      $or: [ { isverified: false }, { isVerified: false }],
    })
      .populate("postedBy", "name email companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingJobs.length,
      data: pendingJobs,
    });
  } catch (error) {
    console.error("Get Pending Jobs Error:", error);

    return res.status(500).json({
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
    const userId = req.user.id;

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
    const alreadyApplied = await JobApplication.exists({
      job: jobId,
      applicant: userId,
    });
    
    const isApplied = alreadyApplied !== null;

    res.status(200).json({
      success: true,
      message: "Job fetched successfully.",
      data: {
        ...job.toObject(),
        isApplied,
      },
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

    const { answers = {} } = req.body;

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

    const application = await JobApplication.create({
      job: jobId,
      applicant: userId,
      answers,
    });

    job.applicants.push(userId);
    await job.save();

    res.status(201).json({
      success: true,
      message: "Applied successfully.",
      data: application,
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

// ======================================
// POST /api/jobs
// Create a new Job
// ======================================
const createJob = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile from DB to reliably check role and iscompany flags
    const dbUser = await User.findById(userId).select("role iscompany");
    const userRole = dbUser?.role || req.user.role;

    const {
      title,
      company,
      companyLogo,
      description,
      requirements,
      responsibilities,
      employmentType,
      experience,
      location,
      salary,
      benefits,
      openings,
      applicationDeadline,
      questions,
    } = req.body;

    const validQuestions = (questions || [])
      .map((q) => q.trim())
      .filter(Boolean);

    // If Admin posts, activate immediately; if Company posts, pending verification
    const isApproved = userRole === "admin";

    const job = await Job.create({
      title,
      company,
      companyLogo,
      description,
      requirements,
      responsibilities,
      employmentType,
      experience,
      location,
      salary,
      benefits,
      openings,
      applicationDeadline,
      questions: validQuestions,
      postedBy: userId,
      isActive: isApproved,
      isVerified: isApproved,
      isverified: isApproved, // Sync both camelCase and lowercase field names
    });


    return res.status(201).json({
      success: true,
      message: isApproved
        ? "Job created and published successfully."
        : "Job submitted successfully and is pending admin approval.",
      data: job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// PUT /api/jobs/:id/verify
// Admin verifies and approves job submission
// ======================================
const verifyJob = async (req, res) => {
  try {
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

    job.isActive = true;
    job.isVerified = true;
    job.isverified = true;
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job verified and published successfully.",
      data: job,
    });
  } catch (error) {
    console.error("Verify Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// PUT /api/jobs/:id
// Update job
// ======================================
const updateJob = async (req, res) => {
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

    if (job.postedBy.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this job.",
      });
    }

    Object.assign(job, req.body);

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: job,
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// GET /api/jobs/my-posted
// Get jobs posted by logged-in user/company
// ======================================
const getPostedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const jobs = await Job.find({
      postedBy: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Posted Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      ![
        "Applied",
        "Under Review",
        "Accepted",
        "Rejected",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const application = await JobApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;

    await application.save();

    res.json({
      success: true,
      data: application,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const skip = (page - 1) * limit;

    const applications = await JobApplication.find({
      job: jobId,
    })
      .populate(
        "applicant",
        "name email mobileNumber location createdAt"
      )
      .skip(skip)
      .limit(limit)
      .sort({
        createdAt: -1,
      });

    const total = await JobApplication.countDocuments({
      job: jobId,
    });

    res.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllJobs,
  getPendingJobs,
  getJobById,
  createJob,
  verifyJob,
  updateJob,
  applyForJob,
  getAppliedJobs,
  getPostedJobs,
  getApplicants,
  updateApplicationStatus,
};
