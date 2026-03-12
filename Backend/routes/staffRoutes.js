// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const { staffLogin } = require("../controllers/staffAuthController");

// Staff login (fixed credentials)
router.post("/login", staffLogin);

module.exports = router;
