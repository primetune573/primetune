import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/app/actions/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const supabase = await createClient();
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Bookings");

        // Define columns
        worksheet.columns = [
            { header: "Booking Number", key: "booking_number", width: 15 },
            { header: "Date", key: "booking_date", width: 12 },
            { header: "Time", key: "booking_time", width: 12 },
            { header: "Customer", key: "customer_name", width: 25 },
            { header: "Phone", key: "customer_phone", width: 15 },
            { header: "Vehicle", key: "vehicle", width: 30 },
            { header: "Plate", key: "car_plate", width: 12 },
            { header: "Services", key: "services", width: 40 },
            { header: "Original Labor", key: "original_labor_price", width: 15 },
            { header: "Discount Type", key: "discount_type", width: 15 },
            { header: "Discount Value", key: "discount_value", width: 15 },
            { header: "Parts Total", key: "parts_total", width: 15 },
            { header: "Final Total", key: "final_total", width: 15 },
            { header: "Duration (hrs)", key: "duration_hours", width: 15 },
            { header: "Status", key: "status", width: 12 },
            { header: "Cancellation Reason", key: "cancellation_reason", width: 30 },
            { header: "Notes", key: "notes", width: 40 },
            { header: "Created At", key: "created_at", width: 25 },
        ];

        // Format header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Add rows
        bookings?.forEach(b => {
            const row = worksheet.addRow({
                booking_number: b.booking_number,
                booking_date: b.booking_date,
                booking_time: b.booking_time,
                customer_name: b.customer_name,
                customer_phone: b.customer_phone,
                vehicle: `${b.car_brand} ${b.car_model} (${b.car_year})`,
                car_plate: b.car_plate || "N/A",
                services: b.service_names_snapshot?.join(", "),
                original_labor_price: b.original_labor_price || b.total_price,
                discount_type: b.discount_type || "none",
                discount_value: b.discount_value || 0,
                parts_total: b.parts_total || 0,
                final_total: b.final_total || b.total_price,
                duration_hours: b.duration_hours,
                status: b.status,
                cancellation_reason: b.cancellation_reason,
                notes: b.notes,
                created_at: b.created_at,
            });

            // If cancelled, make row bold red
            if (b.status?.toLowerCase() === 'cancelled') {
                row.eachCell(cell => {
                    cell.font = {
                        color: { argb: 'FFFF0000' }, // Pure Red
                        bold: true
                    };
                });
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer as any, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="PrimeTune_Bookings_${new Date().toISOString().slice(0, 10)}.xlsx"`,
            },
        });
    } catch (e: any) {
        console.error("Export failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
