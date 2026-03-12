
// controllers/requestController.js
const Request = require("../models/Request");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ----------------- generatePDF -----------------
// Generates a PDF certificate with fixed college + principal info
async function generatePDF(data, type, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const left = doc.page.margins.left;
      const right = pageWidth - doc.page.margins.right;
      const contentWidth = right - left;

      // ----------------- FIXED COLLEGE / PRINCIPAL INFO -----------------
      const collegeName = "S.R.M. College, Kudal";
      const university = "University of Mumbai";
      const address = "Kudal, Sindhudurg, Maharashtra";
      const contactLine = "Phone: 7666883592 | Email: srmcollege@gmail.com";
      const principalName = "Miss Smita Survase";
      const principalTitle = "Principal";

      // ----------------- PAGE BORDER -----------------
      doc.save()
        .lineWidth(6)
        .strokeColor("#000")
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .stroke();

      doc.lineWidth(1)
        .rect(35, 35, pageWidth - 70, pageHeight - 70)
        .stroke();

      doc.restore();

      // ----------------- HEADER -----------------
      const certNo = data.certificateNo || "N/A";
      const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
      const issueDateString = `${String(issueDate.getDate()).padStart(2, "0")}/${String(issueDate.getMonth()+1).padStart(2, "0")}/${issueDate.getFullYear()}`;

      // Top-right: Certificate No. and Date
      doc.fontSize(10).font("Helvetica")
        .text(`Certificate No: ${certNo}`, pageWidth - 250, 40, { width: 200, align: "right" })
        .text(`Date: ${issueDateString}`, { width: 200, align: "right" });

      // College heading (center)
      doc.moveDown(1);
      doc.fontSize(18).font("Helvetica-Bold").text(collegeName, left, doc.y, { width: contentWidth, align: "center" });
      doc.moveDown(0.1);
      doc.fontSize(10).font("Helvetica").text(`(Affiliated to ${university})`, left, doc.y, { width: contentWidth, align: "center" });
      doc.moveDown(0.1);
      doc.fontSize(9).text(address, left, doc.y, { width: contentWidth, align: "center" });
      doc.moveDown(0.1);
      doc.fontSize(9).text(contactLine, left, doc.y, { width: contentWidth, align: "center" });

      // horizontal rule
      doc.moveDown(0.5);
      doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();
      doc.moveDown(1);

      // ----------------- TITLE -----------------
      const titles = {
        transfer: "TRANSFER CERTIFICATE",
        character: "CHARACTER CERTIFICATE",
        leaving: "LEAVING CERTIFICATE",
        bonafide: "BONAFIDE CERTIFICATE",
      };
      const title = titles[type] || "CERTIFICATE";
      doc.fontSize(16).font("Helvetica-Bold").text(title, left, doc.y, { width: contentWidth, align: "center" });
      doc.moveDown(1);

      // ----------------- BODY -----------------
      // Helper to draw left-aligned paragraphs inside contentWidth
      function leftPara(text, moveDown = 0.6) {
        doc.font("Helvetica").fontSize(11).text(text, left, doc.y, { width: contentWidth, align: "left" });
        doc.moveDown(moveDown);
      }

      // Helper for bold label + value
      function kv(label, value) {
        doc.font("Helvetica-Bold").fontSize(11).text(label, { continued: true });
        doc.font("Helvetica").fontSize(11).text(` ${value || ""}`);
      }

      if (type === "transfer" || type === "leaving") {
        // For completeness keep original transfer/leaving behavior
        leftPara(`This is to certify that Mr./Ms. ${data.studentName || "[Full Name]"}, Son/Daughter of Mr. ${data.fatherName || "[Father's Name]"} and Mrs. ${data.motherName || "[Mother's Name]"}, was a student of this college.`);

        const items = [
          { label: "Date of Birth (as per college records):", value: data.dob },
          { label: "Nationality:", value: data.nationality || "Indian" },
          { label: "Course of Study:", value: data.course },
          { label: "Date of Admission to the College:", value: data.admissionDate },
          { label: "Last Class/Semester Studied:", value: data.lastClass },
          { label: "University last enrolled:", value: data.university || university },
          { label: "Whether qualified for promotion to a higher class:", value: data.qualifiedForPromotion },
          { label: "Whether all dues to the college have been paid:", value: data.duesPaid === false ? "No" : "Yes" },
          { label: "Reason for leaving the college:", value: data.reason },
          { label: "Date of leaving the college:", value: data.leavingDate },
          { label: "Conduct and Character:", value: data.conduct || "Good" },
          { label: "General Remarks (if any):", value: data.remarks || "None" },
        ];

        items.forEach(it => {
          kv(it.label, it.value);
          doc.moveDown(0.4);
        });

        leftPara("We wish him/her all the best for his/her future endeavors.", 1);
      } else if (type === "character") {
        leftPara(`This is to certify that I have known Mr./Ms. ${data.studentName || "[Full Name]"}, Son/Daughter of Mr. ${data.fatherName || "[Father's Name]"}, for the past ${data.yearsKnown || "[Number]"} years and ${data.monthsKnown || "[Number]"} months as a student of this college in the ${data.course || "[Course Name]"} program from ${data.startYear || "[Start Year]"} to ${data.endYear || "[End Year]"}.`);

        leftPara("To the best of my knowledge and belief, he/she bears a reputable moral character and has no antecedents that would render him/her unsuitable for admission to any institute of higher learning.");
        leftPara("During his/her time at this college, his/her conduct has been consistently satisfactory.");
        leftPara("He/She is not related to me.");
        leftPara("I wish him/her every success in life.");
      } else if (type === "bonafide") {
        // Bonafide layout similar to the image (no passport photo)
        // Pull fields (with sensible defaults)
        const studentName = data.studentName || "[Full Name]";
        const fatherName = data.fatherName || "";
        const motherName = data.motherName || "";
        const className = data.className || data.course || "";
        const academicYear = data.year || data.academicYear || "";
        const birthDate = data.birthDate || data.dob || "";
        const conduct = (data.conduct && data.conduct.trim()) ? data.conduct : "Good";
        const remark = data.remark || data.remarks || data.purpose || "";
        const place = data.place || "Kudal";
        const issueDateLocal = data.issueDate ? new Date(data.issueDate) : new Date();
        const issueDateFormatted = `${String(issueDateLocal.getDate()).padStart(2,"0")}/${String(issueDateLocal.getMonth()+1).padStart(2,"0")}/${issueDateLocal.getFullYear()}`;

        // Main bonafide paragraph(s)
        leftPara(`This is to certify that Mr./Ms. ${studentName} ${fatherName ? `S/o ${fatherName}` : ''}${motherName && !fatherName ? `D/o ${motherName}` : ''} is/was a bonafide student of ${collegeName}, affiliated to ${university}, studying in ${className || "[Course/Class]"} during the academic year ${academicYear || "[Year]"}.`);
        leftPara(`His/Her date of birth as per college records is ${birthDate || "[DOB]"}.`);
        leftPara(`His/Her conduct in the college was ${conduct} and attendance was regular.`);

        if (remark) {
          leftPara(`Remark: ${remark}`);
        }

        leftPara("", 1); // small gap before signature line

        // Place and Date on the left/bottom area
        // Draw seal box on left and signature block on right
        const footerY = pageHeight - 170;
        // Seal rectangle (left)
        doc.rect(left, footerY, 120, 50).stroke();
        doc.font("Helvetica").fontSize(10).text("(Seal of the College)", left + 10, footerY + 18);

        // Signature block on right
        const sigBlockX = right - 220;
        const sigBlockWidth = 220;
        // Place and date text above signature
        doc.font("Helvetica").fontSize(10).text(`Place: ${place}`, sigBlockX, footerY + 6, { width: sigBlockWidth, align: "left" });
        doc.font("Helvetica").fontSize(10).text(`Date: ${issueDateFormatted}`, sigBlockX, footerY + 22, { width: sigBlockWidth, align: "left" });

        // Signature lines
        doc.font("Helvetica").fontSize(11).text("Signature", sigBlockX, footerY + 38, { width: sigBlockWidth, align: "left" });
        doc.font("Helvetica-Bold").fontSize(11).text(principalName, sigBlockX, footerY + 52, { width: sigBlockWidth, align: "left" });
        doc.font("Helvetica").fontSize(10).text(principalTitle, sigBlockX, footerY + 66, { width: sigBlockWidth, align: "left" });

        // end - skip adding another footer later
        doc.end();
        stream.on("finish", () => resolve());
        stream.on("error", (err) => reject(err));
        return;
      } else {
        leftPara("Unknown Document Type");
      }

      // ----------------- FOOTER (for non-bonafide types) -----------------
      const sealY = pageHeight - 150;
      doc.rect(left, sealY, 120, 50).stroke();
      doc.font("Helvetica").fontSize(10).text("(Seal of the College)", left + 10, sealY + 18);

      // Signature (right)
      doc.font("Helvetica").fontSize(11).text("Signature", { align: "right" });
      doc.moveDown(0.6);
      doc.font("Helvetica-Bold").fontSize(11).text(principalName, { align: "right" });
      doc.font("Helvetica").fontSize(10).text(principalTitle, { align: "right" });
      doc.font("Helvetica").fontSize(10).text(collegeName, { align: "right" });

      // finalize
      doc.end();

      stream.on("finish", () => resolve());
      stream.on("error", (err) => reject(err));
    } catch (err) {
      return reject(err);
    }
  });
}

