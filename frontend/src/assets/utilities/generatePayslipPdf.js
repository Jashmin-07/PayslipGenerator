import jsPDF from "jspdf";
import { notoSansRegular } from "../fonts/Noto_Sans/static/NotoSans-Regular.ttf";

// import NotoSans from "../fonts/Noto_Sans/static/NotoSans_Condensed-Bold.ttf";
jsPDF.API.events.push([
  "addFonts",
  function () {
    this.addFileToVFS("NotoSansCondensed-Bold.ttf", notoSansRegular);
    this.addFont("NotoSansCondensed-Bold.ttf", "notoSansRegular", "normal");
  },
]);
export function generatePayslipPdf({
  form,
  extraFields,
  logoPreview,
  grossEarnings,
  totalDeductions,
  totalNetPayable,
  netPayInWords,
  onFinish
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  const finishPdf = () => {
    _generatePDFInner(
      doc,
      pageWidth,
      form,
      extraFields,
      grossEarnings,
      totalDeductions,
      totalNetPayable,
      netPayInWords
    );
    if (onFinish) onFinish();
  };

  if (logoPreview) {
    const image = new window.Image();
    image.src = logoPreview;
    image.onload = () => {
      try {
        doc.addImage(image, "PNG", 13, 12, 30, 20);
      } catch (_) {}
      finishPdf();
    };
    image.onerror = finishPdf;
  } else {
    finishPdf();
  }
}

function _generatePDFInner(
  doc,
  pageWidth,
  form,
  extraFields,
  grossEarnings,
  totalDeductions,
  totalNetPayable,
  netPayInWords
) {
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont("notoSansRegular", "normal");
  // doc.setFont("helvetica", "bold");
  doc.text(form.companyName || "-", 47, 17);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(form.companyAddress || "-", 47, 23);
  doc.text((form.secondLine || "") + "", 47, 28);
  doc.text((form.country || "-"), 47, 32);
  doc.text((form.cityPin || "-"), 47, 36);

  doc.setFontSize(10);
  doc.text("Payslip for Month", pageWidth - 70, 17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(72, 185, 107);
  doc.setFontSize(18);
  const payPeriodStr = form.payPeriod
    ? new Date(form.payPeriod + "-01").toLocaleString("default", { month: "long", year: "numeric" })
    : "-";
  doc.text(payPeriodStr, pageWidth - 70, 27);

  doc.setDrawColor(128);
  doc.setLineWidth(0.4);
  doc.line(10, 41, pageWidth - 10, 41);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const columnLeft = 15, columnColon = 58, columnValue = 68;
  let startY = 48, stepY = 7;
  const empRows = [
    ["Employee Name", form.employeeName || ""],
    ["Employee Id", form.employeeId || ""],
    ["Joining Date", form.joiningDate || ""],
    ["Contact", form.contact || ""],
    [
      "Pay Period",
      form.payPeriod
        ? new Date(form.payPeriod + "-01").toLocaleString("default", { month: "long", year: "numeric" })
        : ""
    ],
    ["Pay Date", form.payDate || "-"]
  ];
  let currentY = startY;
  for (let i = 0; i < empRows.length; ++i) {
    doc.text(empRows[i][0], columnLeft, currentY);
    doc.text(":", columnColon, currentY);
    doc.text(empRows[i][1], columnValue, currentY);
    currentY += stepY;
  }
  for (const fld of extraFields) {
    if (fld.label || fld.value) {
      doc.text(fld.label || "-", columnLeft, currentY);
      doc.text(":", columnColon, currentY);
      doc.text(fld.value || "-", columnValue, currentY);
      currentY += stepY;
    }
  }

  // Net Pay Info
  doc.setFillColor(243, 245, 248);
  doc.roundedRect(pageWidth - 75, startY, 65, 32, 6, 6, "F");
  doc.setFontSize(21);
  doc.setFont("courier", "bold"); // UNICODE FRIENDLY
  doc.setTextColor(20, 125, 35);
  doc.text(`${form.currencySymbol}${totalNetPayable}/-`, pageWidth - 72, startY + 13);

  doc.setTextColor(70, 70, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Employee Net Pay", pageWidth - 72, startY + 19);
  doc.text(
    `Paid Days: ${form.paidDays || "-"}   LOP Days: ${form.lossOfPayDays || "-"}`,
    pageWidth - 72,
    startY + 27
  );

  doc.setDrawColor(128);
  doc.setLineWidth(0.2);
  doc.line(10, currentY + 10, pageWidth - 10, currentY + 10);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Income Details*", 15, currentY + 18);
  doc.setFontSize(11);
  doc.text("Earnings", 18, currentY + 28);
  doc.text("Amounts", 67, currentY + 28);
  doc.text("Deductions", 112, currentY + 28);
  doc.text("Amounts", pageWidth - 34, currentY + 28);

  let eRowY = currentY + 34, dRowY = currentY + 34;
  for (let i = 0; i < Math.max(form.earnings.length, form.deductions.length); i++) {
    doc.setFont("helvetica", "normal");
    if (form.earnings[i]) {
      doc.text(form.earnings[i].name, 18, eRowY);
      doc.setFont("courier", "normal");
      doc.text(`${form.currencySymbol} ${form.earnings[i].amount || ""}/-`, 67, eRowY, { align: "right" });
    }
    if (form.deductions[i]) {
      doc.setFont("helvetica", "normal");
      doc.text(form.deductions[i].name, 112, dRowY);
      doc.setFont("courier", "normal");
      doc.text(`${form.currencySymbol} ${form.deductions[i].amount || ""}/-`, pageWidth - 34, dRowY, { align: "right" });
    }
    eRowY += 7;
    dRowY += 7;
  }

  let totalSectionY = Math.max(eRowY, dRowY) + 5;
  doc.setFont("helvetica", "bold"); // Section label
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(18, totalSectionY, 73, 16, 6, 6, "F");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text("Gross Earnings", 22, totalSectionY + 10);

  doc.setFont("courier", "bold");
  doc.setTextColor(33, 135, 52);
  doc.setFontSize(13);
  doc.text(`${form.currencySymbol} ${grossEarnings}/-`, 82, totalSectionY + 10, { align: "right" });

  doc.setFont("helvetica", "bold"); // Section label
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(112, totalSectionY, 73, 16, 6, 6, "F");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text("Total Deductions", 116, totalSectionY + 10);

  doc.setFont("courier", "bold"); // Red currency
  doc.setTextColor(233, 68, 57);
  doc.setFontSize(13);
  doc.text(`${form.currencySymbol} ${totalDeductions}/-`, 182, totalSectionY + 10, { align: "right" });

  doc.setTextColor(0, 0, 0);

  let netY = totalSectionY + 25;
  doc.setFontSize(17);
  doc.setTextColor(0, 0, 0);
  doc.setFont("courier", "bold");
  doc.text(
    `Total Net Payable : ${form.currencySymbol}${totalNetPayable}/-`,
    pageWidth / 2, netY, { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  netY += 8;
  doc.text(
    `Rupees in Words: ${netPayInWords()}`,
    pageWidth / 2, netY, { align: "center" }
  );
  netY += 7;
  doc.setFontSize(8);
  doc.text(
    `( Total Net Payable = Gross Earnings – Total Deductions )`,
    pageWidth / 2, netY, { align: "center" }
  );

  doc.save(`${form.employeeName || "Payslip"}_Payslip.pdf`);
}





