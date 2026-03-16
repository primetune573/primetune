import Link from "next/link";
import { MapPin, Phone, Clock, Star, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import { MotionDiv, fadeIn, staggerContainer } from "@/components/animated/MotionDiv";

export function Footer() {
    return (
        <footer className="bg-card border-t border-border pt-16 pb-8 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <MotionDiv
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
                >

                    {/* Brand */}
                    <MotionDiv variants={fadeIn} className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group mb-4">
                            <Image
                                src="/logo.png?v=2"
                                alt="PrimeTune Automotive Logo"
                                width={150}
                                height={50}
                                className="object-contain h-10 w-auto"
                                unoptimized
                            />
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Premium automotive repair and maintenance services in Sri Lanka.
                            We deliver trust, speed, and exceptional quality to keep you on the road safely.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://www.facebook.com/people/PrimeTune-Automotive/61582137434700/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-all hover:bg-primary hover:text-white hover:-translate-y-1">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://www.instagram.com/primetune_automotive/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-all hover:bg-primary hover:text-white hover:-translate-y-1">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://www.tiktok.com/@primetune.automot" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground transition-all hover:bg-primary hover:text-white hover:-translate-y-1">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 1 .19V9.41a6.32 6.32 0 0 0-1-.08A6.34 6.34 0 0 0 5 15.67a6.34 6.34 0 0 0 11.53 3.53v-8.19a8.27 8.27 0 0 0 4.69 1.44V8.89a4.57 4.57 0 0 1-1.63-.2z" /></svg>
                            </a>
                        </div>
                    </MotionDiv>

                    {/* Quick Links */}
                    <MotionDiv variants={fadeIn} className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
                        <ul className="space-y-2">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Services", href: "/services" },
                                { label: "About Us", href: "/about" },
                                { label: "Contact Us", href: "/contact" },
                                { label: "Book Appointment", href: "/services" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </MotionDiv>

                    {/* Contact Details */}
                    <MotionDiv variants={fadeIn} className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>1104 Kandy - Colombo Rd, Ganethanna</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <a href="tel:+94775056573" className="hover:text-primary transition-colors">077 505 6573</a>
                            </li>
                            <li className="flex items-start gap-3 mt-4">
                                <Link href="/contact" className="inline-flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground text-xs px-3 py-1.5 rounded transition-colors font-medium border border-border">
                                    Direction & Map
                                </Link>
                            </li>
                        </ul>
                    </MotionDiv>

                    {/* Working Hours */}
                    <MotionDiv variants={fadeIn} className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Working Hours</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex justify-between border-b border-border/50 pb-1">
                                <span>Mon - Thu</span>
                                <span>8:00 AM - 6:00 PM</span>
                            </li>
                            <li className="flex justify-between border-b border-border/50 pb-1">
                                <span>Friday</span>
                                <span className="text-destructive font-medium">Closed</span>
                            </li>
                            <li className="flex justify-between border-b border-border/50 pb-1">
                                <span>Saturday</span>
                                <span>8:00 AM - 6:00 PM</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Sunday</span>
                                <span>8:00 AM - 6:00 PM</span>
                            </li>
                        </ul>
                    </MotionDiv>

                </MotionDiv>

                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <p className="text-xs text-muted-foreground text-center md:text-left">
                        &copy; {new Date().getFullYear()} PrimeTune Automotive. All rights reserved.
                    </p>
                    <a href="https://www.google.com/search?sca_esv=6e72ffa629272dce&sxsrf=ANbL-n4bdWUAgx6wcCtSgYrpjgxUUBOZzA:1773471244734&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOT0NyOm4owix3rVVfhudxPW4FuU7UWP0W_Bk6lVd-9LEyA0puliaeDr39pXA5xl_x2YL7X-DStZnRLWOCXWVlg6rr2t8b4YhF_nwrVC__vWgdd5ytA%3D%3D&q=PrimeTune+Automotive+Reviews&sa=X&ved=2ahUKEwjukr6c556TAxXoXWwGHWmfGBIQ0bkNegQIOhAF" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                        <Star className="w-4 h-4 text-[#FABB05] fill-[#FABB05] group-hover:scale-110 transition-transform" />
                        <span>5.0 Rating — See all Google Reviews</span>
                    </a>
                </MotionDiv>
            </div>
        </footer>
    );
}
