"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Mail, PhoneCall, Link2 } from "lucide-react";
import { MotionDiv, fadeIn, staggerContainer } from "@/components/animated/MotionDiv";
import Link from "next/link";

export default function ContactUsPage() {
    const [formData, setFormData] = useState({ name: "", phone: "", message: "" });

    const handleWhatsAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.message) {
            alert("Please fill in all fields.");
            return;
        }

        const businessPhone = "94775056573";
        const text = `*New Inquiry from PrimeTune Web*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n\n*Message:*\n${formData.message}`;
        const waUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(text)}`;

        window.open(waUrl, "_blank");

        // Reset form
        setFormData({ name: "", phone: "", message: "" });
    };
    return (
        <div className="flex flex-col w-full pb-24 bg-background">

            {/* Header Banner */}
            <section className="bg-card border-b border-border py-20 px-4">
                <div className="container mx-auto max-w-7xl text-center">
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Contact PrimeTune</h1>
                        <p className="text-lg text-muted-foreground">
                            Have a question or need emergency assistance? We are here to help. Reach out to us via phone, email, or visit our garage directly.
                        </p>
                    </MotionDiv>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Left: Contact Details & Form */}
                        <div className="space-y-12">

                            <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <MotionDiv variants={fadeIn} className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm">
                                    <div className="bg-primary/20 p-3 rounded-lg text-primary">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">Our Location</h3>
                                        <p className="text-sm text-muted-foreground">1104 Kandy - Colombo Rd, <br /> Ganethanna</p>
                                    </div>
                                </MotionDiv>

                                <MotionDiv variants={fadeIn} className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm">
                                    <div className="bg-primary/20 p-3 rounded-lg text-primary">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">Call Us</h3>
                                        <a href="tel:+94775056573" className="text-sm text-muted-foreground hover:text-primary transition-colors">077 505 6573</a>
                                    </div>
                                </MotionDiv>

                                <MotionDiv variants={fadeIn} className="bg-card border border-border p-6 rounded-xl flex items-start gap-4 shadow-sm md:col-span-2">
                                    <div className="bg-primary/20 p-3 rounded-lg text-primary">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="font-bold text-foreground mb-2">Working Hours</h3>
                                        <ul className="text-sm text-muted-foreground space-y-1 w-full max-w-xs">
                                            <li className="flex justify-between border-b border-border/50 pb-1"><span>Sat - Thu</span> <span>8:00 AM – 6:00 PM</span></li>
                                            <li className="flex justify-between pt-1"><span>Friday</span> <span className="text-destructive font-bold">Closed</span></li>
                                        </ul>
                                    </div>
                                </MotionDiv>

                            </MotionDiv>

                            <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-card border border-border p-8 rounded-2xl shadow-xl">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
                                <form className="space-y-4" onSubmit={handleWhatsAppSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">Phone</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="077 xxxx xxx"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                            placeholder="How can we help you?"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/20">
                                        Send Inquiry
                                    </button>
                                </form>
                            </MotionDiv>

                        </div>

                        {/* Right: Map & Emergency */}
                        <div className="space-y-8 flex flex-col">

                            <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="flex-grow min-h-[400px] w-full bg-card border border-border rounded-2xl overflow-hidden relative shadow-xl">
                                {/* Google Maps Embed using an iframe */}
                                <iframe
                                    src="https://maps.google.com/maps?q=7F2J%2B4W%20Hingula&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(100%)" }} // Nice dark mode effect for map
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                                {/* Overlay for pure click if maps API starts showing standard white overlays */}
                                <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur border border-border p-4 rounded-xl shadow-lg">
                                    <h3 className="font-bold text-foreground">PrimeTune Automotive</h3>
                                    <p className="text-sm text-muted-foreground mt-1">1104 Kandy - Colombo Rd</p>
                                    <a href="https://maps.app.goo.gl/D1jwytYa2zw9zB1AA" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold mt-2 flex items-center gap-1 hover:underline">
                                        <Link2 className="w-4 h-4" /> Open in Maps
                                    </a>
                                </div>
                            </MotionDiv>

                            <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-primary/10 border border-primary/20 p-8 rounded-2xl text-center flex flex-col items-center">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Breakdown?</h2>
                                <p className="text-muted-foreground mb-6">Don't wait. Call our emergency hotline for rapid assistance and priority booking.</p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <a href="tel:+94775056573" className="flex-1 bg-destructive hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg hover:shadow-red-500/40 flex items-center justify-center gap-2">
                                        <PhoneCall className="w-5 h-5" /> Call Now
                                    </a>
                                    <a href="https://wa.me/94775056573" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition-colors shadow-lg hover:shadow-[#25D366]/40 flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.127.551 4.195 1.595 6.02L.014 24l6.096-1.597c1.761.954 3.738 1.458 5.92 1.458 6.646 0 12.03-5.384 12.03-12.03C24 5.385 18.677 0 12.031 0zm0 21.916c-1.803 0-3.568-.485-5.118-1.403l-.367-.218-3.8.996.996-3.8-.239-.38C2.476 15.394 1.94 13.736 1.94 12.031c0-5.576 4.54-10.116 10.116-10.116 5.577 0 10.117 4.54 10.117 10.116 0 5.577-4.54 10.116-10.117 10.116zm5.545-7.568c-.304-.152-1.795-.885-2.074-.984-.278-.1-.482-.152-.684.152-.203.303-.785.986-.963 1.189-.176.202-.355.228-.658.076-.304-.153-1.284-.474-2.447-1.51-1.018-.908-1.705-2.03-1.908-2.333-.203-.304-.022-.468.13-.62.136-.136.304-.355.456-.532.152-.177.203-.304.304-.506.101-.202.05-.38-.025-.532-.076-.152-.684-1.649-.938-2.257-.247-.59-.498-.51-.684-.52-.177-.008-.38-.01-.583-.01-.202 0-.532.076-.81.38-.278.303-1.063 1.037-1.063 2.532s1.088 2.936 1.24 3.139c.152.203 2.138 3.264 5.18 4.58.723.314 1.288.5 1.73.642.727.23 1.385.197 1.905.118.583-.087 1.795-.733 2.049-1.442.253-.709.253-1.317.177-1.443-.076-.126-.279-.202-.583-.354z" /></svg>
                                        WhatsApp
                                    </a>
                                </div>
                            </MotionDiv>

                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
