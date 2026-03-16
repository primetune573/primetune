import { format, addHours, parse, isFriday, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';
import fs from 'fs';
import path from 'path';

const OPENING_HOUR = 8; // 8 AM
const CLOSING_HOUR = 18; // 6 PM (18:00)

const blocksFile = path.join(process.cwd(), "availability_blocks.json");

function getAvailabilityBlocks() {
    if (fs.existsSync(blocksFile)) {
        try {
            return JSON.parse(fs.readFileSync(blocksFile, "utf-8"));
        } catch (e) {
            return { holidays: [], blocked_slots: [] };
        }
    }
    return { holidays: [], blocked_slots: [] };
}

function isSlotConflicting(candidateStart: number, candidateDur: number, bookedSlots: { time: string; duration: number }[]): boolean {
    const cEnd = candidateStart + candidateDur;
    for (const s of bookedSlots) {
        // Parse time like "8:00 AM" to hour
        try {
            const [timePart, ampm] = s.time.split(" ");
            let bStart = parseInt(timePart.split(":")[0]);
            if (ampm === "PM" && bStart !== 12) bStart += 12;
            if (ampm === "AM" && bStart === 12) bStart = 0;
            const bEnd = bStart + s.duration;
            if (candidateStart < bEnd && cEnd > bStart) return true;
        } catch { continue; }
    }
    return false;
}

/**
 * Generate available time slots for a given date and service duration.
 * Returns detailed slot objects: { time: string, status: 'available' | 'blocked', reason?: string }
 */
export function getAvailableTimeSlots(
    selectedDate: Date | undefined,
    durationHours: number,
    bookedSlots: { time: string; duration: number }[] = []
): any[] {
    if (!selectedDate) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const blocks = getAvailabilityBlocks();

    // Check if it's a holiday
    const holiday = blocks.holidays.find((h: any) => h.date === dateStr);
    if (holiday) {
        return [{ time: "Full Day", status: "blocked", reason: holiday.reason || "Garage Closed" }];
    }

    // Friday is closed
    if (isFriday(selectedDate)) {
        return [{ time: "Full Day", status: "blocked", reason: "Closed on Fridays" }];
    }

    // If selected date is in the past
    const today = startOfDay(new Date());
    if (isBefore(startOfDay(selectedDate), today)) {
        return [];
    }

    const slots: any[] = [];
    const startLimit = OPENING_HOUR;
    const endLimit = CLOSING_HOUR - durationHours;

    const dayBlocks = blocks.blocked_slots.filter((s: any) => s.date === dateStr);

    for (let hour = startLimit; hour <= endLimit; hour++) {
        const slotTime = setMinutes(setHours(selectedDate, hour), 0);
        const endSlotTime = setMinutes(setHours(selectedDate, hour + durationHours), 0);

        const slotLabel = format(slotTime, 'h:mm a');
        const endLabel = format(endSlotTime, 'h:mm a');
        const rangeLabel = `${slotLabel} - ${endLabel}`;

        // Check against manual blocks
        const block = dayBlocks.find((b: any) => {
            if (b.time === slotLabel) return true;
            if (b.start_hour <= hour && b.end_hour > hour) return true;
            return false;
        });

        if (block) {
            slots.push({
                time: slotLabel,
                range: rangeLabel,
                status: "blocked",
                reason: block.reason || "Manual Block"
            });
            continue;
        }

        // Check against existing bookings
        if (isSlotConflicting(hour, durationHours, bookedSlots)) {
            slots.push({
                time: slotLabel,
                range: rangeLabel,
                status: "blocked",
                reason: "Slot Already Booked"
            });
            continue;
        }

        // Today check
        if (startOfDay(selectedDate).getTime() === today.getTime()) {
            const nowPlusOneHour = addHours(new Date(), 1);
            if (isBefore(slotTime, nowPlusOneHour)) {
                // Don't even show past slots for today
                continue;
            }
        }

        slots.push({
            time: slotLabel,
            range: rangeLabel,
            status: "available"
        });
    }

    return slots;
}
