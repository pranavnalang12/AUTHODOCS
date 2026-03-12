const mongoose = require("mongoose");

const registerStudentSchema = new mongoose.Schema({
  studentId: { type: String },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  department: { type: String, trim: true },
  year: { type: Number, min: 1, max: 4 },
  className: { type: String, trim: true },
}, { timestamps: true });

// Explicit collection name: registerstudent
module.exports = mongoose.model("RegisterStudent", registerStudentSchema, "registerstudent");


