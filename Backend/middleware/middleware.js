// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------- PROTECT ----------------
const protect = async (req, res, next) => {
  let token = null;

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("AUTH: decoded token payload:", decoded);

    // Staff token (from staff login flow)
    if (decoded.role === "Staff" && decoded.email) {
      req.user = { email: decoded.email, role: "Staff" };
      console.log("AUTH: attached staff user:", req.user);
      return next();
    }

    // Student/other user (lookup in DB)
    if (decoded.id) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;
      console.log("AUTH: attached db user:", {
        id: req.user._id,
        role: req.user.role,
        email: req.user.email,
      });
      return next();
    }

    return res.status(401).json({ message: "Invalid token payload" });
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ---------------- AUTHORIZE ----------------
/**
 * authorize - restricts by role(s)
 * Usage: authorize("Student") or authorize("Staff")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "User role not found" });
    }

    // Normalize both sides to lowercase
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: `User role "${req.user.role}" is not authorized` });
    }

    next();
  };
};

module.exports = { protect, authorize };
