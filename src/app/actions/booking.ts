"use server";

import { createClient } from "@/utils/supabase/server";
import { getAvailableTimeSlots } from "@/lib/bookingLogic";

/** Fetch availability blocks and format them for the logic */
async function getSupabaseAvailabilityBlocks() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('availability_blocks')
        .select('*');

    if (error) return { holidays: [], blocked_slots: [] };

    return {
        holidays: data.filter(b => b.type === 'full-day'),
        blocked_slots: data.filter(b => b.type === 'partial')
    };
}

/** Generate next sequential booking ID: pt-0001, pt-0002 ... from Supabase */
async function generateBookingNumber(): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('bookings')
        .select('booking_number')
        .order('created_at', { ascending: false })
        .limit(50); // Check recent ones to find the max

    if (error || !data) return "pt-0001";

    let max = 0;
    for (const r of data) {
        const num = r.booking_number as string;
        if (num && num.toLowerCase().startsWith("pt-")) {
            const n = parseInt(num.toLowerCase().replace("pt-", ""), 10);
            if (!isNaN(n) && n > max) max = n;
        }
    }
    return `pt-${String(max + 1).padStart(4, "0")}`;
}

/** Returns detailed available slots (including reasons for blocks) */
export async function getAvailableSlotsAction(dateStr: string, durationHours: number) {
    if (!dateStr) return [];
    try {
        const booked = await getBookedSlotsForDate(dateStr);
        const blocks = await getSupabaseAvailabilityBlocks();
        return getAvailableTimeSlots(new Date(dateStr), durationHours, booked, blocks);
    } catch (e) {
        return [];
    }
}

/** Returns booked {time, duration} for a specific date (excluding cancelled) */
export async function getBookedSlotsForDate(
    dateStr: string
): Promise<{ time: string; duration: number }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('bookings')
        .select('booking_time, duration_hours')
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');

    if (error || !data) return [];

    return data.map((r) => ({
        time: r.booking_time,
        duration: r.duration_hours,
    }));
}

export async function submitBooking(data: {
    customer_name: string;
    customer_phone: string;
    car_brand: string;
    car_model: string;
    car_year: string;
    service_id?: string;
    service_name?: string;
    service_ids?: string[];
    service_names_snapshot?: string[];
    booking_date: string;
    booking_time: string;
    duration_hours: number;
    total_price: number;
    notes: string;
}) {
    try {
        const supabase = await createClient();

        // Server-side check against manual blocks AND existing bookings
        const booked = await getBookedSlotsForDate(data.booking_date);
        const blocks = await getSupabaseAvailabilityBlocks();
        const available = getAvailableTimeSlots(new Date(data.booking_date), data.duration_hours, booked, blocks);
        const slot = available.find(s => s.time === data.booking_time || s.time === "Full Day");

        if (!slot || slot.status === "blocked") {
            const reason = slot?.reason || "This slot is no longer available.";
            return { success: false, error: `UNAVAILABLE: ${reason}` };
        }

        const booking_number = await generateBookingNumber();
        const serviceNames = data.service_name || (data.service_names_snapshot ? data.service_names_snapshot.join(", ") : "Manual Entry");

        const { error } = await supabase.from('bookings').insert({
            booking_number,
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            car_brand: data.car_brand,
            car_model: data.car_model,
            car_year: data.car_year,
            service_ids: data.service_ids || [],
            service_names_snapshot: data.service_names_snapshot || [serviceNames],
            total_price: data.total_price,
            duration_hours: data.duration_hours,
            booking_date: data.booking_date,
            booking_time: data.booking_time,
            status: "pending",
            notes: data.notes,
            created_at: new Date().toISOString()
        });

        if (error) throw error;

        return { success: true, booking_number };
    } catch (err: any) {
        console.error("Booking submission failed:", err);
        return { success: false, error: err.message };
    }
}
