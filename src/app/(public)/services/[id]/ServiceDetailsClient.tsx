"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CalendarIcon, ShieldAlert, CheckCircle2, PhoneCall, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { MotionDiv, fadeIn } from "@/components/animated/MotionDiv";
import { submitBooking, getBookedSlotsForDate } from "@/app/actions/booking";

const CATEGORIES = ["Maintenance", "Performance", "Engine", "Emergency"];

function parseHour(timeStr: string): number {
    // e.g. "8:00 AM" → 8, "1:00 PM" → 13
    try {
        const [timePart, ampm] = timeStr.split(" ");
        let hour = parseInt(timePart.split(":")[0]);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        return hour;
    } catch { return 0; }
}

function formatSlotRange(startHour: number, durationHrs: number): string {
    const fmt = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${display}:00 ${ampm}`;
    };
    return `${fmt(startHour)} – ${fmt(startHour + durationHrs)}`;
}

function isSlotConflicting(
    candidateStart: number,
    candidateDur: number,
    bookedSlots: { time: string; duration: number }[]
): boolean {
    const cEnd = candidateStart + candidateDur;
    for (const s of bookedSlots) {
        const bStart = parseHour(s.time);
        const bEnd = bStart + s.duration;
        // Overlap check
        if (candidateStart < bEnd && cEnd > bStart) return true;
    }
    return false;
}

function validatePhone(phone: string): boolean {
    // Sri Lanka numbers: 07xxxxxxxx (10 digits) or generic 9-10 digits
    return /^[0-9]{9,10}$/.test(phone.replace(/[\s\-]/g, ""));
}

const OPENING_HOUR = 8;
const CLOSING_HOUR = 18;

export default function ServiceDetailsClient({ service }: { service: any }) {
    const router = useRouter();
    const todayStr = new Date().toISOString().split("T")[0];

    const [dateStr, setDateStr] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null); // start hour
    const [bookedSlots, setBookedSlots] = useState<{ time: string; duration: number }[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Booking form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [carBrand, setCarBrand] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<string | null>(null);

    const fetchSlots = useCallback(async (date: string) => {
        setSlotsLoading(true);
        try {
            const slots = await getBookedSlotsForDate(date);
            setBookedSlots(slots);
        } catch {
            setBookedSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateStr(e.target.value);
        setSelectedSlot(null);
        if (e.target.value) fetchSlots(e.target.value);
    };

    const isFriday = dateStr && new Date(dateStr).getDay() === 5;

    // Build available slots for the selected date and duration
    const availableSlots = (() => {
        if (!dateStr || isFriday) return [];
        const dur = service.duration_hours || 1;
        const maxStart = CLOSING_HOUR - dur;
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const slots: number[] = [];
        for (let h = OPENING_HOUR; h <= maxStart; h++) {
            // If today, enforce at least 1h from now
            if (dateStr === today) {
                const slotTime = new Date();
                slotTime.setHours(h, 0, 0, 0);
                const minTime = new Date(now.getTime() + 60 * 60 * 1000);
                if (slotTime < minTime) continue;
            }
            if (!isSlotConflicting(h, dur, bookedSlots)) {
                slots.push(h);
            }
        }
        return slots;
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!dateStr || selectedSlot === null) {
            setError("Please select a date and time slot.");
            return;
        }
        if (!validatePhone(phone)) {
            setError("Please enter a valid phone number (9-10 digits).");
            return;
        }
        if (!carBrand || !carModel || !carYear) {
            setError("Please enter all vehicle details.");
            return;
        }

        const slotLabel = formatSlotRange(selectedSlot, service.duration_hours || 1);
        // Format for backend as "8:00 AM" style
        const hourAmpm = selectedSlot >= 12 ? "PM" : "AM";
        const displayHour = selectedSlot > 12 ? selectedSlot - 12 : selectedSlot === 0 ? 12 : selectedSlot;
        const timeStr = `${displayHour}:00 ${hourAmpm}`;

        setSubmitting(true);
        try {
            const res = await submitBooking({
                customer_name: name,
                customer_phone: phone,
                car_brand: carBrand,
                car_model: carModel,
                car_year: carYear,
                service_id: service.id,
                service_name: service.name,
                booking_date: dateStr,
                booking_time: timeStr,
                duration_hours: service.duration_hours || 1,
                total_price: service.price || 0,
                notes,
            });

            if (!res.success) {
                if (res.error === "EXCEL_FILE_OPEN") {
                    setError("⚠️ The bookings Excel file is currently open. Please close it and try again.");
                } else {
                    setError(res.error || "Something went wrong. Please try again.");
                }
                return;
            }

            // Success: open WhatsApp
            const waMsg = `*New Booking — PrimeTune Automotive*\n\n*Booking ID:* ${res.booking_number}\n*Service:* ${service.name}\n*Date:* ${dateStr}\n*Time:* ${slotLabel}\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Vehicle:* ${carBrand} ${carModel} (${carYear})\n\n*Total:* LKR ${service.price?.toLocaleString()}\n\n_Notes: ${notes || "None"}_`;
            window.open(`https://wa.me/94775056573?text=${encodeURIComponent(waMsg)}`, "_blank");

            setSuccess(res.booking_number || "Booking confirmed!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full pb-24 bg-background">
            {/* Header Banner */}
            <section className="relative h-64 md:h-96 w-full flex items-end overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                {service.image ? (
                    <img src={service.image} alt={service.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-secondary" />
                )}
                <div className="container mx-auto px-4 relative z-20 pb-8 max-w-7xl">
                    <Link href="/services" className="inline-flex items-center text-white/80 hover:text-white font-medium mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
                    </Link>
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn}>
                        <div className="flex gap-2 items-center mb-2">
                            <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold text-white tracking-wider uppercase">
                                {service.category || "General"}
                            </span>
                            {service.emergency && (
                                <span className="bg-destructive px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Emergency
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                            {service.name}
                        </h1>
                    </MotionDiv>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 max-w-7xl mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-10">
                        <MotionDiv initial="hidden" animate="visible" variants={fadeIn}>
                            <h2 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">Service Overview</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">{service.summary}</p>
                        </MotionDiv>

                        <MotionDiv initial="hidden" animate="visible" variants={fadeIn}>
                            <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-2">What's Included</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.included && Array.isArray(service.included) && service.included.length > 0 ? (
                                    service.included.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-foreground font-medium">{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-foreground font-medium">Comprehensive service check</span>
                                    </li>
                                )}
                            </ul>
                        </MotionDiv>

                        {service.emergency && (
                            <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center">
                                <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">Need Immediate Help?</h3>
                                <p className="text-muted-foreground mb-6">Skip online booking and call directly for emergency support.</p>
                                <a href="tel:+94775056573" className="inline-flex items-center gap-2 bg-destructive hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/40">
                                    <PhoneCall className="w-5 h-5" /> Call Now
                                </a>
                            </MotionDiv>
                        )}
                    </div>

                    {/* Right: Booking Form */}
                    <div className="lg:col-span-1">
                        <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="bg-card border border-border p-6 rounded-2xl shadow-xl sticky top-24">
                            {success ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
                                    <p className="text-muted-foreground text-sm mb-1">Your Booking ID:</p>
                                    <p className="text-2xl font-black text-primary mb-4">{success}</p>
                                    <p className="text-sm text-muted-foreground mb-6">WhatsApp has been opened with your booking details. We will confirm your appointment shortly.</p>
                                    <Link href="/services" className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                                        Book Another Service
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-5">
                                        <h3 className="text-primary font-bold text-2xl">LKR {service.price?.toLocaleString()}</h3>
                                        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Est. {service.duration_hours} hour{service.duration_hours !== 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Date picker */}
                                        <div>
                                            <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
                                            </label>
                                            <input
                                                type="date"
                                                min={todayStr}
                                                value={dateStr}
                                                onChange={handleDateChange}
                                                required
                                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                                            />
                                            {isFriday && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> We are closed on Fridays.</p>}
                                        </div>

                                        {/* Time slot grid */}
                                        <div>
                                            <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" /> Available Time Slots
                                            </label>
                                            {!dateStr ? (
                                                <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg text-center border border-border/50">
                                                    Select a date to see slots.
                                                </p>
                                            ) : slotsLoading ? (
                                                <p className="text-xs text-muted-foreground text-center py-3"><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Loading...</p>
                                            ) : availableSlots.length === 0 ? (
                                                <p className="text-xs text-destructive bg-red-500/10 p-3 rounded-lg text-center border border-red-500/20">
                                                    {isFriday ? "Closed on Fridays." : "No available slots for this date."}
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                                    {availableSlots.map(h => (
                                                        <button
                                                            key={h}
                                                            type="button"
                                                            onClick={() => setSelectedSlot(h)}
                                                            className={`py-2 px-2 rounded-md text-xs font-semibold transition-all border text-center ${selectedSlot === h
                                                                ? "bg-primary text-white border-primary shadow-md"
                                                                : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary"
                                                                }`}
                                                        >
                                                            {formatSlotRange(h, service.duration_hours || 1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer details */}
                                        <div className="border-t border-border pt-4 space-y-3">
                                            <p className="text-sm font-bold text-foreground">Your Details</p>
                                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none" />
                                            <input
                                                required
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="Phone Number (e.g. 077 xxxxxxx) *"
                                                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>

                                        {/* Vehicle details */}
                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-foreground">Vehicle Info</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input required value={carBrand} onChange={e => setCarBrand(e.target.value)} placeholder="Brand *" className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none" />
                                                <input required value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="Model *" className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none" />
                                            </div>
                                            <input required value={carYear} onChange={e => setCarYear(e.target.value)} placeholder="Year (e.g. 2020) *" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none" />
                                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special notes (optional)" rows={2} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none resize-none" />
                                        </div>

                                        {error && <p className="text-destructive text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={submitting || !dateStr || selectedSlot === null}
                                            className="w-full mt-2 bg-primary hover:bg-red-700 disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                                            {submitting ? "Booking..." : "Confirm & Send via WhatsApp"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </MotionDiv>
                    </div>
                </div>
            </section>
        </div>
    );
}
