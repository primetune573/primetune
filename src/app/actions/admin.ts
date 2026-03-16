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
    status: "pending" | "confirmed" | "completed" | "cancelled",
    cancellationReason?: string
) {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return { success: false, error: "No bookings file found." };

        const sheetName = "Bookings";
        const ws = wb.Sheets[sheetName];
        const records = xlsx.utils.sheet_to_json(ws) as any[];

        const idx = records.findIndex((r) => r["Booking Number"] === bookingNumber);
        if (idx !== -1) {
            records[idx]["Status"] = status;
            if (status === "cancelled" && cancellationReason) {
                records[idx]["Cancellation Reason"] = cancellationReason;
            }
            records[idx]["Updated At"] = new Date().toISOString();
        }

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
export async function adminCancelBooking(bookingNumber: string, reason: string) {
    // First update the status in the xlsx records
    const result = await adminUpdateBookingStatus("", bookingNumber, "cancelled", reason);
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

/** Re-activate a cancelled booking */
export async function adminReactivateBooking(bookingNumber: string) {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return { success: false, error: "No bookings file found." };

        const sheetName = "Bookings";
        const ws = wb.Sheets[sheetName];
        const records = xlsx.utils.sheet_to_json(ws) as any[];

        const idx = records.findIndex((r) => r["Booking Number"] === bookingNumber);
        if (idx === -1) return { success: false, error: "Booking not found." };

        records[idx]["Status"] = "pending";
        records[idx]["Updated At"] = new Date().toISOString();
        records[idx]["Notes"] = (records[idx]["Notes"] || "") + ` [Reactivated on ${new Date().toLocaleDateString()}]`;

        const newWs = xlsx.utils.json_to_sheet(records);
        wb.Sheets[sheetName] = newWs;
        writeWorkbook(wb);

        // Reset color in Excel
        try {
            const ExcelJS = (await import("exceljs")).default;
            const wbE = new ExcelJS.Workbook();
            await wbE.xlsx.readFile(bookingsFile);
            const wsE = wbE.getWorksheet("Bookings");
            if (wsE) {
                wsE.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;
                    const cell = row.getCell(1);
                    if (cell.value === bookingNumber || String(cell.value).includes(bookingNumber)) {
                        row.eachCell((c) => {
                            c.font = { color: { argb: "FF000000" }, bold: false };
                        });
                    }
                });
                await wbE.xlsx.writeFile(bookingsFile);
            }
        } catch (e) { }

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return handleExcelErr(e);
    }
}

/** Reschedule a booking */
export async function adminRescheduleBooking(bookingNumber: string, newDate: string, newTime: string) {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return { success: false, error: "No bookings file found." };

        const sheetName = "Bookings";
        const ws = wb.Sheets[sheetName];
        const records = xlsx.utils.sheet_to_json(ws) as any[];

        const idx = records.findIndex((r) => r["Booking Number"] === bookingNumber);
        if (idx === -1) return { success: false, error: "Booking not found." };

        records[idx]["Date"] = newDate;
        records[idx]["Time"] = newTime;
        records[idx]["Status"] = "confirmed";
        records[idx]["Updated At"] = new Date().toISOString();

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

/** Availability Blocks ─────────────────────────────────────────────── */

const blocksFile = path.join(process.cwd(), "availability_blocks.json");

export async function getAvailabilityBlocks() {
    if (fs.existsSync(blocksFile)) {
        try {
            return JSON.parse(fs.readFileSync(blocksFile, "utf-8"));
        } catch (e) {
            return { holidays: [], blocked_slots: [] };
        }
    }
    return { holidays: [], blocked_slots: [] };
}

export async function addAvailabilityBlock(block: any) {
    try {
        const blocks = await getAvailabilityBlocks();
        const newBlock = {
            ...block,
            id: `block-${Date.now()}`,
            created_at: new Date().toISOString(),
        };

        if (block.type === "full-day") {
            blocks.holidays.push(newBlock);
        } else {
            blocks.blocked_slots.push(newBlock);
        }

        fs.writeFileSync(blocksFile, JSON.stringify(blocks, null, 2));
        revalidatePath("/admin/availability");
        revalidatePath("/");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteAvailabilityBlock(id: string, type: "full-day" | "partial") {
    try {
        const blocks = await getAvailabilityBlocks();
        if (type === "full-day") {
            blocks.holidays = blocks.holidays.filter((b: any) => b.id !== id);
        } else {
            blocks.blocked_slots = blocks.blocked_slots.filter((b: any) => b.id !== id);
        }

        fs.writeFileSync(blocksFile, JSON.stringify(blocks, null, 2));
        revalidatePath("/admin/availability");
        revalidatePath("/");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Returns all bookings for the admin dashboard and calendar */
export async function getAllBookings() {
    try {
        const wb = readBookingsWorkbook();
        if (!wb) return [];
        const ws = wb.Sheets["Bookings"];
        if (!ws) return [];
        return xlsx.utils.sheet_to_json(ws) as any[];
    } catch (e) {
        return [];
    }
}
