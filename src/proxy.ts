import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect all /admin routes except /admin/login
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const adminAuth = request.cookies.get('admin_token')?.value;

        // Very basic token check. In production, verify JWT via Supabase.
        if (!adminAuth || adminAuth !== 'authenticated_admin_demo') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Redirect authenticated users away from login page
    if (path.startsWith('/admin/login')) {
        const adminAuth = request.cookies.get('admin_token')?.value;
        if (adminAuth === 'authenticated_admin_demo') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
}
