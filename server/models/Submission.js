const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  formName: {
    type: String,
    required: true,
  },
  // The Current (Latest) Data
  data: {
    type: Object, 
    required: true,
  },
  
  // --- NEW: HISTORY ARRAY ---
  // This stores the snapshots of previous versions
  history: [{
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who made the edit (Iqra)
    editedAt: { type: Date, default: Date.now },
    versionLabel: { type: String }, // e.g. "Version 1"
    previousData: { type: Object }  // The answers BEFORE the edit
  }],
  // --------------------------

  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { minimize: false }); 

module.exports = mongoose.model("Submission", SubmissionSchema);