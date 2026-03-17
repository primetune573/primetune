"use client";

import { CheckCircle2, Trophy, Users, Wrench } from "lucide-react";
import { MotionDiv, fadeIn, staggerContainer } from "@/components/animated/MotionDiv";

export default function AboutUsPage() {
    return (
        <div className="flex flex-col w-full pb-24 bg-background">

            {/* Header Banner */}
            <section className="relative h-64 md:h-96 w-full flex items-center justify-center overflow-hidden bg-card border-b border-border">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src="https://images.pexels.com/photos/4480505/pexels-photo-4480505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Garage Workshop"
                    className="absolute inset-0 w-full h-full object-cover grayscale"
                />
                <div className="container mx-auto px-4 relative z-20 text-center max-w-4xl">
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
                            Our <span className="text-primary">Story</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                            Driven by passion, guided by precision. We are PrimeTune Automotive.
                        </p>
                    </MotionDiv>
                </div>
            </section>

            {/* Intro & Mission */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full translate-x-4 translate-y-4" />
                            <img
                                src="https://media.istockphoto.com/id/472105032/photo/auto-mechanic-working-on-a-car-in-his-garage.jpg?s=612x612&w=0&k=20&c=EyooxvXg5ufoSyzocedNdPnKCuhKzbvFQ0__snVIwto="
                                alt="Mechanic at work"
                                className="rounded-2xl shadow-xl relative z-10 object-cover aspect-[4/3] border border-border"
                            />
                        </MotionDiv>

                        <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
                            <MotionDiv variants={fadeIn}>
                                <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Welcome to PrimeTune</h2>
                            </MotionDiv>
                            <MotionDiv variants={fadeIn}>
                                <h3 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                                    Redefining Car Maintenance in Sri Lanka
                                </h3>
                            </MotionDiv>
                            <MotionDiv variants={fadeIn}>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    PrimeTune Automotive was founded on a simple principle: to provide a dealership-level experience without the dealership price tag. Based in Ganethanna, we have built our reputation on trust, absolute transparency, and a genuine love for vehicles.
                                </p>
                                <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                                    Our mission is to keep you driving safely and smoothly. We invest heavily in advanced diagnostic tools, continuous mechanic training, and premium replacement parts because your car deserves nothing less than perfection.
                                </p>
                            </MotionDiv>
                        </MotionDiv>

                    </div>
                </div>
            </section>

            {/* Why Trust Us */}
            <section className="py-24 bg-card border-y border-border">
                <div className="container mx-auto px-4 max-w-7xl">
                    <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Why Trust PrimeTune?</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            We believe in fixing it right the first time. Here is what sets us apart from standard repair shops.
                        </p>
                    </MotionDiv>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Trophy, title: "Certified Expertise", desc: "Our technicians hold advanced certifications and undergo continuous training in modern vehicle electronics and mechanics." },
                            { icon: Wrench, title: "Premium Tools", desc: "We utilize laser-guided alignment machines, high-end OBD2 scanners, and specialized factory tools." },
                            { icon: Users, title: "Customer First", desc: "Honest communication. We never replace a part unless it's strictly necessary and we show you exactly why." }
                        ].map((item, i) => (
                            <MotionDiv key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.2 }} variants={fadeIn} className="bg-background border border-border p-8 rounded-2xl hover:border-primary transition-colors text-center group">
                                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                                <p className="text-muted-foreground">{item.desc}</p>
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Commitment */}
            <section className="py-24 relative overflow-hidden bg-primary/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2000&auto=format&fit=crop')] opacity-5 bg-cover bg-fixed bg-center" />
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <MotionDiv initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-8">The PrimeTune Promise</h2>
                        <p className="text-lg md:text-2xl font-medium text-foreground italic leading-relaxed mb-10">
                            "We treat every car like it belongs to our own family. No shortcuts, no compromises. Just honest, high-quality automotive engineering."
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                <span className="font-bold">100% Satisfaction</span>
                            </div>
                            <div className="hidden sm:block text-border">|</div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                <span className="font-bold">Genuine Parts Used</span>
                            </div>
                        </div>
                    </MotionDiv>
                </div>
            </section>

        </div>
    );
}
