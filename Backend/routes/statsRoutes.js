const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const { protect, authorize } = require("../middleware/middleware");

// GET /api/stats/dashboard
router.get("/dashboard", protect, authorize("staff"), async (req, res) => {
  try {
    // Pending requests
    const pending = await Request.countDocuments({ status: "pending" });

    // Approved today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const approvedToday = await Request.countDocuments({
      status: "approved",
      updatedAt: { $gte: startOfToday },
    });

    // Most approved document type
    const topDocAgg = await Request.aggregate([
      { $match: { status: "approved" } },      // only approved requests
      { $group: { _id: "$type", count: { $sum: 1 } } },  // group by type and count
      { $sort: { count: -1 } },               // sort descending
      { $limit: 1 }                           // get top one
    ]);

    const topDocument = topDocAgg.length > 0 ? topDocAgg[0]._id : "—";

    res.json({ pending, approvedToday, topDocument });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
