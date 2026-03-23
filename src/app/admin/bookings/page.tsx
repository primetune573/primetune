import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/AdminSkeletons";
import { getAllBookings } from "@/app/actions/admin";
import BookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect("/admin/login");
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-foreground tracking-tight">Bookings Management</h1>
            </div>

            <Suspense fallback={<TableSkeleton />}>
                <BookingsDataLoader />
            </Suspense>
        </div>
    );
}

async function BookingsDataLoader() {
    const bookings = await getAllBookings(true);
    return <BookingsClient bookings={bookings} />;
}
