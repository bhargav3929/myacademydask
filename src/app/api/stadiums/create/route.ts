import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Ensure Node.js runtime (Edge runtime cannot use firebase-admin)
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

    const ownerUid = decoded.uid;

    let payload: any;
    try {
      payload = await request.json();
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    const {
      stadiumName,
      location,
      coachFullName,
      coachEmail,
      coachPhone,
      coachUsername,
      coachPassword,
    } = payload || {};

    if (!stadiumName || !location || !coachFullName || !coachEmail || !coachPhone || !coachUsername || !coachPassword) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    // Verify owner from Firestore document (source of truth)
    const ownerDoc = await adminDb.collection('users').doc(ownerUid).get();
    if (!ownerDoc.exists) {
      return NextResponse.json({ success: false, message: 'User profile not found.' }, { status: 403 });
    }

    const ownerData = ownerDoc.data() as { role?: string; organizationId?: string };
    if (ownerData?.role !== 'owner' || !ownerData?.organizationId) {
      return NextResponse.json({ success: false, message: 'Only authenticated owners can perform this action.' }, { status: 403 });
    }

    const organizationId = ownerData.organizationId;

    // Validation checks
    const stadiumDupSnap = await adminDb
      .collection('stadiums')
      .where('name', '==', stadiumName)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    if (!stadiumDupSnap.empty) {
      return NextResponse.json(
        { success: false, field: 'stadiumName', message: 'A stadium with this name already exists.' },
        { status: 409 },
      );
    }

    const emailDupSnap = await adminDb.collection('users').where('email', '==', coachEmail).limit(1).get();
    if (!emailDupSnap.empty) {
      return NextResponse.json(
        { success: false, field: 'coachEmail', message: 'This email address is already in use.' },
        { status: 409 },
      );
    }

    const usernameDupSnap = await adminDb.collection('users').where('username', '==', coachUsername).limit(1).get();
    if (!usernameDupSnap.empty) {
      return NextResponse.json(
        { success: false, field: 'coachUsername', message: 'This username is already taken.' },
        { status: 409 },
      );
    }

    // Create coach user
    const coachRecord = await adminAuth.createUser({
      email: coachEmail,
      password: coachPassword,
      displayName: coachFullName,
      emailVerified: true,
    });

    const coachUid = coachRecord.uid;

    // Set coach claims
    await adminAuth.setCustomUserClaims(coachUid, {
      role: 'coach',
      organizationId,
      ownerId: ownerUid,
    });

    // Create stadium + coach user docs in a batch
    const batch = adminDb.batch();
    const stadiumRef = adminDb.collection('stadiums').doc();
    const coachUserRef = adminDb.collection('users').doc(coachUid);
    const timestamp = FieldValue.serverTimestamp();

    batch.set(stadiumRef, {
      name: stadiumName,
      location,
      organizationId,
      assignedCoachId: coachUid,
      coachDetails: {
        name: coachFullName,
        email: coachEmail,
        username: coachUsername,
        phone: coachPhone,
      },
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    batch.set(coachUserRef, {
      uid: coachUid,
      email: coachEmail,
      username: coachUsername,
      fullName: coachFullName,
      role: 'coach',
      ownerId: ownerUid,
      organizationId,
      assignedStadiums: [stadiumRef.id],
      createdAt: timestamp,
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: `Stadium '${stadiumName}' and Coach '${coachFullName}' created.` }, { status: 200 });
  } catch (error: any) {
    console.error('API create stadium error:', error);
    const message = error?.message || 'An internal error occurred.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


