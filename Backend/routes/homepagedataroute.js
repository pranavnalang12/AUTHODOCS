const express = require('express');
const { protect } = require('../middleware/middleware.js'); // your auth middleware
const router = express.Router();

// GET logged-in user info
router.get('/me', protect, async (req, res) => {
    try {
        const user = req.user; // set by protect middleware
        res.json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
