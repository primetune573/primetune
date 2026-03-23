import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BUSINESS_DETAILS } from "@/constants/business";

export const generateInvoicePDF = (booking: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // --- Header Section ---
    // Business Logo (Left)
    try {
        // Use the logo.png from the public folder with correct aspect ratio (1890:801 ≈ 2.36)
        const logoWidth = 50;
        const logoHeight = logoWidth / 2.3595; // calculated from 1890/801
        doc.addImage("/logo.png", "PNG", margin, 10, logoWidth, logoHeight);
    } catch (e) {
        // Fallback to text if logo fails to load (e.g. server-side vs client-side issues)
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38);
        doc.setFont("helvetica", "bold");
        doc.text(BUSINESS_DETAILS.logoText, margin, 25);
    }

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(BUSINESS_DETAILS.tagline, margin, 52);

    doc.setFontSize(9);
    doc.text(BUSINESS_DETAILS.address, margin, 60);
    doc.text(`Phone: ${BUSINESS_DETAILS.phone}`, margin, 65);
    doc.text(`Email: ${BUSINESS_DETAILS.email}`, margin, 70);

    // Invoice Meta (Right)
    doc.setFontSize(28);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin - 50, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${booking["Booking Number"]}`, pageWidth - margin - 50, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 40);
    doc.text(`Job Date: ${booking["Date"]}`, pageWidth - margin - 50, 45);

    // --- Divider Line ---
    doc.setDrawColor(230);
    doc.line(margin, 75, pageWidth - margin, 75);

    // --- Customer & Vehicle Details ---
    // Customer Info (Left)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", margin, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(booking["Customer"] || "Walking Customer", margin, 92);
    doc.text(booking["Phone"] || "", margin, 97);
    doc.text(booking["Email"] || "", margin, 102);

    // Vehicle Info (Right)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VEHICLE DETAILS:", pageWidth / 2, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Model: ${booking["Vehicle"] || "N/A"}`, pageWidth / 2, 92);
    doc.setFont("helvetica", "bold");
    doc.text(`Plate Number: ${booking["Plate"] || "N/A"}`, pageWidth / 2, 98);
    doc.setFont("helvetica", "normal");
    doc.text(`Duration: ${booking["Duration (hrs)"]} Hours`, pageWidth / 2, 104);

    // --- Services/Items Table ---
    const tableData: any[] = [];

    // 1. Labor Charge Row
    const originalLabor = parseFloat(booking["Original Labor"] || booking["Total Price"] || "0");
    const laborDiscount = booking["Discount Type"] && booking["Discount Type"] !== 'none'
        ? (booking["Discount Type"] === 'percentage'
            ? `${booking["Discount Value"]}% Off`
            : `LKR ${booking["Discount Value"].toLocaleString()} Off`)
        : "-";
    const finalLabor = parseFloat(booking["Final Labor"] || booking["Total Price"] || "0");

    tableData.push([
        1,
        `Labor Charge: ${booking["Services"] || "Service"}`,
        "1",
        `LKR ${originalLabor.toLocaleString()}`,
        laborDiscount,
        `LKR ${finalLabor.toLocaleString()}`
    ]);

    // 2. Extra Parts/Items Rows
    const extraParts = booking["Extra Items"] || [];
    extraParts.forEach((part: any, idx: number) => {
        tableData.push([
            idx + 2,
            part.name,
            part.qty,
            `LKR ${part.unitPrice.toLocaleString()}`,
            "-",
            `LKR ${(part.qty * part.unitPrice).toLocaleString()}`
        ]);
    });

    autoTable(doc, {
        startY: 115,
        head: [['#', 'Item / Description', 'Qty', 'Unit Price', 'Discount', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15 },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 30, halign: 'right' }
        }
    });

    // --- Summary Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE LABOR TOTAL:", pageWidth - margin - 80, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`LKR ${parseFloat(booking["Final Labor"] || booking["Total Price"] || "0").toLocaleString()}`, pageWidth - margin, finalY, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.text("PARTS & MATERIALS TOTAL:", pageWidth - margin - 80, finalY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(`LKR ${parseFloat(booking["Parts Total"] || "0").toLocaleString()}`, pageWidth - margin, finalY + 7, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(pageWidth - margin - 80, finalY + 11, pageWidth - margin, finalY + 11);

    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", pageWidth - margin - 80, finalY + 18);
    doc.text(`LKR ${parseFloat(booking["Final Total"] || booking["Total Price"] || "0").toLocaleString()}`, pageWidth - margin, finalY + 18, { align: 'right' });

    // --- Status Section ---
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(margin, finalY + 5, 50, 20);
    doc.setFontSize(12);
    doc.text("STATUS: PAID", margin + 10, finalY + 17);

    // --- Footer Section ---
    const footerY = 245; // Move footer up for better visibility
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Terms & Conditions
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", margin, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("1. The company is not responsible for the car after 3 days of the completion of the repair of the car.", margin, footerY + 10);
    doc.text("2. Warranty of general mechanical and electrical repairs is 3 days from delivery.", margin, footerY + 15);
    doc.text("3. This invoice is generated automatically upon service completion.", margin, footerY + 20);

    doc.setFontSize(11); // Professional signature message
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("Thank you for choosing PrimeTune Automotive!", margin, footerY + 30);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text(BUSINESS_DETAILS.website, pageWidth - margin, footerY + 30, { align: 'right' });

    // --- Save File ---
    const filename = `${booking["Booking Number"] || "INV"}-${(booking["Customer"] || "Customer").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
};
