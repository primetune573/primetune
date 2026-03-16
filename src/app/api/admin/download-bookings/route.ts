import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: false });

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
            { header: "Services", key: "services", width: 40 },
            { header: "Total Price", key: "total_price", width: 15 },
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
                services: b.service_names_snapshot?.join(", "),
                total_price: b.total_price,
                duration_hours: b.duration_hours,
                status: b.status,
                cancellation_reason: b.cancellation_reason,
                notes: b.notes,
                created_at: b.created_at,
            });

            // If cancelled, make row red
            if (b.status === 'cancelled') {
                row.eachCell(cell => {
                    cell.font = { color: { argb: 'FFCC0000' } };
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
