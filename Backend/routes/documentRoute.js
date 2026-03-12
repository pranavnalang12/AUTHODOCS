const express = require("express");
const router = express.Router();
const {
  generateTransfer,
  generateLeaving,
  generateCharacter
} = require("../controllers/documentController");

// Routes
router.post("/transfer", generateTransfer);
router.post("/leaving", generateLeaving);
router.post("/character", generateCharacter);

module.exports = router;
