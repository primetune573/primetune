"use client";

import { useState } from "react";
import { Save, User, Building, Banknote } from "lucide-react";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock settings data for demo
    const [settings, setSettings] = useState({
        businessName: "PrimeTune Automotive",
        contactEmail: "support@primetune.lk",
        contactPhone: "077 505 6573",
        currency: "LKR",
        bookingGap: "30",
        maxDuration: "8",
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        // Simulate saving settings (In a real app, send to Supabase business_settings table)
        setTimeout(() => {
            setSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Garage Settings</h1>
                <p className="text-muted-foreground mt-1">Configure your business details and booking parameters.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                {/* Business Settings section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" /> Business Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Business Name</label>
                            <input
                                type="text"
                                name="businessName"
                                value={settings.businessName}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Contact Email</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={settings.contactEmail}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Hotline (WhatsApp)</label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={settings.contactPhone}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Booking Parameters section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" /> Booking Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Currency</label>
                            <select
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="LKR">LKR (Sri Lankan Rupee)</option>
                                <option value="USD">USD (US Dollar)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1.5">Gap Between Bookings (mins)</label>
                            <input
                                type="number"
                                name="bookingGap"
                                value={settings.bookingGap}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Submission */}
                <div className="flex items-center justify-end gap-4">
                    {success && <span className="text-green-600 font-semibold text-sm">Settings saved successfully!</span>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>

            </form>
        </div>
    );
}
