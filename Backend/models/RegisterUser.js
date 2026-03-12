const mongoose = require("mongoose");

const registerUserSchema = new mongoose.Schema({
  studentId: { type: String },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Staff"], default: "Student" },
  department: { type: String, trim: true },
  year: { type: Number, min: 1, max: 4 },
  className: { type: String, trim: true },
}, { timestamps: true });

// Explicitly set collection name to "registeruses"
module.exports = mongoose.model("RegisterUser", registerUserSchema, "registeruses");




