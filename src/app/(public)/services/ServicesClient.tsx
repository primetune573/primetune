"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { MotionDiv, fadeIn, staggerContainer } from "@/components/animated/MotionDiv";

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Maintenance", "Performance", "Engine", "Emergency"];

    const filteredServices = initialServices.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.summary && s.summary.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === "All" || s.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col w-full pb-24">

            {/* Page Header */}
            <section className="bg-card border-b border-border py-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    <MotionDiv initial="hidden" animate="visible" variants={fadeIn} className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Our Services</h1>
                        <p className="text-lg text-muted-foreground">
                            From routine maintenance to complex electrical and engine diagnostics,
                            we handle everything with absolute precision.
                        </p>
                    </MotionDiv>
                </div>
            </section>

            {/* Filter and Search - Optimized by removing backdrop-blur from sticky interaction */}
            <section className="py-8 bg-background sticky top-[72px] z-40 border-b border-border bg-background shadow-sm will-change-transform">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${activeCategory === cat
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-input border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground transition-all"
                        />
                    </div>

                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 bg-background flex-grow">
                <div className="container mx-auto px-4 max-w-7xl">

                    {filteredServices.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">No services found matching your search.</p>
                            <button
                                onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                                className="mt-4 text-primary font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <MotionDiv
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredServices.map(service => (
                                <MotionDiv key={service.id} variants={fadeIn} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-colors flex flex-col h-full shadow-lg">
                                    <div className="relative h-48 overflow-hidden bg-secondary flex items-center justify-center">
                                        {service.emergency && (
                                            <div className="absolute top-3 right-3 z-20 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-destructive/50">
                                                <ShieldAlert className="w-3 h-3" /> Emergency
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No Image</span>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-foreground leading-tight">{service.name}</h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {service.summary}
                                        </p>

                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-primary text-lg">LKR {service.price?.toLocaleString()}</span>
                                                <span className="flex items-center gap-1 text-muted-foreground font-medium">
                                                    <Clock className="w-4 h-4" /> {service.duration_hours}h
                                                </span>
                                            </div>

                                            <Link
                                                href={`/services/${service.id}`}
                                                className="w-full bg-secondary hover:bg-primary hover:text-white text-foreground font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-all border border-border group-hover:border-primary border-transparent"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </MotionDiv>
                            ))}
                        </MotionDiv>
                    )}

                </div>
            </section>

        </div>
    );
}
