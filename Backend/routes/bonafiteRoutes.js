const express = require("express");
const router = express.Router();
const { generateBonafide } = require("../controllers/bonafiteController");

router.post("/bonafide", generateBonafide);

module.exports = router;
