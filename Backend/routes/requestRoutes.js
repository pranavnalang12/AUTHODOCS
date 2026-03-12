const express = require("express");
const { protect, authorize } = require("../middleware/middleware");
const requestController = require("../controllers/requestController");

const router = express.Router();

// ---------------- Student routes ----------------
router.post("/", protect, authorize("Student"), requestController.createRequest); // Submit request
router.get("/mine", protect, authorize("Student"), requestController.getMyRequests); // Get student's own requests
router.get("/:id/download", protect, requestController.downloadDocument); // Download approved document

// ---------------- Staff routes ----------------
router.get("/", protect, authorize("Staff"), requestController.getAllRequests); // Get all requests
router.put("/:id", protect, authorize("Staff"), requestController.updateRequestStatus); // Approve/reject

module.exports = router;





