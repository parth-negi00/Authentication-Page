const express = require("express");
const Submission = require("../models/Submission");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/submissions
// @desc    Save a new form submission
router.post("/", auth, async (req, res) => {
  const { formId, formName, data } = req.body;
  try {
    const newSubmission = new Submission({
      formId,
      userId: req.user.id,
      organizationId: req.user.organizationId,
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
// @desc    Get submissions for the logged-in User
router.get("/my-submissions", auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/submissions/user/:userId
// @desc    Get submissions for a specific user (Admin view)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    if (req.user.privilege !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }
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
// @desc    Get submissions for a specific form (Admin sees ALL, User sees OWN)
router.get("/form/:formId", auth, async (req, res) => {
  try {
    let query = { 
      formId: req.params.formId,
      organizationId: req.user.organizationId 
    };
    if (req.user.privilege !== 'admin') {
      query.userId = req.user.id;
    }
    const submissions = await Submission.find(query)
      .populate("userId", "name email") 
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- NEW ROUTE: GET SINGLE SUBMISSION (For History Page) ---
router.get("/:id", auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate("userId", "name");
    if (!submission) return res.status(404).json({ message: "Not found" });
    
    // Security: Ensure user owns it or is admin
    if (req.user.privilege !== 'admin' && submission.userId._id.toString() !== req.user.id) {
       return res.status(403).json({ message: "Access Denied" });
    }
    
    res.json(submission);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- UPDATED ROUTE: PUT (UPDATE WITH HISTORY) ---
// @route   PUT /api/submissions/:id
// @desc    Update submission & Archive old version to history
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.privilege !== 'admin') {
      return res.status(403).json({ message: "Access Denied" });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Not found" });

    // 1. Create Snapshot of OLD data
    const historyEntry = {
      editedBy: req.user.id,
      editedAt: Date.now(),
      versionLabel: `Version ${submission.history.length + 1}`, // e.g. Version 1, Version 2
      previousData: submission.data 
    };

    // 2. Push to History Array
    submission.history.push(historyEntry);

    // 3. Update Current Data with New Data
    submission.data = req.body.data;

    // 4. Save
    await submission.save(); // Mongoose will update the document structure automatically

    console.log("Submission updated with history:", submission._id);
    res.json(submission);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;