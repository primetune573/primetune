"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cache } from "react";

export async function adminLogin(formData: FormData) {
    const email = formData.get("username") as string;
    const pass = formData.get("password") as string;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });

    if (authError) {
        return { success: false, error: authError.message };
    }

    // Use admin client to verify role (bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        return { success: false, error: "Profile not found" };
    }

    if (profile?.role !== 'admin') {
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


/** Check if the current user is an authenticated admin - Cached per request */
export const isAdmin = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
});
