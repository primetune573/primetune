"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Wrench } from "lucide-react";
import Image from "next/image";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeMenu = () => setIsOpen(false);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-background/95 backdrop-blur-md shadow-md py-3"
                : "bg-background/80 backdrop-blur-sm py-5"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">

                {/* LOGO area */}
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group">
                    <Image
                        src="/logo.png?v=2"
                        alt="PrimeTune Automotive Logo"
                        width={180}
                        height={60}
                        className="object-contain h-10 sm:h-12 w-auto"
                        priority
                        unoptimized
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-primary relative group ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {link.label}
                            {pathname === link.href && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute left-0 right-0 h-0.5 bg-primary bottom-[-4px]"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTAs */}
                <div className="hidden lg:flex items-center gap-4">
                    <a
                        href="tel:+94775056573"
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                        Call Now
                    </a>
                    <Link
                        href="/services"
                        className="bg-primary hover:bg-red-700 text-white px-5 py-2 rounded-md font-medium transition-colors border border-primary hover:border-red-700 shadow-sm shadow-primary/20"
                    >
                        Book Now
                    </Link>
                </div>

                {/* Mobile menu toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <Link
                        href="/services"
                        className="bg-primary text-white px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium"
                    >
                        Book
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-foreground p-1 hover:text-primary transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-background border-b border-border overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className={`text-base font-medium py-2 border-b border-border/50 ${pathname === link.href ? "text-primary" : "text-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-2">
                                <a
                                    href="tel:+94775056573"
                                    className="text-center font-medium bg-secondary text-secondary-foreground py-2 rounded-md"
                                >
                                    077 505 6573
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
