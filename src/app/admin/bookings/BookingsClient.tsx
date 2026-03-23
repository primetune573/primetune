"use client";

import { useState, useMemo, useTransition } from "react";
import { Clock, Trash2, CheckCircle, XCircle, Search, RefreshCw, AlertCircle, Phone, Car, Calendar, FileText } from "lucide-react";
import {
    adminUpdateBookingStatus,
    adminCancelBooking,
    adminPermanentlyDeleteBooking,
    adminReactivateBooking,
} from "@/app/actions/admin";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-200",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
    completed: "bg-green-500/10 text-green-700 border-green-200 font-bold",
    cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export default function BookingsClient({ bookings }: { bookings: any[] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingNumber: string; reason: string }>({
        open: false,
        bookingNumber: "",
        reason: "",
    });
    const [completionModal, setCompletionModal] = useState<{
        open: boolean;
        booking: any;
        discountType: 'none' | 'amount' | 'percentage';
        discountValue: number;
        parts: { name: string; qty: number; unitPrice: number }[];
    }>({
        open: false,
        booking: null,
        discountType: 'none',
        discountValue: 0,
        parts: []
    });

    const filtered = useMemo(() => {
        return bookings.filter((b) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                (b["Booking Number"] || "").toLowerCase().includes(q) ||
                (b["Customer"] || "").toLowerCase().includes(q) ||
                (b["Phone"] || "").toLowerCase().includes(q) ||
                (b["Car"] || "").toLowerCase().includes(q) ||
                (b["Plate"] || "").toLowerCase().includes(q) ||
                (b["Cancellation Reason"] || "").toLowerCase().includes(q);
            const matchStatus =
                statusFilter === "all" || b["Status"] === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [bookings, search, statusFilter]);

    const act = (id: string, fn: () => Promise<any>) => {
        setLoading(id);
        startTransition(async () => {
            try {
                const res = await fn();
                if (!res?.success) alert(res?.error);
            } finally {
                setLoading(null);
            }
        });
    };

    const handleCancelSubmit = async () => {
        if (!cancelModal.reason.trim()) {
            alert("Please provide a reason for cancellation.");
            return;
        }
        await act(cancelModal.bookingNumber, () => adminCancelBooking(cancelModal.bookingNumber, cancelModal.reason));
        setCancelModal({ open: false, bookingNumber: "", reason: "" });
    };

    const handleCompletionSubmit = async () => {
        const b = completionModal.booking;
        const originalLabor = parseFloat(b["Total Price"] || "0");
        let finalLabor = originalLabor;

        if (completionModal.discountType === 'amount') {
            finalLabor = Math.max(0, originalLabor - completionModal.discountValue);
        } else if (completionModal.discountType === 'percentage') {
            finalLabor = Math.max(0, originalLabor * (1 - completionModal.discountValue / 100));
        }

        const partsTotal = completionModal.parts.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0);
        const finalTotal = finalLabor + partsTotal;

        await act(b["Booking Number"], () =>
            adminUpdateBookingStatus("", b["Booking Number"], "completed", undefined, {
                original_labor_price: originalLabor,
                discount_type: completionModal.discountType,
                discount_value: completionModal.discountValue,
                final_labor_price: finalLabor,
                parts_total: partsTotal,
                final_total: finalTotal,
                extra_items: completionModal.parts
            })
        );
        setCompletionModal(prev => ({ ...prev, open: false }));
    };

    const getRangeLabel = (startTime: string, duration: number) => {
        if (!startTime) return "";
        try {
            const [timePart, ampm] = startTime.split(" ");
            let hour = parseInt(timePart.split(":")[0]);
            if (ampm === "PM" && hour !== 12) hour += 12;
            if (ampm === "AM" && hour === 12) hour = 0;

            const endHour = hour + duration;
            const endAmpm = endHour >= 12 && endHour < 24 ? "PM" : "AM";
            let displayEndHour = endHour % 12;
            if (displayEndHour === 0) displayEndHour = 12;

            return `${startTime} - ${displayEndHour}:00 ${endAmpm}`;
        } catch {
            return startTime;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Booking Management</h1>
                    <p className="text-muted-foreground mt-1">Review, update, and manage all customer appointments.</p>
                </div>
                <div className="flex gap-3 flex-wrap w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:flex-none bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search ID, name, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        />
                    </div>
                </div>
            </div>

            {/* Bookings Display */}
            <div className="grid grid-cols-1 gap-4 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <Clock className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-foreground">No Bookings Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View (Table) - Hidden on Mobile */}
                        <div className="hidden lg:block bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Booking ID / Date</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Customer & Contact</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Vehicle</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Service & Price</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((b: any, i) => {
                                        const status = b["Status"] || "pending";
                                        const bn = b["Booking Number"] || "";
                                        const isLoading = loading === bn;
                                        const isCancelled = status === "cancelled";

                                        return (
                                            <tr key={bn || i} className={`hover:bg-muted/5 transition-colors ${isCancelled ? 'bg-red-500/[0.02]' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className={`font-bold ${isCancelled ? "text-red-500" : "text-foreground"}`}>{bn}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 whitespace-nowrap">
                                                        <Calendar className="w-3 h-3" /> {b["Date"]} • {getRangeLabel(b["Time"], parseFloat(b["Duration (hrs)"] || "1"))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`font-semibold ${isCancelled ? "text-red-400" : "text-foreground"}`}>{b["Customer"]}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3" /> {b["Phone"]}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${isCancelled ? "text-red-400" : "text-muted-foreground"}`}>
                                                        <Car className="w-3.5 h-3.5" /> {b["Car"]}
                                                    </div>
                                                    {b["Plate"] && (
                                                        <div className="mt-1">
                                                            <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-black tracking-wider border border-border">
                                                                {b["Plate"]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`truncate max-w-[180px] font-medium ${isCancelled ? "text-red-300" : "text-foreground"}`}>{b["Services"]}</div>
                                                    <div className="font-bold text-primary text-xs mt-1">LKR {parseFloat(b["Total Price"] || "0").toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                                                        {status}
                                                    </span>
                                                    {isCancelled && b["Cancellation Reason"] && (
                                                        <div className="text-[10px] text-red-500 italic mt-1.5 max-w-[150px] truncate" title={b["Cancellation Reason"]}>
                                                            Reason: {b["Cancellation Reason"]}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <ActionButtons
                                                            bn={bn}
                                                            status={status}
                                                            isLoading={isLoading}
                                                            act={act}
                                                            setCancelModal={setCancelModal}
                                                            setCompletionModal={setCompletionModal}
                                                            booking={b}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (Cards) - Shown on smaller screens */}
                        <div className="lg:hidden grid grid-cols-1 gap-4">
                            {filtered.map((b: any, i) => {
                                const status = b["Status"] || "pending";
                                const bn = b["Booking Number"] || "";
                                const isLoading = loading === bn;
                                const isCancelled = status === "cancelled";

                                return (
                                    <div key={bn || i} className={`bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 ${isCancelled ? 'border-red-500/20 bg-red-500/[0.02]' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className={`text-lg font-black tracking-tight ${isCancelled ? "text-red-500" : "text-foreground"}`}>{bn}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                                    <Calendar className="w-4 h-4 text-primary" /> {b["Date"]} • {getRangeLabel(b["Time"], parseFloat(b["Duration (hrs)"] || "1"))}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Customer</p>
                                                <p className={`font-bold text-sm leading-tight ${isCancelled ? "text-red-400" : ""}`}>{b["Customer"]}</p>
                                                <p className="text-xs text-muted-foreground">{b["Phone"]}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Vehicle</p>
                                                <p className={`font-bold text-sm leading-tight ${isCancelled ? "text-red-400" : ""}`}>{b["Car"]}</p>
                                                {b["Plate"] && <span className="text-[10px] font-black bg-secondary px-2 py-0.5 rounded border border-border inline-block mt-0.5">{b["Plate"]}</span>}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider underline decoration-primary/30">Requested Service</p>
                                            <div className="flex justify-between items-end">
                                                <span className={`text-sm font-semibold truncate ${isCancelled ? "text-red-300" : ""}`}>{b["Services"]}</span>
                                                <span className="text-primary font-black text-xs">LKR {parseFloat(b["Total Price"] || "0").toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {isCancelled && b["Cancellation Reason"] && (
                                            <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span><strong>Cancellation Reason:</strong> {b["Cancellation Reason"]}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2">
                                            <ActionButtons
                                                bn={bn}
                                                status={status}
                                                isLoading={isLoading}
                                                act={act}
                                                setCancelModal={setCancelModal}
                                                setCompletionModal={setCompletionModal}
                                                mobileFull
                                                booking={b}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Completion Modal */}
            {completionModal.open && completionModal.booking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 my-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Complete Job: {completionModal.booking["Booking Number"]}</h3>
                                <p className="text-muted-foreground text-sm font-medium">Finalize pricing, apply discounts, and add parts.</p>
                            </div>
                            <button onClick={() => setCompletionModal(prev => ({ ...prev, open: false }))} className="p-2 hover:bg-secondary rounded-full">
                                <XCircle className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Labor Section */}
                            <div className="bg-muted/30 p-5 rounded-2xl border border-border">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Labor & Discounts
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Service Base Price (LKR)</label>
                                        <div className="text-2xl font-black text-foreground tabular-nums">
                                            {parseFloat(completionModal.booking["Total Price"] || "0").toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Apply Discount</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCompletionModal(p => ({ ...p, discountType: 'none', discountValue: 0 }))}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${completionModal.discountType === 'none' ? 'bg-primary text-white border-primary' : 'bg-card border-border'}`}
                                            >NONE</button>
                                            <button
                                                onClick={() => setCompletionModal(p => ({ ...p, discountType: 'amount', discountValue: 0 }))}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${completionModal.discountType === 'amount' ? 'bg-primary text-white border-primary' : 'bg-card border-border'}`}
                                            >AMOUNT</button>
                                            <button
                                                onClick={() => setCompletionModal(p => ({ ...p, discountType: 'percentage', discountValue: 0 }))}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${completionModal.discountType === 'percentage' ? 'bg-primary text-white border-primary' : 'bg-card border-border'}`}
                                            >% PERCENT</button>
                                        </div>
                                        {completionModal.discountType !== 'none' && (
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={completionModal.discountValue || ""}
                                                    onChange={e => setCompletionModal(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))}
                                                    placeholder={completionModal.discountType === 'amount' ? "Enter Amount..." : "Enter Percentage..."}
                                                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">
                                                    {completionModal.discountType === 'amount' ? "LKR" : "%"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Parts Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Car className="w-4 h-4" /> Parts & Extra Items
                                    </h4>
                                    <button
                                        onClick={() => setCompletionModal(p => ({ ...p, parts: [...p.parts, { name: "", qty: 1, unitPrice: 0 }] }))}
                                        className="text-[10px] font-black uppercase tracking-widest bg-secondary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg border border-border transition-all"
                                    >+ Add Part</button>
                                </div>

                                <div className="space-y-3">
                                    {completionModal.parts.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed border-border rounded-2xl bg-muted/10">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">No extra parts added.</p>
                                        </div>
                                    ) : (
                                        completionModal.parts.map((part, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-3 items-end animate-in slide-in-from-left-2 duration-200">
                                                <div className="col-span-12 md:col-span-5 space-y-1.5">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Part Name</label>
                                                    <input
                                                        value={part.name}
                                                        onChange={e => {
                                                            const newParts = [...completionModal.parts];
                                                            newParts[idx].name = e.target.value;
                                                            setCompletionModal(p => ({ ...p, parts: newParts }));
                                                        }}
                                                        placeholder="e.g. Oil Filter"
                                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-4 md:col-span-2 space-y-1.5">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Qty</label>
                                                    <input
                                                        type="number"
                                                        value={part.qty}
                                                        onChange={e => {
                                                            const newParts = [...completionModal.parts];
                                                            newParts[idx].qty = parseInt(e.target.value) || 0;
                                                            setCompletionModal(p => ({ ...p, parts: newParts }));
                                                        }}
                                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="col-span-6 md:col-span-4 space-y-1.5">
                                                    <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Unit Price</label>
                                                    <input
                                                        type="number"
                                                        value={part.unitPrice}
                                                        onChange={e => {
                                                            const newParts = [...completionModal.parts];
                                                            newParts[idx].unitPrice = parseFloat(e.target.value) || 0;
                                                            setCompletionModal(p => ({ ...p, parts: newParts }));
                                                        }}
                                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none text-right"
                                                    />
                                                </div>
                                                <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                                    <button
                                                        onClick={() => {
                                                            const newParts = completionModal.parts.filter((_, i) => i !== idx);
                                                            setCompletionModal(p => ({ ...p, parts: newParts }));
                                                        }}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    ><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Summary Footer */}
                            <div className="border-t border-border pt-6 space-y-2">
                                <div className="flex justify-between text-muted-foreground text-sm font-medium">
                                    <span>Labor After Discount:</span>
                                    <span className="tabular-nums">LKR {(() => {
                                        const orig = parseFloat(completionModal.booking["Total Price"] || "0");
                                        let final = orig;
                                        if (completionModal.discountType === 'amount') final -= completionModal.discountValue;
                                        if (completionModal.discountType === 'percentage') final *= (1 - completionModal.discountValue / 100);
                                        return Math.max(0, final).toLocaleString();
                                    })()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground text-sm font-medium">
                                    <span>Parts Total:</span>
                                    <span className="tabular-nums">LKR {completionModal.parts.reduce((s, p) => s + (p.qty * p.unitPrice), 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xl font-black text-foreground uppercase tracking-tight">Final Payable Total:</span>
                                    <span className="text-3xl font-black text-primary tabular-nums">LKR {(() => {
                                        const orig = parseFloat(completionModal.booking["Total Price"] || "0");
                                        let finalLabor = orig;
                                        if (completionModal.discountType === 'amount') finalLabor -= completionModal.discountValue;
                                        if (completionModal.discountType === 'percentage') finalLabor *= (1 - completionModal.discountValue / 100);
                                        const parts = completionModal.parts.reduce((s, p) => s + (p.qty * p.unitPrice), 0);
                                        return Math.max(0, finalLabor + parts).toLocaleString();
                                    })()}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setCompletionModal(prev => ({ ...prev, open: false }))}
                                    className="flex-1 py-4 border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-colors"
                                >Cancel</button>
                                <button
                                    onClick={handleCompletionSubmit}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-600/20 transition-all active:scale-95"
                                >Confirm & Complete Job</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Cancel Booking</h3>
                                <p className="text-muted-foreground text-sm font-medium">Please provide a reason for cancelling {cancelModal.bookingNumber}.</p>
                            </div>
                            <button onClick={() => setCancelModal({ ...cancelModal, open: false })} className="p-2 hover:bg-secondary rounded-full">
                                <XCircle className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Reason for Cancellation</label>
                                <textarea
                                    value={cancelModal.reason}
                                    onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                                    rows={4}
                                    placeholder="e.g. Customer requested cancellation via phone..."
                                    className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/30 outline-none resize-none transition-shadow"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCancelModal({ ...cancelModal, open: false })}
                                    className="flex-1 py-4 border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-colors font-sans"
                                >Keep Booking</button>
                                <button
                                    onClick={handleCancelSubmit}
                                    disabled={!cancelModal.reason.trim()}
                                    className="flex-1 py-4 bg-destructive text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-destructive/20 transition-all active:scale-95 disabled:opacity-50"
                                >Confirm Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButtons({ bn, status, isLoading, act, setCancelModal, setCompletionModal, mobileFull, booking }: any) {
    return (
        <div className={`flex gap-2 ${mobileFull ? 'w-full' : ''}`}>
            {status === "completed" && (
                <button
                    onClick={() => generateInvoicePDF(booking)}
                    className={`flex-1 h-10 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all active:scale-95 ${mobileFull ? '' : 'px-3'}`}
                    title="Download Invoice PDF"
                >
                    <FileText className="w-4 h-4" /> {(!mobileFull || mobileFull) && "Invoice"}
                </button>
            )}
            {status === "pending" && (
                <button
                    disabled={isLoading}
                    onClick={() => act(bn, () => adminUpdateBookingStatus("", bn, "confirmed"))}
                    className={`flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-blue-600/10 transition-all active:scale-95 disabled:opacity-50 ${mobileFull ? '' : 'px-3'}`}
                >
                    <CheckCircle className="w-4 h-4" /> {!mobileFull && "Confirm"}
                </button>
            )}
            {status === "confirmed" && (
                <button
                    disabled={isLoading}
                    onClick={() => setCompletionModal({
                        open: true,
                        booking: booking,
                        discountType: 'none',
                        discountValue: 0,
                        parts: []
                    })}
                    className={`flex-1 h-10 bg-green-600 text-white hover:bg-green-700 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-green-600/10 transition-all active:scale-95 disabled:opacity-50 ${mobileFull ? '' : 'px-3'}`}
                >
                    <CheckCircle className="w-4 h-4" /> {!mobileFull && "Complete"}
                </button>
            )}
            {status === "cancelled" && (
                <button
                    disabled={isLoading}
                    onClick={() => {
                        if (confirm(`Re-activate booking ${bn}? Status will be reset to pending.`)) {
                            act(bn, () => adminReactivateBooking(bn));
                        }
                    }}
                    className={`flex-1 h-10 bg-amber-600 text-white hover:bg-amber-700 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-amber-600/10 transition-all active:scale-95 disabled:opacity-50 ${mobileFull ? '' : 'px-3'}`}
                >
                    <RefreshCw className="w-4 h-4" /> Re-activate
                </button>
            )}
            {(status === "pending" || status === "confirmed") && (
                <button
                    disabled={isLoading}
                    onClick={() => setCancelModal({ open: true, bookingNumber: bn, reason: "" })}
                    className={`h-10 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl flex items-center justify-center px-3 transition-colors disabled:opacity-50 ${mobileFull ? 'flex-1' : ''}`}
                >
                    <XCircle className="w-4 h-4" /> {mobileFull && <span className="ml-2 font-bold">Cancel</span>}
                </button>
            )}
            <button
                disabled={isLoading}
                onClick={() => {
                    if (confirm(`PERMANENTLY delete booking ${bn}? This cannot be undone.`))
                        act(bn, () => adminPermanentlyDeleteBooking(bn));
                }}
                className={`h-10 border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl flex items-center justify-center px-3 transition-colors disabled:opacity-50 ${mobileFull ? 'flex-1 md:flex-none' : ''}`}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
