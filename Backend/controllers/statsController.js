const Request = require("../models/Request");
const Document = require("../models/Document");

exports.getDashboardStats = async (req, res) => {
  try {
    // Count pending requests
    const pending = await Request.countDocuments({ status: "pending" });

    // Count approved today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const approvedToday = await Request.countDocuments({
      status: "approved",
      updatedAt: { $gte: startOfToday }
    });

    // Most retrieved document
    const topDocAgg = await Document.aggregate([
      { $group: { _id: "$docName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topDocument = topDocAgg[0]?._id || "—";

    res.json({ pending, approvedToday, topDocument });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
