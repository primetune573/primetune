import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BUSINESS_DETAILS } from "@/constants/business";

export const generateInvoicePDF = (booking: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // --- Header Section ---
    // Business Info (Left)
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Primary Color (approximate Red)
    doc.setFont("helvetica", "bold");
    doc.text(BUSINESS_DETAILS.logoText, margin, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(BUSINESS_DETAILS.tagline, margin, 32);

    doc.setFontSize(9);
    doc.text(BUSINESS_DETAILS.address, margin, 42);
    doc.text(`Phone: ${BUSINESS_DETAILS.phone}`, margin, 47);
    doc.text(`Email: ${BUSINESS_DETAILS.email}`, margin, 52);

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
    doc.line(margin, 60, pageWidth - margin, 60);

    // --- Customer & Vehicle Details ---
    // Customer Info (Left)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", margin, 75);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(booking["Customer"] || "Walking Customer", margin, 82);
    doc.text(booking["Phone"] || "N/A", margin, 87);
    doc.text(booking["Email"] || "N/A", margin, 92);

    // Vehicle Info (Right)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VEHICLE:", pageWidth / 2, 75);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(booking["Vehicle"] || "N/A", pageWidth / 2, 82);
    doc.text(`Duration: ${booking["Duration (hrs)"]} Hours`, pageWidth / 2, 87);

    // --- Services Table ---
    const services = booking["Services"] ? booking["Services"].split(", ") : ["Service Charge"];
    const tableData = services.map((service: string, index: number) => {
        // Since we only have total price, we'll put the total price on the last item for now
        // or just put it as the single item if it's the only one.
        const isLast = index === services.length - 1;
        return [
            index + 1,
            service,
            "1",
            isLast ? `LKR ${parseFloat(booking["Total Price"] || "0").toLocaleString()}` : "-"
        ];
    });

    autoTable(doc, {
        startY: 105,
        head: [['#', 'Description of Service', 'Qty', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20 },
            3: { cellWidth: 40, halign: 'right' }
        }
    });

    // --- Summary Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL:", pageWidth - margin - 80, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`LKR ${parseFloat(booking["Total Price"] || "0").toLocaleString()}`, pageWidth - margin, finalY, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.text("TAX (0%):", pageWidth - margin - 80, finalY + 7);
    doc.setFont("helvetica", "normal");
    doc.text("LKR 0.00", pageWidth - margin, finalY + 7, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(pageWidth - margin - 80, finalY + 11, pageWidth - margin, finalY + 11);

    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT:", pageWidth - margin - 80, finalY + 18);
    doc.text(`LKR ${parseFloat(booking["Total Price"] || "0").toLocaleString()}`, pageWidth - margin, finalY + 18, { align: 'right' });

    // --- Status Section ---
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(margin, finalY + 5, 50, 20);
    doc.setFontSize(12);
    doc.text("STATUS: PAID", margin + 10, finalY + 17);

    // --- Footer Section ---
    const footerY = 270;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.text("Terms: This invoice is generated automatically upon service completion.", margin, footerY + 7);
    doc.text("Thank you for choosing PrimeTune Automotive!", margin, footerY + 12);
    doc.text(BUSINESS_DETAILS.website, pageWidth - margin, footerY + 12, { align: 'right' });

    // --- Save File ---
    const filename = `${booking["Booking Number"] || "INV"}-${(booking["Customer"] || "Customer").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
};
