"use client";

import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse" />
                <Loader2 className="w-12 h-12 text-primary animate-spin absolute top-0 left-0" />
            </div>
            <p className="mt-4 text-muted-foreground font-medium animate-pulse">
                Fetching latest data...
            </p>
        </div>
    );
}
