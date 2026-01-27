const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization"); 

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new Admin + Organization (Tenant)
// @access  Public
router.post("/signup", async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  try {
    // 1. Check if User exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Check if Organization Name is taken
    let org = await Organization.findOne({ name: organizationName });
    if (org) {
      return res.status(400).json({ message: "Organization name already taken" });
    }

    // 3. Create the Organization First
    const newOrg = new Organization({
      name: organizationName,
      ownerId: null // Will update this in a moment
    });
    await newOrg.save();

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create the Admin User
    // LOGIC: Since this is the signup route, they are the 'admin'
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      privilege: "admin",      // The Boss
      organizationId: newOrg._id,
      createdBy: null
    });
    await newUser.save();

    // 6. Link Organization back to Owner
    newOrg.ownerId = newUser._id;
    await newOrg.save();

    // 7. Generate Token
    const payload = {
      id: newUser._id,
      privilege: newUser.privilege,
      organizationId: newUser.organizationId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        privilege: newUser.privilege,
        organizationId: newUser.organizationId
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/login
// @desc    Login User & Get Token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Payload includes Privilege and OrgId for middleware
    const payload = {
      id: user._id,
      privilege: user.privilege,
      organizationId: user.organizationId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        privilege: user.privilege,
        organizationId: user.organizationId
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;