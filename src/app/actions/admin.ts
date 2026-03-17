"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "./auth";

// ─── Booking Actions ───────────────────────────────────────────────

/** Update status: pending → confirmed → completed, OR cancel */
export async function adminUpdateBookingStatus(
    _id: string, // Kept for legacy compatibility
    bookingNumber: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
    cancellationReason?: string
) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (status === "cancelled" && cancellationReason) {
            updateData.cancellation_reason = cancellationReason;
            updateData.cancelled_at = new Date().toISOString();
        }

        if (status === "completed") {
            updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('booking_number', bookingNumber);

        if (error) throw error;

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Soft-cancel — keeps record, sets status to cancelled */
export async function adminCancelBooking(bookingNumber: string, reason: string) {
    return adminUpdateBookingStatus("", bookingNumber, "cancelled", reason);
}

/** Re-activate a cancelled booking */
export async function adminReactivateBooking(bookingNumber: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();

        // Fetch current notes to append reactivation memo
        const { data: booking } = await supabase
            .from('bookings')
            .select('notes')
            .eq('booking_number', bookingNumber)
            .single();

        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'pending',
                cancellation_reason: null,
                cancelled_at: null,
                updated_at: new Date().toISOString(),
                notes: (booking?.notes || "") + ` [Reactivated on ${new Date().toLocaleDateString()}]`
            })
            .eq('booking_number', bookingNumber);

        if (error) throw error;

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Reschedule a booking */
export async function adminRescheduleBooking(bookingNumber: string, newDate: string, newTime: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('bookings')
            .update({
                booking_date: newDate,
                booking_time: newTime,
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('booking_number', bookingNumber);

        if (error) throw error;

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Hard delete — permanently removes from Supabase */
export async function adminPermanentlyDeleteBooking(bookingNumber: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('booking_number', bookingNumber);

        if (error) throw error;

        revalidatePath("/admin/bookings");
        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminDeleteBooking(_id: string, bookingNumber: string) {
    return adminPermanentlyDeleteBooking(bookingNumber);
}

// ─── Service CRUD ──────────────────────────────────────────────────

export async function adminCreateService(data: any) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('services')
            .insert({
                name: data.name,
                description: data.summary,
                price: data.price,
                duration_hours: data.duration_hours,
                category: data.category,
                image_url: data.image,
                is_emergency: data.emergency || false,
                included_items: data.included || [],
                is_active: true
            });

        if (error) throw error;

        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminUpdateService(id: string, data: any) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('services')
            .update({
                name: data.name,
                description: data.description || data.summary,
                price: data.price,
                duration_hours: data.duration_hours,
                category: data.category,
                image_url: data.image_url || data.image,
                is_emergency: data.emergency,
                included_items: data.included || data.included_items,
                is_active: data.is_active !== undefined ? data.is_active : true
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminDeleteService(id: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/admin/services");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Availability Blocks ─────────────────────────────────────────────── */

export async function getAvailabilityBlocks() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('availability_blocks')
            .select('*');

        if (error) throw error;

        return {
            holidays: data.filter(b => b.type === 'full-day'),
            blocked_slots: data.filter(b => b.type === 'partial')
        };
    } catch (e) {
        return { holidays: [], blocked_slots: [] };
    }
}

export async function addAvailabilityBlock(block: any) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('availability_blocks')
            .insert({
                type: block.type,
                date: block.date,
                start_hour: block.start_hour || 0,
                end_hour: block.end_hour || 24,
                reason: block.reason,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        revalidatePath("/admin/availability");
        revalidatePath("/");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteAvailabilityBlock(id: string, type: "full-day" | "partial") {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('availability_blocks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/admin/availability");
        revalidatePath("/");
        revalidatePath("/services");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/** Returns all bookings for the admin dashboard and calendar */
export async function getAllBookings() {
    if (!(await isAdmin())) return [];
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase fields back to the "Excel-style" keys the frontend expects
        return data.map(b => ({
            "Booking Number": b.booking_number,
            "Date": b.booking_date,
            "Time": b.booking_time,
            "Customer": b.customer_name,
            "Phone": b.customer_phone,
            "Email": b.customer_email,
            "Vehicle": `${b.car_brand} ${b.car_model} (${b.car_year})`,
            "Services": b.service_names_snapshot?.join(", "),
            "Total Price": b.total_price,
            "Duration (hrs)": b.duration_hours,
            "Status": b.status,
            "Notes": b.notes,
            "Cancellation Reason": b.cancellation_reason,
            "Created At": b.created_at,
            "Updated At": b.updated_at
        }));
    } catch (e) {
        return [];
    }
}
