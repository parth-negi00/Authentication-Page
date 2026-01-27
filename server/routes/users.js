const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); 

const router = express.Router();

// @route   GET /api/users
// @desc    Get all sub-users for the current Admin's Organization
// @access  Private (Admin only)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ 
      organizationId: req.user.organizationId,
      privilege: "" 
    }).select("-password"); 

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/users
// @desc    Create a new Sub-User
// @access  Private (Admin only)
router.post("/", auth, async (req, res) => {
  if (req.user.privilege !== 'admin') {
      return res.status(403).json({ message: "Access Denied" });
  }

  const { name, email, password, mobileNumber } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user linked to the Admin's Organization
    user = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      privilege: "",           
      organizationId: req.user.organizationId, 
      createdBy: req.user.id   
    });

    await user.save();
    
    // Return the new user (excluding password)
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;