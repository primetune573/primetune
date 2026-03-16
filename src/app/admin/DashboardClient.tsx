"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Wrench, Download } from "lucide-react";
import Link from "next/link";

function formatSlotRange(timeStr: string, durationHrs: number): string {
    // timeStr format: "8:00 AM"
    try {
        const [timePart, ampm] = timeStr.split(" ");
        const [hourStr, minStr] = timePart.split(":");
        let hour = parseInt(hourStr);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        const startLabel = timeStr;
        let endHour = hour + durationHrs;
        const endAmpm = endHour >= 12 ? "PM" : "AM";
        if (endHour > 12) endHour -= 12;
        if (endHour === 0) endHour = 12;
        const endLabel = `${endHour}:00 ${endAmpm}`;
        return `${startLabel} – ${endLabel}`;
    } catch {
        return timeStr;
    }
}

const STATUS_COLOR: Record<string, string> = {
    pending: "text-amber-600",
    confirmed: "text-blue-600",
    completed: "text-green-600 font-bold",
    cancelled: "text-red-500 line-through",
};

type Booking = Record<string, any>;

export default function DashboardClient({ bookings, serviceCount }: { bookings: Booking[]; serviceCount: number }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const totalBookings = bookings.length;
    const pendingCount = bookings.filter(b => b["Status"] === "pending").length;
    const completedRevenue = bookings
        .filter(b => b["Status"] === "completed")
        .reduce((s, b) => s + (parseFloat(b["Total Price"]) || 0), 0);

    // Build a map: dateStr → bookings[]
    const bookingsByDate = useMemo(() => {
        const map: Record<string, Booking[]> = {};
        bookings.forEach(b => {
            const d = b["Date"] as string;
            if (d) {
                if (!map[d]) map[d] = [];
                map[d].push(b);
            }
        });
        return map;
    }, [bookings]);

    // Calendar grid helpers
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const statCards = [
        { label: "Total Bookings", value: totalBookings, color: "text-blue-600" },
        { label: "Pending", value: pendingCount, color: "text-amber-600" },
        { label: "Revenue Earned (LKR)", value: completedRevenue.toLocaleString(), color: "text-green-600" },
        { label: "Active Services", value: serviceCount, color: "text-primary" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back. Here is what's happening at PrimeTune.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((c, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
                        <p className="text-muted-foreground text-sm font-medium mb-1">{c.label}</p>
                        <h3 className={`text-3xl font-black ${c.color}`}>{c.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">

                {/* Calendar + Day Detail */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                            <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                            <h2 className="text-lg font-bold text-foreground">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
                            <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b border-border">
                            {DAY_NAMES.map(dn => (
                                <div key={dn} className="py-2 text-center text-xs font-semibold text-muted-foreground">{dn}</div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div className="grid grid-cols-7">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`e-${i}`} className="h-12 border-r border-b border-border/40 last:border-r-0" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const hasBookings = !!bookingsByDate[dateStr]?.length;
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                                        className={`h-12 border-r border-b border-border/40 last:border-r-0 relative flex flex-col items-center justify-center text-sm font-medium transition-colors
                                            ${isSelected ? "bg-primary text-white" : isToday ? "bg-primary/10 text-primary" : "hover:bg-secondary"}
                                        `}
                                    >
                                        {day}
                                        {hasBookings && !isSelected && (
                                            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                        {hasBookings && isSelected && (
                                            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day panel */}
                    {selectedDate && (
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-foreground mb-4">
                                Bookings on <span className="text-primary">{selectedDate}</span>
                            </h3>
                            {selectedBookings.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No bookings for this day.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedBookings.map((b, i) => (
                                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${b["Status"] === "completed" ? "border-green-500/30 bg-green-500/5" : b["Status"] === "cancelled" ? "border-red-500/30 bg-red-500/5" : "border-border bg-secondary/30"}`}>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm text-foreground">{b["Booking Number"]}</span>
                                                    <span className={`text-xs font-bold uppercase ${STATUS_COLOR[b["Status"]] || ""}`}>{b["Status"]}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    <span className="font-semibold text-foreground">{b["Customer"]}</span> — {formatSlotRange(b["Time"], parseFloat(b["Duration (hrs)"]) || 1)}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{b["Services"]}</div>
                                            </div>
                                            <div className="text-primary font-bold text-sm whitespace-nowrap">LKR {parseFloat(b["Total Price"] || "0").toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Tools + Recent */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-5">Quick Tools</h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/services"
                                className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                            >
                                <Wrench className="w-5 h-5 text-primary" /> Add New Service
                                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                            </Link>
                            <a
                                href="/api/admin/download-bookings"
                                download
                                className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                            >
                                <Download className="w-5 h-5 text-primary" /> Download Excel Report
                                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                            </a>
                            <Link
                                href="/admin/bookings"
                                className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                            >
                                Manage All Bookings
                                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                            </Link>
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-border bg-muted/20">
                            <h2 className="font-bold text-foreground">Recent Bookings</h2>
                        </div>
                        <div className="divide-y divide-border">
                            {bookings.slice(0, 5).map((b, i) => (
                                <div key={i} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-xs text-foreground">{b["Booking Number"]}</span>
                                        <span className={`text-xs font-bold uppercase ${STATUS_COLOR[b["Status"]] || ""}`}>{b["Status"]}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-0.5">{b["Customer"]} — {b["Date"]}</div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="px-5 py-6 text-center text-muted-foreground text-sm">No bookings yet.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
