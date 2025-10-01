import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Check if all required environment variables are present.
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing required Firebase Admin SDK environment variables for middleware.');
}

// Initialize Firebase Admin SDK if not already initialized.
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Pass the private key directly, relying on correct .env formatting.
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Allow requests to static assets, API routes, and public pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') || // Files like favicon.ico
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/pricing'
    ) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('__session')?.value;
    let decodedToken = null;

    if (sessionCookie) {
        try {
            decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
        } catch (error) {
            console.log('Error verifying session cookie:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('__session');
            return response;
        }
    }

    if (!decodedToken) {
        if (pathname.startsWith('/super-admin') && pathname !== '/super-admin/login') {
             return NextResponse.redirect(new URL('/super-admin/login', request.url));
        }
        if (pathname === '/dashboard' || pathname.startsWith('/coach') || pathname.startsWith('/stadiums') || pathname.startsWith('/students') || pathname.startsWith('/reports') || pathname.startsWith('/settings')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    const userRole = decodedToken.role;
    const isSuperAdminPath = pathname.startsWith('/super-admin');
    const isCoachPath = pathname.startsWith('/coach');
    const isOwnerPath = !isSuperAdminPath && !isCoachPath && (pathname.startsWith('/dashboard') || pathname.startsWith('/stadiums') || pathname.startsWith('/students') || pathname.startsWith('/reports') || pathname.startsWith('/settings'));

    // Enforce role-based access
    if (userRole === 'super-admin') {
        if (!isSuperAdminPath) {
            return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
        }
        if (pathname === '/super-admin/login') {
            return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
        }
    } else if (userRole === 'owner') {
        if (!isOwnerPath) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname === '/super-admin/login' || isCoachPath) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else if (userRole === 'coach') {
        if (!isCoachPath) {
            return NextResponse.redirect(new URL('/coach/dashboard', request.url));
        }
        if (pathname === '/super-admin/login' || isOwnerPath) {
            return NextResponse.redirect(new URL('/coach/dashboard', request.url));
        }
    } else {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
