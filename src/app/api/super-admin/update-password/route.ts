import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// Ensure Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid session.' }, { status: 401 });
    }

    // Verify super-admin role from token claims
    let userRole = decoded.role;

    // Fallback: if role missing in claims, check Firestore
    if (!userRole) {
      try {
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userRole = userData?.role;
        }
      } catch (err) {
        console.error('Error fetching user role from Firestore:', err);
      }
    }

    if (userRole !== 'super-admin') {
      return NextResponse.json(
        { success: false, message: 'Only super-admins can update passwords.' },
        { status: 403 }
      );
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    const { targetUid, newPassword } = payload || {};

    if (!targetUid || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: targetUid and newPassword' },
        { status: 400 }
      );
    }

    await adminAuth.updateUser(targetUid, {
      password: newPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Password for user ${targetUid} updated successfully.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API update password error:', error);
    const message = error?.message || 'An internal error occurred.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

