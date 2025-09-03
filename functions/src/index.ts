
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Creates a new coach user account and sets custom claims.
 * This function must be called by an authenticated user (an owner).
 */
export const createCoachUser = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // 2. Role Check (Ensure caller is an owner)
  const callerUid = context.auth.uid;
  const callerUserRecord = await admin.auth().getUser(callerUid);
  if (callerUserRecord.customClaims?.role !== 'owner') {
       throw new functions.https.HttpsError(
      "permission-denied",
      "Only users with the 'owner' role can create new coaches."
    );
  }

  // 3. Input Validation
  const { email, password, displayName, organizationId } = data;
  if (!email || !password || !displayName || !organizationId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with email, password, displayName, and organizationId."
    );
  }

  try {
    // 4. Create User in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true, // Coaches are created by owners, so we can assume verification
    });

    // 5. Set Custom Claims for the new user
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
        role: "coach",
        organizationId: organizationId 
    });

    return { uid: userRecord.uid };

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        "already-exists",
        "The email address is already in use by another account."
      );
    }
    // For other errors, throw a generic error
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while creating the user."
    );
  }
});
