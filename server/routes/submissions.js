const express = require("express");
const Submission = require("../models/Submission");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/submissions
// @desc    Save a new form submission (Respondent fills a form)
// @access  Private
router.post("/", auth, async (req, res) => {
  const { formId, formName, data } = req.body;

  try {
    const newSubmission = new Submission({
      formId,
      userId: req.user.id, // From auth middleware
      organizationId: req.user.organizationId, // CRITICAL: Links data to your company
      formName,
      data
    });

    const submission = await newSubmission.save();
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/submissions/my-submissions
// @desc    Get submissions for the logged-in User (Respondent view)
// @access  Private
router.get("/my-submissions", auth, async (req, res) => {
  try {
    // Only show submissions that belong to THIS user
    const submissions = await Submission.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/submissions/user/:userId
// @desc    Get submissions for a specific user (Admin view)
// @access  Private (Admin only)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // 1. Security Check: Are you an Admin?
    if (req.user.privilege !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 2. Fetch submissions for that specific employee
    // We also check organizationId to ensure Admin A can't see Admin B's employee data
    const submissions = await Submission.find({ 
        userId: req.params.userId,
        organizationId: req.user.organizationId 
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/submissions/form/:formId
// @desc    Get ALL submissions for a specific form (Admin Only)
// @access  Private
router.get("/form/:formId", auth, async (req, res) => {
  try {
    // 1. Security Check: Only Admins can see all responses
    if (req.user.privilege !== 'admin') {
      return res.status(403).json({ message: "Access Denied" });
    }

    // 2. Fetch submissions AND "Populate" (join) user details
    // This turns "userId": "123" into "userId": { name: "Akash", email: "..." }
    const submissions = await Submission.find({ 
      formId: req.params.formId,
      organizationId: req.user.organizationId 
    })
    .populate("userId", "name email") // <--- MAGIC LINE
    .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;