"use server";

import { cookies } from "next/headers";

export async function adminLogin(formData: FormData) {
    const user = formData.get("username");
    const pass = formData.get("password");

    // In real Supabase architecture:
    // await supabase.auth.signInWithPassword({ email, password })
    // Check role = admin in RLS or JWT

    // Demo requirement: admin / admin
    if (user === "admin" && pass === "admin") {
        const cookieStore = await cookies();
        cookieStore.set("admin_token", "authenticated_admin_demo", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    return { success: true };
}
