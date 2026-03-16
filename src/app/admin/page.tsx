import { getAllBookings } from "@/app/actions/admin";
import DashboardClient from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function getServiceCount() {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

    if (error) return 0;
    return count || 0;
}

export default async function AdminDashboard() {
    const [bookings, serviceCount] = await Promise.all([
        getAllBookings(),
        getServiceCount(),
    ]);

    // Bookings are already ordered in getAllBookings, but we'll ensure consistency
    return <DashboardClient bookings={bookings} serviceCount={serviceCount} />;
}
