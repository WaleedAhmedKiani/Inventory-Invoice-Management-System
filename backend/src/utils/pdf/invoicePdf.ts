import PDFDocument from "pdfkit";

export const generateInvoicePdf = (invoice: any) => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers: any[] = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // --- Header & Status ---
    doc.fillColor("#444444").fontSize(20).text("INVOICE", { align: "right" });
    
    // Add Status Badge-like text
    const statusColor = invoice.status === "CANCELLED" ? "#e11d48" : "#16a34a";
    doc.fillColor(statusColor).fontSize(10).text(invoice.status, { align: "right" });
    
    doc.fillColor("#444444").text(`ID: ${invoice.id}`, { align: "right" });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: "right" });
    doc.moveDown();

    // --- Bill To ---
    doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold").text("BILL TO:");
    doc.font("Helvetica").fontSize(10);
    doc.text(invoice.customer.name);
    doc.text(invoice.customer.email || "");
    doc.text(invoice.customer.address || ""); // Added address from your API 
    doc.moveDown();

    // --- Table Header ---
    const tableTop = 200;
    doc.font("Helvetica-Bold");
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 280, tableTop, { width: 50, align: "right" });
    doc.text("Price", 350, tableTop, { width: 70, align: "right" });
    doc.text("Total", 450, tableTop, { width: 100, align: "right" });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // --- Items ---
    let y = tableTop + 30;
    doc.font("Helvetica");
    
    invoice.items.forEach((item: any) => {
      doc.text(item.productName, 50, y);
      doc.text(item.quantity.toString(), 280, y, { width: 50, align: "right" });
      doc.text(`$${item.price.toFixed(2)}`, 350, y, { width: 70, align: "right" });
      doc.text(`$${item.lineTotal.toFixed(2)}`, 450, y, { width: 100, align: "right" });
      y += 20;
    });

    // --- Financial Summary Section ---
    const summaryX = 350;
    let currentY = y + 20;
    
    doc.moveTo(350, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    // Subtotal
    doc.fontSize(10).text("Subtotal:", summaryX, currentY);
    doc.text(`$${invoice.financials.subtotal.toFixed(2)}`, 450, currentY, { align: "right" });

    // Discount (only if exists)
    if (invoice.financials.discount > 0) {
      currentY += 15;
      doc.fillColor("#e11d48").text("Discount:", summaryX, currentY);
      doc.text(`-$${invoice.financials.discount.toFixed(2)}`, 450, currentY, { align: "right" });
      doc.fillColor("#000000");
    }

    // Tax
    currentY += 15;
    doc.text("Tax:", summaryX, currentY);
    doc.text(`$${invoice.financials.tax.toFixed(2)}`, 450, currentY, { align: "right" });

    // Grand Total
    currentY += 25;
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Total Amount:", summaryX, currentY);
    doc.text(`$${invoice.financials.total.toFixed(2)}`, 450, currentY, { align: "right" });

    // --- Footer Note ---
    doc.fontSize(8).font("Helvetica-Oblique")
       .fillColor("#777777")
       .text("Thank you for your business!", 50, 700, { align: "center" });

    doc.end();
  });
};