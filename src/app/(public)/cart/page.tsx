"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, AlertCircle, Calendar, Clock, ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { submitBooking } from "@/app/actions/booking";
import { MotionDiv, fadeIn } from "@/components/animated/MotionDiv";

const checkoutSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    phone: z.string().min(9, "Valid phone number is required"),
    carBrand: z.string().min(2, "Car brand is required"),
    carModel: z.string().min(2, "Car model is required"),
    carYear: z.string().min(4, "Valid year required").max(4),
    notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CartPage() {
    const { items, removeItem, getTotalPrice, getTotalDuration, clearCart } = useCartStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema)
    });

    const onSubmit = async (data: CheckoutFormValues) => {
        if (items.length === 0) return;
        setIsSubmitting(true);

        try {
            // Group services or just use the first date/time if multiple. 
            // For simplicity in this demo, we'll map all services but use the primary date/time.
            const primaryDate = items[0].selectedDate;
            const primaryTime = items[0].selectedTime;

            const bookingPayload = {
                customer_name: data.fullName,
                customer_phone: data.phone,
                car_brand: data.carBrand,
                car_model: data.carModel,
                car_year: data.carYear,
                service_ids: items.map(i => i.serviceId),
                service_names_snapshot: items.map(i => i.name),
                price_snapshot: getTotalPrice(),
                booking_date: primaryDate,
                booking_time: primaryTime,
                duration_hours: getTotalDuration(),
                total_price: getTotalPrice(),
                notes: data.notes || "",
                whatsapp_message: ""
            };

            // Generate WhatsApp msg
            const lineItems = items.map(i => `- ${i.name} (LKR ${i.price.toLocaleString()}) on ${i.selectedDate} at ${i.selectedTime}`).join("\n");
            const whatsappMsg = `*New Booking from PrimeTune Web*\n\n*Customer:* ${data.fullName}\n*Phone:* ${data.phone}\n*Vehicle:* ${data.carYear} ${data.carBrand} ${data.carModel}\n\n*Services Requested:*\n${lineItems}\n\n*Total Estimate:* LKR ${getTotalPrice().toLocaleString()}\n*Notes:* ${data.notes || 'None'}`;

            bookingPayload.whatsapp_message = whatsappMsg;

            // 1. Submit to server action (Supabase + Excel export)
            const res = await submitBooking(bookingPayload);

            if (!res.success) {
                console.error("Booking Error:", res.error);
                if (res.error === 'EXCEL_FILE_OPEN') {
                    alert("⚠️ Cannot save booking!\n\nThe Excel file (bookings_export.xlsx) is currently open on your computer.\n\nPlease close Microsoft Excel and try submitting again.");
                    return; // Stop here, don't clear cart or redirect to WhatsApp yet.
                }

                alert("There was a problem finalizing your booking online, but we will forward you to WhatsApp.");
            }

            // 2. Open WhatsApp
            const businessPhone = "94775056573";
            const waUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(whatsappMsg)}`;
            window.open(waUrl, "_blank");

            // 3. Clear cart & show success UI
            clearCart();
            setSuccess(true);

        } catch (e) {
            console.error(e);
            alert("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex-grow flex items-center justify-center py-20 bg-background">
                <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="max-w-md w-full mx-auto text-center px-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-4">Booking Received!</h1>
                    <p className="text-muted-foreground mb-8">
                        Your request has been submitted successfully and forwarded to our team via WhatsApp. We will contact you shortly to confirm your slot.
                    </p>
                    <Link href="/" className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-all">
                        Return to Home <ArrowRight className="w-4 h-4" />
                    </Link>
                </MotionDiv>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full pb-24 bg-background">
            <section className="bg-card border-b border-border py-12 px-4 text-center">
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Your Cart & Checkout</h1>
            </section>

            <section className="container mx-auto px-4 max-w-7xl mt-12">
                {items.length === 0 ? (
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="text-center py-20">
                        <Wrench className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-8">You haven't selected any services yet.</p>
                        <Link href="/services" className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all">
                            Browse Services
                        </Link>
                    </MotionDiv>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left: Cart Items */}
                        <div className="lg:col-span-7">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Selected Services ({items.length})</h2>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <MotionDiv key={item.cartItemId} initial="hidden" animate="visible" variants={fadeIn} className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center relative shadow-sm hover:border-primary/50 transition-colors">
                                        <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> {item.selectedDate}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> {item.selectedTime} ({item.duration}h)</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0">
                                            <span className="font-bold text-foreground text-lg">LKR {item.price.toLocaleString()}</span>
                                            <button
                                                onClick={() => removeItem(item.cartItemId)}
                                                className="text-destructive hover:text-red-700 p-2 sm:mt-2 bg-destructive/10 rounded-md transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </MotionDiv>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between items-center p-6 bg-card border border-border rounded-xl">
                                <span className="text-lg font-medium text-foreground">Total Estimate</span>
                                <span className="text-3xl font-black text-primary">LKR {getTotalPrice().toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Final price may verify based on on-site vehicle inspection.
                            </p>
                        </div>

                        {/* Right: Checkout Form */}
                        <div className="lg:col-span-5">
                            <div className="bg-card border border-border p-8 rounded-2xl shadow-xl sticky top-24">
                                <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4">Customer Details</h2>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</label>
                                        <input
                                            {...register("fullName")}
                                            className={`w-full bg-input border ${errors.fullName ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
                                            placeholder="e.g. Nimal Perera"
                                        />
                                        {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number *</label>
                                        <input
                                            {...register("phone")}
                                            className={`w-full bg-input border ${errors.phone ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
                                            placeholder="e.g. 077 505 6573"
                                        />
                                        {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-1.5">Car Brand *</label>
                                            <input
                                                {...register("carBrand")}
                                                className={`w-full bg-input border ${errors.carBrand ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
                                                placeholder="e.g. Toyota"
                                            />
                                            {errors.carBrand && <p className="text-destructive text-xs mt-1">{errors.carBrand.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-foreground mb-1.5">Car Model *</label>
                                            <input
                                                {...register("carModel")}
                                                className={`w-full bg-input border ${errors.carModel ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
                                                placeholder="e.g. Prado"
                                            />
                                            {errors.carModel && <p className="text-destructive text-xs mt-1">{errors.carModel.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">Manufacturing Year *</label>
                                        <input
                                            {...register("carYear")}
                                            className={`w-full bg-input border ${errors.carYear ? 'border-destructive' : 'border-border'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
                                            placeholder="e.g. 2018"
                                        />
                                        {errors.carYear && <p className="text-destructive text-xs mt-1">{errors.carYear.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1.5">Additional Notes</label>
                                        <textarea
                                            {...register("notes")}
                                            rows={3}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                            placeholder="Current mileage, specific issues, etc."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-6 bg-primary hover:bg-red-700 disabled:bg-secondary disabled:text-muted-foreground text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                                    >
                                        {isSubmitting ? "Processing..." : "Complete Booking"}
                                        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                                    </button>

                                    <p className="text-xs text-muted-foreground text-center mt-4 border-t border-border pt-4">
                                        By submitting this form, you will be redirected to WhatsApp to send your booking details directly to our workshop manager. We will record your slot and prepare for your arrival.
                                    </p>
                                </form>
                            </div>
                        </div>

                    </div>
                )}
            </section>
        </div>
    );
}
