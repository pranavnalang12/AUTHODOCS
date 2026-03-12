const express = require("express");
const StudentDocument = require("../models/StudentDocument.js");
const { protect } = require("../middleware/middleware.js");

const router = express.Router();

/**
 * 📊 Student Dashboard Stats
 */
router.get("/stats", protect, async (req, res) => {
  try {
    const studentId = req.user.id;

    const approved = await StudentDocument.countDocuments({ userId: studentId, status: "Approved" });
    const pending = await StudentDocument.countDocuments({ userId: studentId, status: "Pending" });
    const rejected = await StudentDocument.countDocuments({ userId: studentId, status: "Rejected" });

    res.json({ success: true, approved, pending, rejected });
  } catch (err) {
    console.error("Error fetching student stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📄 Fetch student documents by status
 */
router.get("/documents", protect, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const query = { userId: studentId };
    if (status) query.status = status;

    const documents = await StudentDocument.find(query).sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (err) {
    console.error("Error fetching student documents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ➕ Optional: Request a new document
 */
router.post("/request", protect, async (req, res) => {
  try {
    const { docName } = req.body;

    const newDoc = new StudentDocument({
      userId: req.user.id,
      docName,
      status: "Pending",
    });

    await newDoc.save();
    res.json({ success: true, document: newDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
