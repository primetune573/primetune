"use server";

import { revalidatePath } from "next/cache";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

const servicesFile = path.join(process.cwd(), "services.json");
const bookingsFile = path.join(process.cwd(), "bookings_export.xlsx");

function getLocalServices() {
    if (fs.existsSync(servicesFile)) {
        return JSON.parse(fs.readFileSync(servicesFile, "utf-8"));
    }
    return [];
}

function saveLocalServices(data: any[]) {
    fs.writeFileSync(servicesFile, JSON.stringify(data, null, 2));
}

function readBookingsWorkbook() {
    if (fs.existsSync(bookingsFile)) {
        const buf = fs.readFileSync(bookingsFile);
        return xlsx.read(buf, { type: "buffer" });
    }
    return null;
}

function writeWorkbook(workbook: xlsx.WorkBook) {
    try {
        const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
        fs.writeFileSync(bookingsFile, buf);
    } catch (e: any) {
        if (e.code === "EBUSY" || e.code === "EPERM") {
            throw new Error("EXCEL_OPEN");
        }
        throw e;
    }
}

function handleExcelErr(e: any) {
    if (e.message === "EXCEL_OPEN") {
        return { success: false, error: "The Excel file is open. Please close it and try again." };
    }
    return { success: false, error: e.message };
}

// ─── Booking Actions ───────────────────────────────────────────────

/** Update status: pending → confirmed → completed, OR cancel */
export async function adminUpdateBookingStatus(
    _id: string,
    bookingNumber: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
) {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return { success: false, error: "No bookings file found." };

        const sheetName = "Bookings";
        const ws = wb.Sheets[sheetName];
        const records = xlsx.utils.sheet_to_json(ws) as any[];

        const idx = records.findIndex((r) => r["Booking Number"] === bookingNumber);
        if (idx !== -1) records[idx]["Status"] = status;

        const newWs = xlsx.utils.json_to_sheet(records);
        wb.Sheets[sheetName] = newWs;
        writeWorkbook(wb);

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return handleExcelErr(e);
    }
}

/** Soft-cancel — keeps row, sets status to cancelled AND applies red font color in Excel */
export async function adminCancelBooking(bookingNumber: string) {
    // First update the status in the xlsx records
    const result = await adminUpdateBookingStatus("", bookingNumber, "cancelled");
    if (!result.success) return result;

    // Then apply red color using exceljs
    try {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(bookingsFile);
        const ws = wb.getWorksheet("Bookings");
        if (ws) {
            ws.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // skip header
                const cell = row.getCell(1); // "Booking Number" column
                if (cell.value === bookingNumber || String(cell.value).includes(bookingNumber)) {
                    row.eachCell((c) => {
                        c.font = { ...(c.font || {}), color: { argb: "FFCC0000" }, bold: false };
                    });
                }
            });
            await wb.xlsx.writeFile(bookingsFile);
        }
    } catch (e: any) {
        // Non-fatal: status was already cancelled, color is cosmetic
        console.warn("Could not apply red color to Excel row:", e.message);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
}

/** Hard delete — permanently removes the row from Excel */
export async function adminPermanentlyDeleteBooking(bookingNumber: string) {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return { success: false, error: "No bookings file found." };

        const sheetName = "Bookings";
        const ws = wb.Sheets[sheetName];
        let records = xlsx.utils.sheet_to_json(ws) as any[];
        records = records.filter((r) => r["Booking Number"] !== bookingNumber);

        const newWs = xlsx.utils.json_to_sheet(records);
        wb.Sheets[sheetName] = newWs;
        writeWorkbook(wb);

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return handleExcelErr(e);
    }
}

// Keep legacy name for any residual references
export async function adminDeleteBooking(_id: string, bookingNumber: string) {
    return adminPermanentlyDeleteBooking(bookingNumber);
}

// ─── Service CRUD ──────────────────────────────────────────────────

export async function adminCreateService(data: any) {
    try {
        const services = getLocalServices();
        const newService = {
            ...data,
            id: `pt-svc-${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        services.push(newService);
        saveLocalServices(services);
        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminUpdateService(id: string, data: any) {
    try {
        const services = getLocalServices();
        const idx = services.findIndex((s: any) => s.id === id);
        if (idx !== -1) {
            services[idx] = { ...services[idx], ...data };
            saveLocalServices(services);
        }
        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminDeleteService(id: string) {
    try {
        let services = getLocalServices();
        services = services.filter((s: any) => s.id !== id);
        saveLocalServices(services);
        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Returns all bookings for the admin dashboard and calendar */
export async function getAllBookings() {
    const wb = readBookingsWorkbook();
    if (!wb) return [];
    const ws = wb.Sheets["Bookings"];
    if (!ws) return [];
    return xlsx.utils.sheet_to_json(ws) as any[];
}
