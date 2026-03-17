"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cache } from "react";

export async function adminLogin(formData: FormData) {
    const email = formData.get("username") as string;
    const pass = formData.get("password") as string;

    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });

    if (authError) {
        console.error(`[LOGIN AUTH ERROR] ${authError.message}`);
        return { success: false, error: authError.message };
    }

    console.log(`[LOGIN AUTH SUCCESS] User ID: ${authData.user.id}`);

    // Use admin client to verify role (bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error(`[LOGIN PROFILE ERROR] ${profileError.message}`);
        return { success: false, error: "Profile not found" };
    }

    if (profile?.role !== 'admin') {
        console.warn(`[LOGIN UNAUTHORIZED] Role: ${profile?.role}`);
        await supabase.auth.signOut();
        return { success: false, error: "Unauthorized access" };
    }

    console.log(`[LOGIN SUCCESS] Admin established`);
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
