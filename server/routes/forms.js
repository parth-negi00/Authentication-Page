const express = require("express");
const router = express.Router(); 
const Form = require("../models/Form");
const jwt = require("jsonwebtoken");

// --- Middleware to verify Token ---
const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  // Debug logs to see what's happening with Auth
  console.log("--- Auth Middleware ---");
  console.log("1. Header:", authHeader);
  console.log("2. Token:", token ? "Present" : "Missing");

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("3. User ID decoded:", req.user.id);
    next();
  } catch (e) {
    console.error("JWT Verify Error:", e.message);
    res.status(400).json({ message: "Token is not valid" });
  }
};

// --- GET ROUTE: Fetch all forms for Dashboard ---
router.get("/", auth, async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user.id }).sort({ lastUpdated: -1 });
    res.json(forms);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- POST ROUTE: Save (Publish) or Update a form ---
router.post("/submit", auth, async (req, res) => {
  try {
    console.log("--- 1. Submit/Update Route Hit ---");
    const { id, formName, description, items } = req.body;

    // A. UPDATE EXISTING FORM
    if (id) {
        console.log(`--- Updating Existing Form: ${id} ---`);
        
        // Find by ID AND User (security check)
        let form = await Form.findOne({ _id: id, userId: req.user.id });

        if (!form) {
            return res.status(404).json({ message: "Form not found or unauthorized" });
        }

        // Update fields
        form.name = formName;
        form.description = description;
        form.items = items;
        form.lastUpdated = Date.now();

        await form.save();
        console.log("--- Update Successful! ---");
        return res.status(200).json(form);
    }

    // B. CREATE NEW FORM
    console.log("--- Creating New Form ---");
    const newForm = new Form({
      userId: req.user.id,
      name: formName || "Untitled Form",
      description: description || "",
      items: items,
      status: "Published"
    });

    const savedForm = await newForm.save();
    console.log("--- Create Successful! ---");
    res.status(201).json(savedForm);

  } catch (err) {
    console.error("Save Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- NEW DELETE ROUTE (Added this!) ---
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log(`--- Deleting Form: ${req.params.id} ---`);
    
    const form = await Form.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id // Security: Ensure user owns the form
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