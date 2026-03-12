
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const RegisterUser = require("../models/RegisterUser");
const RegisterStudent = require("../models/RegisterStudent");
const { protect, authorize } = require("../middleware/middleware");

// GET /api/students - only for staff
router.get("/", protect, authorize("Staff"), async (req, res) => {
  try {
    const { search, department, year } = req.query;

    const query = { role: "Student" };

    if (department) {
      query.department = department;
    }
    if (year) {
      // allow numeric or string values like "1", "first"
      const normalized = String(year).toLowerCase();
      if (["1", "first", "fy", "year1", "first year"].includes(normalized)) query.year = 1;
      else if (["2", "second", "sy", "year2", "second year"].includes(normalized)) query.year = 2;
      else if (["3", "third", "ty", "year3", "third year"].includes(normalized)) query.year = 3;
      else query.year = year; // fallback
    }

    // Text search by name or studentId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Prefer the student register collection; fallback to RegisterUser and then User
    let students = await RegisterStudent.find(query).select("-__v").sort({ createdAt: -1 });
    if (!students || students.length === 0) {
      students = await RegisterUser.find(query).select("-__v -password").sort({ createdAt: -1 });
      if (!students || students.length === 0) {
        students = await User.find(query).select("-password -__v").sort({ createdAt: -1 });
      }
    }
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ message: "Server error fetching students" });
  }
});

module.exports = router;
