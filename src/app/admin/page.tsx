import { getAllBookings } from "@/app/actions/admin";
import DashboardClient from "./DashboardClient";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getServiceCount() {
    const f = path.join(process.cwd(), "services.json");
    if (fs.existsSync(f)) {
        return JSON.parse(fs.readFileSync(f, "utf-8")).length;
    }
    return 0;
}

export default async function AdminDashboard() {
    const [bookings, serviceCount] = await Promise.all([
        getAllBookings(),
        getServiceCount(),
    ]);

    // Newest first for recent list
    const sortedBookings = [...bookings].reverse();

    return <DashboardClient bookings={sortedBookings} serviceCount={serviceCount} />;
}
