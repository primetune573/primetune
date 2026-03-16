"use server";

import { createClient } from "@/utils/supabase/server";

export async function adminLogin(formData: FormData) {
    const email = formData.get("username") as string; // The login form uses 'username' but we'll use it as email for Supabase Auth
    const pass = formData.get("password") as string;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    // Verify role in profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

    if (profileError || profile?.role !== 'admin') {
        // If not admin, sign them back out
        await supabase.auth.signOut();
        return { success: false, error: "Unauthorized access" };
    }

    return { success: true };
}

export async function adminLogout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
}

/** Check if the current user is an authenticated admin */
export async function isAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}
