import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatsSkeleton, CalendarSkeleton } from "@/components/admin/AdminSkeletons";
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
    const admin = await isAdmin();

    if (!admin) {
        redirect("/admin/login");
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">Instantly fresh. Optimized for speed.</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="space-y-8">
                    <StatsSkeleton />
                    <CalendarSkeleton />
                </div>
            }>
                <DashboardDataLoader />
            </Suspense>
        </div>
    );
}

async function DashboardDataLoader() {
    const [bookings, serviceCount] = await Promise.all([
        getAllBookings(true),
        getServiceCount(),
    ]);

    return <DashboardClient bookings={bookings} serviceCount={serviceCount} />;
}
