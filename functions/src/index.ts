
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Creates a new coach user account, sets custom claims, and creates a user profile in Firestore.
 * This is a Callable Function and must be called by an authenticated user (an owner).
 */
export const createCoachUser = functions
  .region('us-central1') // It's good practice to specify the region
  .https.onCall(async (data, context) => {
    // 1. Authentication and Authorization Check
    // Ensure the user is authenticated.
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    // Check if the caller is an owner by verifying custom claims.
    const callerUserRecord = await admin.auth().getUser(context.auth.uid);
    if (callerUserRecord.customClaims?.role !== 'owner') {
         throw new functions.https.HttpsError('permission-denied', 'Only owners can create coach users.');
    }
    const organizationId = callerUserRecord.customClaims?.organizationId;
     if (!organizationId) {
        throw new functions.https.HttpsError('failed-precondition', 'The owner is not associated with an organization.');
    }


    // 2. Input Validation
    const { email, password, displayName, coachUsername } = data || {};
    if (!email || !password || !displayName || !organizationId || !coachUsername) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with email, password, displayName, coachUsername and a valid owner token.');
    }

    try {
      // 3. Create User in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true, // Coaches are created by owners, so we can assume verification
      });

      // 4. Set Custom Claims for the new user
      await admin.auth().setCustomUserClaims(userRecord.uid, { 
          role: "coach",
          organizationId: organizationId 
      });

      // 5. The logic to create the user and stadium documents now resides in the frontend
      //    This function's responsibility is now solely to create the auth user and set claims.
      //    The frontend will use the returned UID to create the necessary Firestore documents.

      return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        console.error('Error creating coach user:', error);
        // Map common auth errors to user-friendly callable errors
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account.');
        }
        if (error.code === 'auth/invalid-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password must be a string with at least 6 characters.');
        }
        // For other errors, throw a generic internal error
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while creating the user.');
    }
  });
