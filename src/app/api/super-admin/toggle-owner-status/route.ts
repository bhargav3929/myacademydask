import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
        { success: false, message: 'Only super-admins can manage owner account status.' },
        { status: 403 }
      );
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    const { targetUid, ownerDocId, status } = payload || {};

    if (!targetUid || !ownerDocId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: targetUid, ownerDocId, and status.' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status must be one of: active, inactive, suspended.' },
        { status: 400 }
      );
    }

    // Verify owner doc exists
    const ownerDocRef = adminDb.collection('stadium_owners').doc(ownerDocId);
    const ownerDoc = await ownerDocRef.get();
    if (!ownerDoc.exists) {
      return NextResponse.json(
        { success: false, message: `Stadium owner document ${ownerDocId} could not be found.` },
        { status: 404 }
      );
    }

    const ownerData = ownerDoc.data() as { authUid?: string };
    if (ownerData?.authUid !== targetUid) {
      return NextResponse.json(
        { success: false, message: 'Owner document does not belong to the provided user.' },
        { status: 400 }
      );
    }

    // Update owner status
    await ownerDocRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // If deactivating, revoke refresh tokens
    if (status === 'inactive' || status === 'suspended') {
      await adminAuth.revokeRefreshTokens(targetUid);

      // Also revoke tokens for all coaches under this owner
      const coachesSnapshot = await adminDb.collection('users').where('ownerId', '==', targetUid).get();

      const revokePromises = coachesSnapshot.docs.map((doc) => adminAuth.revokeRefreshTokens(doc.id));
      await Promise.all(revokePromises);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Owner account status updated to ${status}.`,
        status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API toggle owner status error:', error);
    const message = error?.message || 'An internal error occurred.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

