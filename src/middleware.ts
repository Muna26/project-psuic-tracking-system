import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Protect IT Routes
    // Allow ADMIN to access IT routes if needed, or strictly IT_STAFF
    if (pathname.startsWith('/it')) {
        if (role !== 'IT_STAFF' && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Protect General Dashboard Routes (User)
    // Assuming /dashboard is for logged-in users generally
    // Note: /dashboard is likely the student/user view. IT and Admin might have their own.
    if (pathname.startsWith('/dashboard')) {
        if (!role) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/it/:path*', '/dashboard/:path*'],
};
