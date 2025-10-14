import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Ensure Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] update-owner-credentials: Request received');
    
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      console.log('[API] No session cookie found');
      return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      console.log('[API] Session verified for user:', decoded.uid);
    } catch (err) {
      console.error('[API] Session verification failed:', err);
      return NextResponse.json({ success: false, message: 'Invalid session.' }, { status: 401 });
    }

    // Verify super-admin role from token claims
    let userRole = decoded.role;
    console.log('[API] User role from token:', userRole);

    // Fallback: if role missing in claims, check Firestore
    if (!userRole) {
      console.log('[API] Role missing in claims, checking Firestore...');
      try {
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userRole = userData?.role;
          console.log('[API] Role from Firestore:', userRole);
        } else {
          console.log('[API] User document not found in Firestore');
        }
      } catch (err) {
        console.error('[API] Error fetching user role from Firestore:', err);
      }
    }

    if (userRole !== 'super-admin') {
      console.log('[API] Access denied - user role:', userRole);
      return NextResponse.json(
        { success: false, message: 'Only super-admins can update owner credentials.' },
        { status: 403 }
      );
    }
    
    console.log('[API] Super-admin verified, proceeding...');

    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    const { targetUid, ownerDocId, newUsername, newPassword } = payload || {};

    if (!targetUid || !ownerDocId || !newUsername) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: targetUid, ownerDocId, and newUsername.' },
        { status: 400 }
      );
    }

    const normalizedUsername = String(newUsername).trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return NextResponse.json(
        { success: false, message: 'Username can only contain lowercase letters, numbers, and underscores.' },
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

    const ownerData = ownerDoc.data() as { authUid?: string; credentials?: { username?: string } };
    if (ownerData?.authUid !== targetUid) {
      return NextResponse.json(
        { success: false, message: 'Owner document does not belong to the provided user.' },
        { status: 400 }
      );
    }

    // Check username uniqueness
    const usersRef = adminDb.collection('users');
    const existingUsernameSnapshot = await usersRef.where('username', '==', normalizedUsername).get();

    if (!existingUsernameSnapshot.empty) {
      const conflict = existingUsernameSnapshot.docs.find((docSnap) => docSnap.id !== targetUid);
      if (conflict) {
        return NextResponse.json(
          { success: false, message: 'This username is already in use. Choose a different username.' },
          { status: 409 }
        );
      }
    }

    const newEmail = `${normalizedUsername}@owner.courtcommand.com`;

    // Update Firestore
    const batch = adminDb.batch();
    batch.update(usersRef.doc(targetUid), {
      username: normalizedUsername,
      email: newEmail,
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.update(ownerDocRef, {
      credentials: {
        username: normalizedUsername,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Update Firebase Auth
    const updateRequest: any = {
      email: newEmail,
    };

    if (typeof newPassword === 'string' && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 8) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters long.' },
          { status: 400 }
        );
      }
      updateRequest.password = newPassword;
    }

    await adminAuth.updateUser(targetUid, updateRequest);
    await adminAuth.revokeRefreshTokens(targetUid);

    return NextResponse.json(
      {
        success: true,
        message: 'Owner credentials were updated successfully.',
        email: newEmail,
        username: normalizedUsername,
        passwordUpdated: Boolean(updateRequest.password),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] CRITICAL ERROR in update-owner-credentials:', error);
    console.error('[API] Error stack:', error?.stack);
    const message = error?.message || 'An internal error occurred.';
    return NextResponse.json({ success: false, message, error: String(error) }, { status: 500 });
  }
}

