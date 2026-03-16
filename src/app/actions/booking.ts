"use server";

import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

const EXCEL_FILE = path.join(process.cwd(), "bookings_export.xlsx");

function readWorkbook() {
    if (fs.existsSync(EXCEL_FILE)) {
        const buf = fs.readFileSync(EXCEL_FILE);
        return xlsx.read(buf, { type: "buffer" });
    }
    return null;
}

function getRecords(): any[] {
    const wb = readWorkbook();
    if (!wb) return [];
    const ws = wb.Sheets["Bookings"];
    if (!ws) return [];
    return xlsx.utils.sheet_to_json(ws) as any[];
}

/** Generate next sequential booking ID: pt-0001, pt-0002 ... */
function generateBookingNumber(): string {
    const records = getRecords();
    let max = 0;
    for (const r of records) {
        const num = r["Booking Number"] as string;
        if (num && num.toLowerCase().startsWith("pt-")) {
            const n = parseInt(num.toLowerCase().replace("pt-", ""), 10);
            if (!isNaN(n) && n > max) max = n;
        }
    }
    return `pt-${String(max + 1).padStart(4, "0")}`;
}

/** Returns booked {time, duration} for a specific date (excluding cancelled) */
export async function getBookedSlotsForDate(
    dateStr: string
): Promise<{ time: string; duration: number }[]> {
    const records = getRecords();
    return records
        .filter(
            (r) =>
                r["Date"] === dateStr &&
                r["Status"] !== "cancelled"
        )
        .map((r) => ({
            time: r["Time"] as string,
            duration: parseFloat(r["Duration (hrs)"]) || 1,
        }));
}

export async function submitBooking(data: {
    customer_name: string;
    customer_phone: string;
    car_brand: string;
    car_model: string;
    car_year: string;
    service_id: string;
    service_name: string;
    booking_date: string;
    booking_time: string;
    duration_hours: number;
    total_price: number;
    notes: string;
}) {
    try {
        const booking_number = generateBookingNumber();

        const rowDetails = {
            "Booking Number": booking_number,
            Date: data.booking_date,
            Time: data.booking_time,
            Customer: data.customer_name,
            Phone: data.customer_phone,
            Car: `${data.car_brand} ${data.car_model} (${data.car_year})`,
            Services: data.service_name,
            "Total Price": data.total_price,
            "Duration (hrs)": data.duration_hours,
            Status: "pending",
            Notes: data.notes,
            "Created At": new Date().toISOString(),
        };

        await appendToExcel(rowDetails);

        return { success: true, booking_number };
    } catch (err: any) {
        console.error("Booking submission failed:", err);
        return {
            success: false,
            error:
                err.message === "EXCEL_FILE_OPEN" ? "EXCEL_FILE_OPEN" : err.message,
        };
    }
}

async function appendToExcel(record: any) {
    const filePath = EXCEL_FILE;
    let workbook: xlsx.WorkBook;
    const sheetName = "Bookings";

    if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        workbook = xlsx.read(buf, { type: "buffer" });
    } else {
        workbook = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(workbook, ws, sheetName);
    }

    const worksheet = workbook.Sheets[sheetName];
    const existing = worksheet ? (xlsx.utils.sheet_to_json(worksheet) as any[]) : [];
    existing.push(record);

    const newWs = xlsx.utils.json_to_sheet(existing);
    workbook.Sheets[sheetName] = newWs;

    try {
        const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
        fs.writeFileSync(filePath, buf);
    } catch (e: any) {
        if (e.code === "EBUSY" || e.code === "EPERM") {
            throw new Error("EXCEL_FILE_OPEN");
        }
        throw e;
    }
}
