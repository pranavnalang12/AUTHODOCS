const User = require("../models/User");
const RegisterUser = require("../models/RegisterUser");
const RegisterStudent = require("../models/RegisterStudent");
const jwt = require("jsonwebtoken");

// ================== REGISTER ==================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, year, className } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Enforce staff whitelist and max count
    if (role === "Staff") {
      const envList = (process.env.STAFF_ALLOWED_EMAILS || "");
      const defaultList = "nalangpranav30@gmail.com,adityagurav@gmail.com,khushikumbhar@gmail.com";
      const allowed = (envList || defaultList)
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      if (!allowed.includes(email.toLowerCase())) {
        return res.status(403).json({ message: "This email is not authorized for Staff registration" });
      }

      const staffCount = await User.countDocuments({ role: "Staff" });
      if (staffCount >= 3) {
        return res.status(403).json({ message: "Staff registration limit reached" });
      }
    }

    // Generate custom student ID for students
    let studentId = null;
    if (role === "Student") {
      const lastStudent = await User.find({ role: "Student" }).sort({ createdAt: -1 }).limit(1);
      let nextNumber = 1;
      if (lastStudent.length > 0 && lastStudent[0].studentId) {
        const lastNum = parseInt(lastStudent[0].studentId.replace("STU", ""));
        nextNumber = lastNum + 1;
      }
      studentId = "STU" + nextNumber;
    }

    // Create new user
    const userData = { name, email, password, role, studentId };
    if (role === "Student") {
      // Enforce required student fields so staff list has full info
      if (!department || !year || !className) {
        return res.status(400).json({ message: "Department, year and class are required for Student registration" });
      }
      userData.department = department;
      userData.year = Number(year);
      userData.className = className;
    }
    const user = new User(userData);
    await user.save();

    // Mirror into registeruses collection for reporting
    try {
      // mirror all into registeruses (for history)
      await RegisterUser.create({
        studentId: user.studentId || null,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        department: user.department,
        year: user.year,
        className: user.className,
      });
      // mirror only students into registerstudent (for staff view)
      if (user.role === "Student") {
        await RegisterStudent.findOneAndUpdate(
          { email: user.email },
          {
            studentId: user.studentId || null,
            name: user.name,
            email: user.email,
            department: user.department,
            year: user.year,
            className: user.className,
          },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.warn("Warning: failed to mirror register data:", e.message);
    }

    res.status(201).json({ message: "User registered successfully", studentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Enforce staff whitelist on login
    if (user.role === "Staff") {
      const envList = (process.env.STAFF_ALLOWED_EMAILS || "");
      const defaultList = "nalangpranav30@gmail.com,adityagurav@gmail.com,khushikumbhar@gmail.com";
      const allowed = (envList || defaultList)
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      if (!allowed.includes(user.email.toLowerCase())) {
        return res.status(403).json({ message: "This email is not authorized for Staff login" });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "180h" });

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      studentId: user.studentId || null
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
