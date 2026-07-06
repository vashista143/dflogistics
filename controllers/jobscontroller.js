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


const createJob = async (req, res) => {
  try {
    const userId = req.user.id;

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
    } = req.body;

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
      postedBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
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

    if (job.postedBy.toString() !== userId) {
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

const getPostedJobs = async (req, res) => {
    console.log("Fetching posted jobs for user:", req.user.id);

  try {
    const userId = req.user.id;

    const jobs = await Job.find({
      postedBy: userId,
    })
      .sort({ createdAt: -1 });
      console.log(jobs)
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

const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const skip = (page - 1) * limit;

    const applications =
      await JobApplication.find({
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

    const total =
      await JobApplication.countDocuments({
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
  getJobById,
  createJob,
  updateJob,
  applyForJob,
  getAppliedJobs,
  getPostedJobs,
  getApplicants,
};
