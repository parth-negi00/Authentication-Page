const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // User_ID is automatically created by MongoDB as '_id'
  
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  
  // "Organisation_ID"
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  // "Privilege"
  // Logic: 'admin' if via Signup, '' (blank) if created by an Admin
  privilege: {
    type: String,
    default: "" // Default is blank (for sub-users)
  },

  // Keeping this for your "Search by Name/Number" requirement
  mobileNumber: {
    type: String,
    default: ""
  },
  
  // Useful to know WHO created this user (The "User ID" of the admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);