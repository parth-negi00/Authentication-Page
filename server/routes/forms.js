const express = require("express");
const router = express.Router(); 
const Form = require("../models/Form");
const auth = require("../middleware/authMiddleware"); // USE THE REAL MIDDLEWARE

// --- GET ROUTE: Fetch all forms for the Organization ---
router.get("/", auth, async (req, res) => {
  try {
    // UPDATED: Filter by Organization, not just User ID
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
        // Ensure user owns the form OR belongs to same org
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
    // UPDATED: We must save organizationId now!
    const newForm = new Form({
      organizationId: req.user.organizationId, // <--- CRITICAL NEW FIELD
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

// --- DELETE ROUTE ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId // Security check
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found or unauthorized" });
    }

    res.json({ message: "Form deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;