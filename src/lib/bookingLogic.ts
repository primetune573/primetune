import { format, addHours, parse, isFriday, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';

const OPENING_HOUR = 8; // 8 AM
const CLOSING_HOUR = 18; // 6 PM (18:00)

/**
 * Generate available time slots for a given date and service duration.
 * A service cannot start if its duration surpasses 6 PM.
 * Friday is closed.
 */
export function getAvailableTimeSlots(selectedDate: Date | undefined, durationHours: number): string[] {
    if (!selectedDate) return [];

    // Friday is closed
    if (isFriday(selectedDate)) {
        return [];
    }

    // If selected date is in the past (before today without time), no slots
    const today = startOfDay(new Date());
    if (isBefore(startOfDay(selectedDate), today)) {
        return [];
    }

    const slots: string[] = [];
    const startLimit = OPENING_HOUR;
    const endLimit = CLOSING_HOUR - durationHours; // Maximum starting hour

    // Example: if duration = 5, endLimit = 18 - 5 = 13 (1:00 PM).
    // So slots can be 8, 9, 10, 11, 12, 13.
    for (let hour = startLimit; hour <= endLimit; hour++) {
        // We only provide top of the hour slots for simplicity
        const slotTime = setMinutes(setHours(selectedDate, hour), 0);

        // If it's today, we must ensure the slot is at least 1 hour from now
        if (startOfDay(selectedDate).getTime() === today.getTime()) {
            const nowPlusOneHour = addHours(new Date(), 1);
            if (isBefore(slotTime, nowPlusOneHour)) {
                continue;
            }
        }

        slots.push(format(slotTime, 'h:mm a'));
    }

    return slots;
}
