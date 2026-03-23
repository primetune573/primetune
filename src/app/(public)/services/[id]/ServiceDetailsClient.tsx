"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CalendarIcon, ShieldAlert, CheckCircle2, PhoneCall, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { MotionDiv, fadeIn } from "@/components/animated/MotionDiv";
import { submitBooking, getAvailableSlotsAction } from "@/app/actions/booking";

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
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // time string
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Booking form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [carBrand, setCarBrand] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [carPlate, setCarPlate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchSlots = useCallback(async (date: string) => {
        setSlotsLoading(true);
        try {
            const slots = await getAvailableSlotsAction(date, service.duration_hours || 1);
            setAvailableSlots(slots);
        } catch {
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [service.duration_hours]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateStr(val);
        setSelectedSlot(null);
        if (val) fetchSlots(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!dateStr || !selectedSlot) {
            setError("Please select a date and time slot.");
            return;
        }
        if (!validatePhone(phone)) {
            setError("Please enter a valid phone number (9-10 digits).");
            return;
        }
        if (!carBrand || !carModel || !carYear || !carPlate) {
            setError("Please enter all vehicle details including number plate.");
            return;
        }

        setSubmitting(true);
        startTransition(async () => {
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
                    booking_time: selectedSlot,
                    duration_hours: service.duration_hours || 1,
                    total_price: service.price || 0,
                    notes,
                    car_plate: carPlate,
                });

                if (!res?.success) {
                    if (res?.error === "EXCEL_FILE_OPEN") {
                        setError("⚠️ The bookings Excel file is currently open. Please close it and try again.");
                    } else {
                        setError(res?.error || "Something went wrong. Please try again.");
                    }
                    return;
                }

                // Success: open WhatsApp
                const slotObj = availableSlots.find((s: any) => s.time === selectedSlot);
                const timeRange = slotObj?.range || selectedSlot;
                const waMsg = `*New Booking — PrimeTune Automotive*\n\n*Booking ID:* ${res.booking_number}\n*Service:* ${service.name}\n*Date:* ${dateStr}\n*Time:* ${timeRange}\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Vehicle:* ${carBrand} ${carModel} (${carYear})\n*Plate:* ${carPlate}\n\n*Total:* LKR ${service.price?.toLocaleString()}\n\n_Notes: ${notes || "None"}_`;
                const waUrl = `https://wa.me/94775056573?text=${encodeURIComponent(waMsg)}`;

                // Use location.assign for maximum iOS/Android compatibility in async contexts
                window.location.assign(waUrl);

                setSuccess(res.booking_number || "Booking confirmed!");
            } finally {
                setSubmitting(false);
            }
        });
    };

    return (
        <div className="flex flex-col w-full pb-24 bg-background">
            {/* Header Banner */}
            <section className="relative h-72 md:h-[450px] w-full flex items-end overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/40 z-[5]" />
                {service.image ? (
                    <img src={service.image} alt={service.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover scale-105" />
                ) : (
                    <div className="absolute inset-0 bg-secondary" />
                )}
                <div className="container mx-auto px-4 relative z-20 pb-10 max-w-7xl">
                    <Link href="/services" className="inline-flex items-center text-white/90 hover:text-white font-bold text-sm mb-6 transition-all hover:-translate-x-1 group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" /> Back to Catalog
                    </Link>
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn}>
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                            <span className="bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white tracking-[0.2em] uppercase shadow-lg shadow-primary/20">
                                {service.category || "General"}
                            </span>
                            {service.emergency && (
                                <span className="bg-destructive/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white flex items-center gap-1.5 tracking-[0.2em] uppercase shadow-lg shadow-destructive/20 border border-white/10 animate-pulse">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight">
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
                        <MotionDiv
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border p-8 rounded-3xl shadow-2xl sticky top-24 overflow-hidden group/form"
                        >
                            {/* Decorative top bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-red-500 to-orange-500" />

                            {success ? (
                                <div className="text-center py-10 space-y-6">
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground">Booking Confirmed!</h3>
                                        <p className="text-muted-foreground text-sm mt-2">Your dedicated service ID:</p>
                                        <div className="mt-3 py-2 px-4 bg-muted/50 rounded-xl border border-border inline-block">
                                            <p className="text-3xl font-black text-primary tracking-tighter">{success}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        WhatsApp has been opened with your booking details. If it didn't open automatically, click the button below:
                                    </p>
                                    <div className="space-y-3">
                                        <a
                                            href={`https://wa.me/94775056573?text=${encodeURIComponent(`*Booking ID:* ${success}\nI'm following up on my booking.`)}`}
                                            target="_blank"
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-green-500/20"
                                        >
                                            <MessageCircle className="w-5 h-5" /> Open WhatsApp Manually
                                        </a>
                                        <Link href="/services" className="w-full inline-flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground py-4 rounded-2xl font-black transition-all">
                                            Return to Services
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Service Fee</p>
                                                <h3 className="text-4xl font-black text-foreground tracking-tighter">LKR {service.price?.toLocaleString()}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Estimated Time</p>
                                                <p className="text-sm font-bold text-foreground flex items-center justify-end gap-1.5">
                                                    <Clock className="w-4 h-4 text-primary" /> {service.duration_hours} Hour{service.duration_hours !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Date selection */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Appointment Date</label>
                                            <div className="relative">
                                                <CalendarIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                                <input
                                                    type="date"
                                                    min={todayStr}
                                                    value={dateStr}
                                                    onChange={handleDateChange}
                                                    required
                                                    className="w-full bg-secondary/50 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-all text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Slot selection */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Available Windows</label>
                                            {!dateStr ? (
                                                <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-6 text-center">
                                                    <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Select a date above</p>
                                                </div>
                                            ) : slotsLoading ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-center">
                                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.1em]">No slots available</p>
                                                </div>
                                            ) : availableSlots[0].time === "Full Day" ? (
                                                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                                                    <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
                                                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest mb-1">Closed for the day</p>
                                                    <p className="text-sm font-bold text-foreground">{availableSlots[0].reason || "Garage Unavailable"}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20">
                                                    {availableSlots.map(slot => {
                                                        const isBlocked = slot.status === "blocked";
                                                        return (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                disabled={isBlocked}
                                                                onClick={() => setSelectedSlot(slot.time)}
                                                                className={`group relative py-4 px-5 rounded-2xl transition-all border text-left flex items-center justify-between ${selectedSlot === slot.time
                                                                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-[0.98]"
                                                                    : isBlocked
                                                                        ? "bg-secondary/30 text-muted-foreground/40 border-border/50 cursor-not-allowed"
                                                                        : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary/80 shadow-sm"
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black uppercase tracking-tighter mb-0.5 opacity-60">Time Window</span>
                                                                    <span className="text-sm font-black tracking-tight font-sans">
                                                                        {slot.range}
                                                                    </span>
                                                                </div>

                                                                {isBlocked ? (
                                                                    <div className="text-right flex flex-col items-end">
                                                                        <span className="text-[9px] font-black text-destructive uppercase tracking-widest bg-destructive/10 px-2 py-0.5 rounded-full mb-1">Blocked</span>
                                                                        <span className="text-[10px] font-bold text-muted-foreground italic max-w-[100px] truncate">
                                                                            {slot.reason}
                                                                        </span>
                                                                    </div>
                                                                ) : selectedSlot === slot.time ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-3">
                                                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" />
                                                <input
                                                    required
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    placeholder="Phone Number (e.g. 077 xxxxxxx) *"
                                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <input required value={carBrand} onChange={e => setCarBrand(e.target.value)} placeholder="Car Brand *" className="bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" />
                                                <input required value={carModel} onChange={e => setCarModel(e.target.value)} placeholder="Model *" className="bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required value={carYear} onChange={e => setCarYear(e.target.value)} placeholder="Manufacturing Year *" className="bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" />
                                                <input required value={carPlate} onChange={e => setCarPlate(e.target.value)} placeholder="Number Plate *" className="bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" />
                                            </div>
                                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Briefly describe your vehicle issues..." rows={2} className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none resize-none transition-shadow" />
                                        </div>

                                        {error && (
                                            <div className="flex items-start gap-2 text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3 uppercase tracking-tighter">
                                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitting || !dateStr || selectedSlot === null}
                                            className="relative w-full overflow-hidden bg-primary hover:bg-red-700 disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95 group/btn"
                                        >
                                            {/* Shine effect */}
                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-[250%] transition-all duration-1000 ease-in-out pointer-events-none" />

                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                                            <span className="relative z-10">{submitting ? "Processing..." : "Confirm & Book Now"}</span>
                                        </button>
                                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">A copy will be sent to our WhatsApp</p>
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
