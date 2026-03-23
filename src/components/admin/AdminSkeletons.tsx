import { Loader2 } from "lucide-react";

export function TableSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted/60 rounded-xl w-full mb-6" />
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-border/50 rounded-xl bg-card/50">
                    <div className="h-4 bg-muted/60 rounded w-24" />
                    <div className="h-4 bg-muted/60 rounded flex-grow" />
                    <div className="h-4 bg-muted/60 rounded w-16" />
                </div>
            ))}
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-sm h-32">
                    <div className="h-2 bg-muted/40 rounded w-12 mb-3" />
                    <div className="h-10 bg-muted/60 rounded w-20" />
                </div>
            ))}
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm h-[400px] animate-pulse">
            <div className="h-14 border-b border-border bg-muted/10" />
            <div className="p-4 grid grid-cols-7 gap-1">
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted/20 rounded-lg" />
                ))}
            </div>
        </div>
    );
}
