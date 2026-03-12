// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  className: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", studentSchema);
