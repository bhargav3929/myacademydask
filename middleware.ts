import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

const adminDb = getFirestore();

type VerifySessionCookie = ReturnType<typeof getAuth>['verifySessionCookie'];
type DecodedToken = Awaited<ReturnType<VerifySessionCookie>>;

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Allow requests to static assets, API routes, and public pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') || // Files like favicon.ico
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/pricing'
    ) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('__session')?.value;
    let decodedToken: DecodedToken | null = null;
    let userRole: 'super-admin' | 'owner' | 'coach' | null = null;

    if (sessionCookie) {
        try {
            decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
            const tokenRole = decodedToken.role as string | undefined;
            if (tokenRole === 'super-admin' || tokenRole === 'owner' || tokenRole === 'coach') {
                userRole = tokenRole;
            } else {
                try {
                    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
                    if (userDoc.exists) {
                        const firestoreRole = userDoc.get('role');
                        if (firestoreRole === 'super-admin' || firestoreRole === 'owner' || firestoreRole === 'coach') {
                            userRole = firestoreRole;
                        }
                    }
                } catch (firestoreError) {
                    console.error('Failed to fetch user role from Firestore in middleware:', firestoreError);
                }
            }
        } catch (error) {
            console.log('Error verifying session cookie:', error);
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('__session');
            return response;
        }
    }

    if (decodedToken && pathname === '/' && userRole) {
        const redirectPath =
            userRole === 'super-admin'
                ? '/super-admin/dashboard'
                : userRole === 'owner'
                    ? '/dashboard'
                    : '/coach/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
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

    if (!userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

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
