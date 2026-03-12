// controllers/staffAuthController.js
const jwt = require("jsonwebtoken");

// POST /api/staff/login
exports.staffLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // compare with fixed cred from .env
  if (
    email === process.env.STAFF_EMAIL &&
    password === process.env.STAFF_PASSWORD
  ) {
    // create JWT that identifies staff
    const token = jwt.sign(
      { email, role: "staff" },            // payload: no DB id for staff
      process.env.JWT_SECRET,
      { expiresIn: "180h" }
    );

    return res.status(200).json({
      message: "Staff login successful",
      token,
      role: "staff",
      email
    });
  }

  return res.status(401).json({ message: "Invalid staff credentials" });
};
