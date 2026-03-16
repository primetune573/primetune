"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Clock, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { getAvailabilityBlocks, addAvailabilityBlock, deleteAvailabilityBlock } from "@/app/actions/admin";
import { MotionDiv, fadeIn } from "@/components/animated/MotionDiv";

export default function AvailabilityManagement() {
    const [blocks, setBlocks] = useState<any>({ holidays: [], blocked_slots: [] });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [type, setType] = useState<"full-day" | "partial">("full-day");
    const [date, setDate] = useState("");
    const [startHour, setStartHour] = useState("8");
    const [endHour, setEndHour] = useState("10");
    const [reason, setReason] = useState("");

    const fetchBlocks = async () => {
        setLoading(true);
        const data = await getAvailabilityBlocks();
        setBlocks(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!date || !reason) {
            setError("Please fill in all fields.");
            return;
        }

        if (type === "partial" && parseInt(startHour) >= parseInt(endHour)) {
            setError("End time must be after start time.");
            return;
        }

        setSubmitting(true);
        const res = await addAvailabilityBlock({
            type,
            date,
            start_hour: type === "partial" ? parseInt(startHour) : 0,
            end_hour: type === "partial" ? parseInt(endHour) : 24,
            reason
        });

        if (res.success) {
            setSuccess("Block added successfully!");
            setReason("");
            fetchBlocks();
        } else {
            setError(res.error || "Failed to add block.");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string, blockType: "full-day" | "partial") => {
        if (!confirm("Are you sure you want to remove this block?")) return;

        const res = await deleteAvailabilityBlock(id, blockType);
        if (res.success) {
            fetchBlocks();
        } else {
            alert("Failed to delete block.");
        }
    };

    const formatHour = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${display}:00 ${ampm}`;
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Schedule Control</h1>
                    <p className="text-muted-foreground mt-1">Manage workshop closures and emergency availability blocks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="bg-card border border-border p-6 rounded-2xl shadow-xl sticky top-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" /> Add New Block
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground text-[10px]">Block Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setType("full-day")}
                                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${type === "full-day" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-background border-border hover:bg-secondary"}`}
                                    >
                                        Full Day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("partial")}
                                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${type === "partial" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-background border-border hover:bg-secondary"}`}
                                    >
                                        Time Range
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground text-[10px]">Select Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                />
                            </div>

                            {type === "partial" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground text-[10px]">Start</label>
                                        <select
                                            value={startHour}
                                            onChange={(e) => setStartHour(e.target.value)}
                                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            {Array.from({ length: 11 }, (_, i) => i + 8).map(h => (
                                                <option key={h} value={h}>{formatHour(h)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground text-[10px]">End</label>
                                        <select
                                            value={endHour}
                                            onChange={(e) => setEndHour(e.target.value)}
                                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            {Array.from({ length: 11 }, (_, i) => i + 9).map(h => (
                                                <option key={h} value={h}>{formatHour(h)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-muted-foreground text-[10px]">Reason / Message</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Public Holiday, Emergency Handle, Maintenance..."
                                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">This will be shown to customers visiting the booking page.</p>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold p-3 rounded-xl flex items-center gap-2 uppercase tracking-tighter">
                                    <ShieldAlert className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2 uppercase tracking-tighter">
                                    <CheckCircle2 className="w-4 h-4" /> {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add Availability Block
                            </button>
                        </form>
                    </MotionDiv>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" /> Active Blocks
                        </h2>
                        <span className="text-[10px] font-black uppercase bg-secondary px-3 py-1 rounded-full text-muted-foreground tracking-widest">
                            {blocks.holidays.length + blocks.blocked_slots.length} Total
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border border-dashed">
                            <Loader2 className="w-10 h-10 animate-spin text-primary/30 mb-4" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading entries...</p>
                        </div>
                    ) : blocks.holidays.length === 0 && blocks.blocked_slots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border border-dashed text-center px-10">
                            <CheckCircle2 className="w-12 h-12 text-primary/20 mb-4" />
                            <h3 className="text-lg font-bold text-foreground">No active blocks</h3>
                            <p className="text-muted-foreground text-sm mt-1">All standard operating hours are currently available for booking.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Day Blocks */}
                            {blocks.holidays.map((block: any) => (
                                <BlockCard key={block.id} block={block} onDelete={handleDelete} isFull />
                            ))}
                            {/* Partial Blocks */}
                            {blocks.blocked_slots.map((block: any) => (
                                <BlockCard key={block.id} block={block} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BlockCard({ block, onDelete, isFull }: any) {
    return (
        <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${isFull ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                    {isFull ? 'Full Day Closure' : 'Time Range Block'}
                </div>
                <button
                    onClick={() => onDelete(block.id, isFull ? 'full-day' : 'partial')}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2.5 rounded-xl">
                        <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Date</p>
                        <p className="font-bold text-foreground">{new Date(block.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {!isFull && (
                    <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2.5 rounded-xl">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Duration</p>
                            <p className="font-bold text-foreground">
                                {block.start_hour}:00 {block.start_hour >= 12 ? 'PM' : 'AM'} — {block.end_hour}:00 {block.end_hour >= 12 ? 'PM' : 'AM'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-secondary/30 border border-border rounded-xl p-3 flex gap-3 mt-4">
                    <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Reason</p>
                        <p className="text-sm font-medium text-foreground leading-relaxed">{block.reason}</p>
                    </div>
                </div>
            </div>
        </MotionDiv>
    );
}
