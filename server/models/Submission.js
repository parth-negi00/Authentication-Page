const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true
  },
  // The User_ID of the person who filled it
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Organisation_ID (For easier filtering)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  formName: { type: String },
  data: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Submission", SubmissionSchema);