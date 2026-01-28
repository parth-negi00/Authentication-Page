const express = require("express");
const router = express.Router(); 
const Form = require("../models/Form");
const Submission = require("../models/Submission"); 
const auth = require("../middleware/authMiddleware");

// --- 1. GET FORMS (Smart History Logic) ---
// Admin: Sees ALL forms created by the Org.
// Respondent: Sees ONLY forms they have already submitted (History).
router.get("/", auth, async (req, res) => {
  try {
    // A. IF ADMIN: Show everything
    if (req.user.privilege === 'admin') {
       const forms = await Form.find({ organizationId: req.user.organizationId }).sort({ lastUpdated: -1 });
       return res.json(forms);
    }

    // B. IF RESPONDENT: Show "My Submitted Forms"
    // 1. Find all submissions made by this user
    const mySubmissions = await Submission.find({ userId: req.user.id }).select("formId");
    
    // 2. Extract the Form IDs from those submissions (and filter out duplicates)
    const formIds = [...new Set(mySubmissions.map(sub => sub.formId))];

    // 3. Fetch the actual Form details for those IDs
    const forms = await Form.find({ _id: { $in: formIds } });
    
    res.json(forms); 

  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- 2. GET SINGLE FORM (For Share Links) ---
router.get("/:id", auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Optional Security: Ensure the user belongs to the same org
    if (form.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(403).json({ message: "Access Denied: Wrong Organization" });
    }

    res.json(form);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- 3. SAVE / UPDATE FORM ---
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

// --- 4. DELETE FORM (Cascade Delete) ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const form = await Form.findOne({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId 
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found or unauthorized" });
    }

    // CASCADE DELETE: Delete all submissions linked to this form
    await Submission.deleteMany({ formId: req.params.id });

    // Now delete the form itself
    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: "Form and all associated data deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;