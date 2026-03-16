import { getAllBookings } from "@/app/actions/admin";
import BookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
    const bookings = (await getAllBookings()).reverse(); // Newest first
    return <BookingsClient bookings={bookings} />;
}
