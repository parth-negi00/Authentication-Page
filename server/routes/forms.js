const express = require("express");
const router = express.Router(); 
const Form = require("../models/Form");
const Submission = require("../models/Submission"); // <--- IMPORT THIS!
const auth = require("../middleware/authMiddleware");

// --- GET ROUTE: Fetch all forms for the Organization ---
router.get("/", auth, async (req, res) => {
  try {
    const forms = await Form.find({ organizationId: req.user.organizationId }).sort({ lastUpdated: -1 });
    res.json(forms);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- POST ROUTE: Save (Publish) or Update a form ---
router.post("/submit", auth, async (req, res) => {
  try {
    const { id, formName, description, items } = req.body;

    // A. UPDATE EXISTING FORM
    if (id) {
        let form = await Form.findOne({ _id: id, organizationId: req.user.organizationId });

        if (!form) {
            return res.status(404).json({ message: "Form not found or unauthorized" });
        }

        form.name = formName;
        form.description = description;
        form.items = items;
        form.lastUpdated = Date.now();

        await form.save();
        return res.status(200).json(form);
    }

    // B. CREATE NEW FORM
    const newForm = new Form({
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
      name: formName || "Untitled Form",
      description: description || "",
      items: items,
      status: "Published"
    });

    const savedForm = await newForm.save();
    res.status(201).json(savedForm);

  } catch (err) {
    console.error("Save Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- DELETE ROUTE (The Fix) ---
router.delete("/:id", auth, async (req, res) => {
  try {
    // 1. Find the form first to ensure it exists and belongs to this Org
    const form = await Form.findOne({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId 
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found or unauthorized" });
    }

    // 2. CASCADE DELETE: Delete all submissions linked to this form
    await Submission.deleteMany({ formId: req.params.id });

    // 3. Now delete the form itself
    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: "Form and all associated data deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;