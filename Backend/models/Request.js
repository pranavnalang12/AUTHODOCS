
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["bonafide", "transfer", "leaving", "character"],
    required: true,
  },
  data: {
    type: Object, // form fields
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  documentUrl: { type: String },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
