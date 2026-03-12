const PDFDocument = require("pdfkit");

// Transfer
exports.generateTransfer = (req, res) => {
  const { collegeName, studentName, className, department, dob, reason } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Transfer_Certificate.pdf");

  doc.pipe(res);

  doc.fontSize(20).text(`${collegeName}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text("TRANSFER CERTIFICATE", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(`This is to certify that Mr./Ms. ${studentName}, born on ${dob}, was a student of this institution in class ${className}, Department of ${department}.`);
  doc.moveDown();
  doc.text(`He/She is being granted this transfer certificate due to: ${reason}.`);

  doc.end();
};

// Leaving
exports.generateLeaving = (req, res) => {
  const { collegeName, studentName, className, department, dob, reason } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Leaving_Certificate.pdf");

  doc.pipe(res);

  doc.fontSize(20).text(`${collegeName}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text("LEAVING CERTIFICATE", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(`This is to certify that Mr./Ms. ${studentName}, born on ${dob}, has been a student of ${collegeName}, class ${className}, Department of ${department}.`);
  doc.moveDown();
  doc.text(`Reason for leaving: ${reason}.`);

  doc.end();
};

// Character
exports.generateCharacter = (req, res) => {
  const { collegeName, studentName, className, department, dob, character } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Character_Certificate.pdf");

  doc.pipe(res);

  doc.fontSize(20).text(`${collegeName}`, { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text("CHARACTER CERTIFICATE", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(12).text(`This is to certify that Mr./Ms. ${studentName}, born on ${dob}, is/was a student of class ${className}, Department of ${department}, at ${collegeName}.`);
  doc.moveDown();
  doc.text(`His/Her character is found to be: ${character}.`);

  doc.end();
};