// -------------------- STUDENT REQUEST ROUTES --------------------

// Student submits request
exports.createRequest = async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) return res.status(400).json({ message: "Type and data required" });

    const request = new Request({ type, data, createdBy: req.user._id });
    await request.save();

    // Emit new request event (for dashboards)
    try { const io = req.app.get("io"); if (io) io.emit("newRequest", { request }); } catch (_) { }

    res.status(201).json({ message: "Request submitted successfully", request });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error creating request", error: err.message }); }
};

// Get student's requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { console.error(err); res.status(500).json({ message: "Error fetching requests" }); }
};

// Staff: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { console.error(err); res.status(500).json({ message: "Error fetching requests" }); }
};

// Staff: Approve/Reject request
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.approvedBy = req.user._id;

    if (status === "approved") {
      const outputDir = path.join(__dirname, "../generated");
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      if (!request.data) request.data = {};
      if (!request.data.issueDate) request.data.issueDate = new Date().toISOString();
      if (!request.data.certificateNo) {
        const dt = new Date();
        const yy = dt.getFullYear().toString().slice(-2);
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const suffix = request._id.toString().slice(-4).toUpperCase();
        request.data.certificateNo = `SRMC-${yy}${mm}${dd}-${suffix}`;
      }

      const fileName = `${request.type}-${request._id}.pdf`;
      const filePath = path.join(outputDir, fileName);

      await generatePDF(request.data, request.type, filePath);
      request.documentUrl = `generated/${fileName}`;
    }

    await request.save();
    // Emit request status update event
    try { const io = req.app.get("io"); if (io) io.emit("requestUpdated", { request }); } catch (_) { }

    res.json({ message: `Request ${status}`, request });
  } catch (err) { console.error(err); res.status(500).json({ message: "Error updating request", error: err.message }); }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (req.user.role && req.user.role.toLowerCase() === "student" && request.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
    if (request.status !== "approved" || !request.documentUrl) return res.status(400).json({ message: "Document not available yet" });

    const filePath = path.join(__dirname, "..", request.documentUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

    request.downloadCount = (request.downloadCount || 0) + 1;
    await request.save();

    res.download(filePath);
  } catch (err) { console.error(err); res.status(500).json({ message: "Error downloading document", error: err.message }); }
};
