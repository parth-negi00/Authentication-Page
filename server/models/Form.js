const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
  // Link the form to the Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  // The Admin who created it
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  status: { 
    type: String, 
    default: "Published" 
  },
  items: { 
    type: Array, 
    required: true 
  }, 
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Form", FormSchema);