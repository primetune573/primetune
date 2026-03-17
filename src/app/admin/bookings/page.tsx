import { getAllBookings } from "@/app/actions/admin";
import BookingsClient from "./BookingsClient";
import { isAdmin } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
    if (!await isAdmin()) {
        redirect("/admin/login");
    }

    const bookings = await getAllBookings(); // Newest first (from DB)
    return <BookingsClient bookings={bookings} />;
}
