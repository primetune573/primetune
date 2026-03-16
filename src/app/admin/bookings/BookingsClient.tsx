"use client";

import { useState, useMemo } from "react";
import { Clock, Trash2, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import {
    adminUpdateBookingStatus,
    adminCancelBooking,
    adminPermanentlyDeleteBooking,
} from "@/app/actions/admin";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-600",
    confirmed: "bg-blue-500/20 text-blue-600",
    completed: "bg-green-500/20 text-green-700 font-bold",
    cancelled: "bg-red-500/20 text-red-600",
};

const ROW_STYLES: Record<string, string> = {
    completed: "bg-green-500/5",
    cancelled: "bg-red-500/8 text-red-600",
};

export default function BookingsClient({ bookings }: { bookings: any[] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return bookings.filter((b) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                (b["Booking Number"] || "").toLowerCase().includes(q) ||
                (b["Customer"] || "").toLowerCase().includes(q);
            const matchStatus =
                statusFilter === "all" || b["Status"] === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [bookings, search, statusFilter]);

    const act = async (id: string, fn: () => Promise<any>) => {
        setLoading(id);
        try {
            const res = await fn();
            if (!res.success) alert(res.error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Booking Management</h1>
                    <p className="text-muted-foreground mt-1">Review, update, and manage all customer appointments.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by ID or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                        <Clock className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-foreground">No Bookings Found</h3>
                        <p className="text-muted-foreground mt-2">No bookings match your current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Booking ID / Date</th>
                                    <th className="px-5 py-4 font-semibold">Customer</th>
                                    <th className="px-5 py-4 font-semibold">Vehicle</th>
                                    <th className="px-5 py-4 font-semibold">Service & Price</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((b: any, i) => {
                                    const status = b["Status"] || "pending";
                                    const bn = b["Booking Number"] || "";
                                    const isLoading = loading === bn;
                                    const rowCls = ROW_STYLES[status] || "";
                                    const textCls = status === "cancelled" ? "text-red-500" : "";

                                    return (
                                        <tr key={i} className={`hover:bg-muted/10 transition-colors ${rowCls}`}>
                                            <td className="px-5 py-4">
                                                <div className={`font-bold ${textCls || "text-foreground"}`}>{bn}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {b["Date"]} • {b["Time"]} ({b["Duration (hrs)"]}h)
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`font-medium ${textCls || "text-foreground"}`}>{b["Customer"]}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{b["Phone"]}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`font-medium ${textCls || "text-foreground"}`}>{b["Car"]}</div>
                                            </td>
                                            <td className="px-5 py-4 max-w-xs">
                                                <div className={`truncate ${textCls || "text-foreground"}`}>{b["Services"]}</div>
                                                <div className="font-bold text-primary mt-1">
                                                    LKR {parseFloat(b["Total Price"] || "0").toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex gap-1.5 justify-end flex-wrap">
                                                    {/* Confirm (pending only) */}
                                                    {status === "pending" && (
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => act(bn, () => adminUpdateBookingStatus("", bn, "confirmed"))}
                                                            title="Mark Confirmed"
                                                            className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {/* Complete (confirmed only) */}
                                                    {status === "confirmed" && (
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => act(bn, () => adminUpdateBookingStatus("", bn, "completed"))}
                                                            title="Mark Completed"
                                                            className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {/* Cancel (pending or confirmed) */}
                                                    {(status === "pending" || status === "confirmed") && (
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => {
                                                                if (confirm(`Cancel booking ${bn}? The record will remain in the file marked as cancelled.`))
                                                                    act(bn, () => adminCancelBooking(bn));
                                                            }}
                                                            title="Cancel Booking"
                                                            className="p-2 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {/* Permanent delete */}
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => {
                                                            if (confirm(`PERMANENTLY delete booking ${bn}? This cannot be undone.`))
                                                                act(bn, () => adminPermanentlyDeleteBooking(bn));
                                                        }}
                                                        title="Delete Permanently"
                                                        className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
