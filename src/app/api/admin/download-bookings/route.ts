import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
    const filePath = path.join(process.cwd(), "bookings_export.xlsx");
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "No bookings file found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="PrimeTune_Bookings_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
    });
}
