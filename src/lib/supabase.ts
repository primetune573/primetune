import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for general use (browser/server with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role client for bypass RLS and admin-only operations (Migration, Server Actions)
 * Use with Caution - Never expose to frontend!
 */
export const getServiceSupabase = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || serviceRoleKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local');
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
