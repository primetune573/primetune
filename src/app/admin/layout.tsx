"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wrench, CalendarCheck, LogOut, CalendarClock } from "lucide-react";
import { adminLogout } from "@/app/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // If we are exactly on the login page (should be rendered directly without this wrapper ideally if Next.js layout matches differently, but we can return just children here)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await adminLogout();
        router.push("/admin/login");
    };

    const navItems = [
        { label: "Overview", icon: LayoutDashboard, href: "/admin" },
        { label: "Bookings", icon: CalendarCheck, href: "/admin/bookings" },
        { label: "Schedule Control", icon: CalendarClock, href: "/admin/availability" },
        { label: "Services Catalog", icon: Wrench, href: "/admin/services" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="bg-primary text-white p-2 rounded-lg">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-foreground">Admin Panel</span>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col h-screen overflow-y-auto bg-background">
                <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
