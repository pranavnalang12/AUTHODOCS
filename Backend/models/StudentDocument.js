const mongoose = require("mongoose");

const studentDocumentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  docName: { 
    type: String, 
    required: true 
  }, // e.g., Bonafide, Marksheet
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("StudentDocument", studentDocumentSchema);
