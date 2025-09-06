
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const createCoachUser = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    console.log('createCoachUser called, data:', data, 'context.auth?.uid:', context.auth?.uid);

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    // Check role from token (context.auth.token)
    const role = (context.auth.token && context.auth.token.role) || null;
    console.log('Caller custom claims token.role =', role);
    if (role !== 'owner') {
      throw new functions.https.HttpsError('permission-denied', 'Only owners can create coach users.');
    }
    
    const organizationId = context.auth.token.organizationId;
     if (!organizationId) {
        throw new functions.https.HttpsError('failed-precondition', 'The owner is not associated with an organization.');
    }

    const { email, password, displayName, coachUsername } = data || {};

    if (!email || !password || !displayName) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: "coach",
        ownerId: context.auth.uid, // optional, tie coach to creator
        organizationId: organizationId
      });

      // No need to create a user doc here, stadium form dialog does that.

      console.log('createCoachUser success uid:', userRecord.uid);
      return { success: true, uid: userRecord.uid };

    } catch (err: any) {
      console.error('createCoachUser error:', err);
      // map auth errors nicely
      if (err.code && err.code.startsWith('auth/')) {
        throw new functions.https.HttpsError('already-exists', err.message);
      }
      throw new functions.https.HttpsError('internal', err.message || 'Internal error');
    }
  });


export const setOwnerClaim = functions
  .region("us-central1")
  .https.onCall(async (_, context) => {
    console.log("setOwnerClaim called for user:", context.auth?.uid);

    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    }

    try {
      // Fetch user document from Firestore
      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
      
      if (!userDoc.exists) {
        console.log("User document not found, skipping claim setting");
        return { success: true, message: "User document not found, no claims set" };
      }

      const userData = userDoc.data();
      const userRole = userData?.role;
      const organizationId = userData?.organizationId;

      console.log("User role in Firestore:", userRole);

      // Only set owner claims if the user's Firestore role is "owner"
      if (userRole === "owner") {
        await admin.auth().setCustomUserClaims(context.auth.uid, { role: "owner", organizationId });
        console.log("Owner claim set successfully for:", context.auth.uid);
        return { success: true, message: "Owner claim set successfully" };
      } else {
        console.log("User is not an owner, skipping claim setting");
        return { success: true, message: "User is not an owner, no claims set" };
      }

    } catch (error: any) {
      console.error("Error in setOwnerClaim:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
