
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const Document = require("../models/document.model");
// const { protect } = require("../middleware/middleware"); // JWT auth

// // ===== Multer setup =====
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });

// // ===== Upload Document =====
// router.post("/upload", protect, upload.single("document"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: "File is required" });

//     const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

//     const newDoc = await Document.create({
//       userId: req.user._id,
//       docName: req.body.docName,
//       fileName: req.file.filename,
//       fileUrl,
//       fileType: req.file.mimetype,
//       deleted: false,
//     });

//     res.json({ success: true, document: newDoc });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

// // ===== Get Documents by User =====
// router.get("/user/:userId", protect, async (req, res) => {
//   try {
//     // Ensure user only accesses their own documents
//     if (req.user._id.toString() !== req.params.userId) {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }

//     const docs = await Document.find({ userId: req.params.userId, deleted: false }).sort({ createdAt: -1 });

//     // Filter out missing files
//     const existingDocs = docs.filter(doc =>
//       fs.existsSync(path.join(__dirname, "../uploads", doc.fileName))
//     );

//     res.json({ success: true, documents: existingDocs });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

// // ===== Download Document =====
// router.get("/download/:fileName", protect, async (req, res) => {
//   const filePath = path.join(__dirname, "../uploads", req.params.fileName);

//   if (!fs.existsSync(filePath)) {
//     // Soft-delete missing file
//     await Document.findOneAndUpdate({ fileName: req.params.fileName }, { deleted: true });
//     return res.status(404).json({ success: false, message: "File not found on server" });
//   }

//   res.download(filePath, err => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ success: false, message: "Download failed" });
//     }
//   });
// });

// // ===== Soft-delete Document =====
// router.delete("/delete/:id", protect, async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

//     doc.deleted = true;
//     await doc.save();

//     res.json({ success: true, message: "Document deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;





// routes/documents.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/document.model");
const { protect } = require("../middleware/middleware"); // JWT auth

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ===== Upload Document =====
router.post("/upload", protect, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File is required" });

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const newDoc = await Document.create({
      userId: req.user._id || req.user.id,
      docName: req.body.docName,
      fileName: req.file.filename,
      fileUrl,
      fileType: req.file.mimetype,
      deleted: false,
    });

    res.json({ success: true, document: newDoc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ===== Get Documents for authenticated user (me) =====
router.get("/user/me", protect, async (req, res) => {
  try {
    const userId = req.user._id ? req.user._id.toString() : String(req.user.id);

    const docs = await Document.find({ userId, deleted: false }).sort({ createdAt: -1 });

    // Filter out missing files and soft-delete missing files in DB
    const existingDocs = [];
    for (const doc of docs) {
      const fullPath = path.join(__dirname, "../uploads", doc.fileName);
      if (fs.existsSync(fullPath)) {
        existingDocs.push(doc);
      } else {
        // Mark missing file as deleted in DB (best-effort)
        try {
          await Document.findByIdAndUpdate(doc._id, { deleted: true });
        } catch (e) {
          console.warn("Failed to mark missing file deleted:", doc._id, e);
        }
      }
    }

    res.json({ success: true, documents: existingDocs });
  } catch (err) {
    console.error("Fetch /user/me error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ===== (Optional) Keep param route but make comparison robust =====
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const tokenUserId = req.user._id ? req.user._id.toString() : String(req.user.id);
    if (tokenUserId !== req.params.userId) {
      console.log(`Auth mismatch: tokenUserId=${tokenUserId} param=${req.params.userId}`);
      return res.status(403).json({ success: false, message: "Not authorized — user mismatch" });
    }
    // Reuse logic from /user/me
    const docs = await Document.find({ userId: tokenUserId, deleted: false }).sort({ createdAt: -1 });
    const existingDocs = docs.filter(doc => fs.existsSync(path.join(__dirname, "../uploads", doc.fileName)));
    res.json({ success: true, documents: existingDocs });
  } catch (err) {
    console.error("Fetch /user/:userId error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ===== Download Document (only owner) =====
router.get("/download/:fileName", protect, async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "../uploads", fileName);

    const doc = await Document.findOne({ fileName });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document record not found" });
    }

    const tokenUserId = req.user._id ? req.user._id.toString() : String(req.user.id);
    const docUserId = doc.userId ? doc.userId.toString() : String(doc.userId);

    if (tokenUserId !== docUserId) {
      return res.status(403).json({ success: false, message: "Not authorized to download this file" });
    }

    if (!fs.existsSync(filePath)) {
      // Soft-delete missing file
      await Document.findOneAndUpdate({ fileName }, { deleted: true });
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    res.download(filePath, doc.fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) res.status(500).json({ success: false, message: "Download failed" });
      }
    });
  } catch (err) {
    console.error("Download route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== Soft-delete Document =====
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const tokenUserId = req.user._id ? req.user._id.toString() : String(req.user.id);
    const docUserId = doc.userId ? doc.userId.toString() : String(doc.userId);

    if (tokenUserId !== docUserId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this document" });
    }

    doc.deleted = true;
    await doc.save();

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
