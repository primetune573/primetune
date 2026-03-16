"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Lock, Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/app/actions/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await adminLogin(formData);

        if (result.success) {
            router.push("/admin");
        } else {
            setError(result.error || "Login failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary text-white p-3 rounded-xl mb-4">
                        <Wrench className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">PrimeTune Admin</h1>
                    <p className="text-muted-foreground text-sm">Sign in to manage garage operations</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            defaultValue="admin" // Added exclusively for demo purposes based on user prompt
                            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                defaultValue="admin"
                                className="w-full bg-input border border-border rounded-lg pl-4 pr-12 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-red-700 disabled:bg-primary/50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Authenticating..." : <><Lock className="w-4 h-4" /> Sign In</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
