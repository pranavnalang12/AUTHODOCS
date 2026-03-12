const PDFDocument = require("pdfkit");

exports.generateBonafide = (req, res) => {
  const {
    studentName,
    fatherName,
    place,
    date,
    number,
    year,
    className,
    department,
    dob,
    conduct,
    attendance,
    remark,
    principalName,
  } = req.body;

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=Bonafide_Certificate.pdf");

  doc.pipe(res);

  // Header
  doc.fontSize(14).text("K.M.S.P. MANDAL’S", { align: "center" });
  doc.fontSize(18).text("SANT RAWOOL MAHARAJ MAHAVIDYALAYA", { align: "center", underline: true });
  doc.fontSize(12).text("(AFFILIATED TO THE UNIVERSITY OF MUMBAI)", { align: "center" });
  doc.fontSize(12).text("KUDAL, DIST: SINDHUDURG", { align: "center" });
  doc.fontSize(10).text("Accredited by NAAC: 'B' Grade", { align: "center" });

  doc.moveDown(2);

  // Number
  doc.text(`No.: ${number || ""}`, { align: "left" });

  doc.moveDown(1);

  // Certificate Body
  doc.fontSize(12).text(
    `This is to certify that Shri/Kumari ${studentName}, S/o/D/o ${fatherName}, 
is/was a bonafide student of this college studying in ${className} ${department} 
during the year ${year}. His/Her Conduct was ${conduct || "good"} and attendance ${attendance || "regular"}. 
His/Her Birth date as per our register is ${dob}.`
  );

  doc.moveDown(1);

  doc.text(`Any other Remark: ${remark || ""}`);

  doc.moveDown(3);

  // Place & Date
  doc.text(`Place: ${place || ""}`, { continued: true }).text(`\t\t\tDate: ${date || ""}`);

  doc.moveDown(4);

  // Principal
  doc.text("PRINCIPAL", { align: "right" });
  doc.text(`${principalName || "Sant Rawool Maharaj Mahavidyalaya"}`, { align: "right" });

  doc.end();
};
