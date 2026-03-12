// routes/showRoute.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/middleware"); // ✅ make sure file name matches

// GET logged-in user info
router.get("/showRoute", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: req.user._id,
        fullName: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("ShowRoute error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
