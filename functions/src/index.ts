
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Allows a Super Admin to grant Owner role to a target user
export const grantOwnerRole = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
      // Check for auth context
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
      }
      const callerRole = context.auth.token.role;

      if (callerRole !== "super-admin") {
        throw new functions.https.HttpsError('permission-denied', 'Only super-admins can grant owner roles.');
      }

      const {targetUid, organizationId} = data;
      if (!targetUid || !organizationId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: targetUid and organizationId.');
      }

      try {
        await admin.auth().setCustomUserClaims(targetUid, {
          role: "owner",
          organizationId: organizationId,
        });

        // Also update the role in Firestore
        await admin.firestore().collection("users").doc(targetUid).update({
          role: "owner",
          organizationId: organizationId,
        });


        return {
          success: true,
          message: `Owner role granted to user ${targetUid}.`,
        };
      } catch (err: unknown) {
        console.error("Error in grantOwnerRole:", err);
        const message = (err as Error).message || "An internal error occurred while setting claims.";
        throw new functions.https.HttpsError("internal", message);
      }
    }
);

export const createStadiumAndCoach = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
      }

      const ownerUid = context.auth.uid;
      const ownerRole = context.auth.token.role;
      const organizationId = context.auth.token.organizationId;

      if (ownerRole !== "owner" || !organizationId) {
        throw new functions.https.HttpsError('permission-denied', 'Only authenticated owners can perform this action.');
      }

      const {
        stadiumName, location,
        coachFullName, coachEmail, coachPhone,
        coachUsername, coachPassword,
      } = data;

      if (
        !stadiumName || !location || !coachFullName || !coachEmail ||
        !coachPhone || !coachUsername || !coachPassword
      ) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
      }

      const db = admin.firestore();
      const auth = admin.auth();

      try {
      // --- Validation Checks ---\
        const stadiumQuery = db.collection("stadiums")
            .where("name", "==", stadiumName)
            .where("organizationId", "==", organizationId);
        if (!(await stadiumQuery.get()).empty) {
          throw new functions.https.HttpsError('already-exists', 'A stadium with this name already exists.');
        }

        const emailQuery = db.collection("users").where("email", "==", coachEmail);
        if (!(await emailQuery.get()).empty) {
          throw new functions.https.HttpsError('already-exists', 'This email address is already in use.');
        }

        const usernameQuery = db.collection("users").where("username", "==", coachUsername);
        if (!(await usernameQuery.get()).empty) {
          throw new functions.https.HttpsError('already-exists', 'This username is already taken.');
        }

        // --- Creation Process ---\
        const coachUserRecord = await auth.createUser({
          email: coachEmail,
          password: coachPassword,
          displayName: coachFullName,
          emailVerified: true,
        });

        const coachUid = coachUserRecord.uid;

        await auth.setCustomUserClaims(coachUid, {
          role: "coach",
          organizationId: organizationId,
          ownerId: ownerUid,
        });

        const stadiumDocRef = db.collection("stadiums").doc();

        const batch = db.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        batch.set(stadiumDocRef, {
          name: stadiumName,
          location: location,
          organizationId: organizationId,
          assignedCoachId: coachUid,
          coachDetails: {
            name: coachFullName,
            email: coachEmail,
            username: coachUsername,
            phone: coachPhone,
          },
          status: "active",
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        const coachUserDocRef = db.collection("users").doc(coachUid);
        batch.set(coachUserDocRef, {
          uid: coachUid,
          email: coachEmail,
          username: coachUsername,
          fullName: coachFullName,
          role: "coach",
          ownerId: ownerUid,
          organizationId: organizationId,
          assignedStadiums: [stadiumDocRef.id],
          createdAt: timestamp,
        });

        await batch.commit();

        return {
          success: true,
          message: `Stadium \'${stadiumName}\' and Coach \'${coachFullName}\' created.`,
        };
      } catch (err: unknown) {
        console.error("Error in createStadiumAndCoach:", err);
         if (err instanceof functions.https.HttpsError) {
          throw err;
        }
        const message = (err as Error).message || "An internal error occurred.";
        throw new functions.https.HttpsError("internal", message);
      }
    }
);

export const syncUserRole = functions
    .region("us-central1")
    .https.onCall(async (data, context) => {
      const uid = context.auth?.uid;
      if (!uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Authentication is required."
        );
      }

      try {
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        if (!userDoc.exists) {
          await admin.auth().setCustomUserClaims(uid, null);
          console.log(`Cleared claims for user ${uid} because Firestore doc is missing.`);
          return { success: true, role: null, message: "User document not found, claims cleared." };
        }

        const userData = userDoc.data()!;
        
        const newClaims: { [key: string]: any } = {};
        if (userData.role) newClaims.role = userData.role;
        if (userData.organizationId) newClaims.organizationId = userData.organizationId;
        if (userData.ownerId) newClaims.ownerId = userData.ownerId;
        if (userData.isSuperAdmin === true) newClaims.isSuperAdmin = true;

        const currentUser = await admin.auth().getUser(uid);
        const currentClaims = currentUser.customClaims || {};

        const sortAndStringify = (obj: object) => {
            if(!obj) return "{}";
            return JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => { acc[key] = obj[key]; return acc; }, {} as {[key:string]: any}))
        };
        
        const claimsChanged = sortAndStringify(newClaims) !== sortAndStringify(currentClaims);

        if (claimsChanged) {
          await admin.auth().setCustomUserClaims(uid, newClaims);
          console.log(`Claims updated for user ${uid}:`, newClaims);
           return { success: true, role: newClaims.role || null, message: "User claims were successfully updated."};
        } else {
          console.log(`Claims for user ${uid} are already up-to-date.`);
           return { success: true, role: currentClaims.role || null, message: "User claims are already in sync." };
        }
      } catch (error: unknown) {
        console.error("Error in syncUserRole:", error);
        const message = (error as Error).message || "An internal error occurred.";
        throw new functions.https.HttpsError("internal", message);
      }
    });


export const createCoachUser = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const role = context.auth.token.role;
    if (role !== 'owner') {
      throw new functions.https.HttpsError('permission-denied', 'Only owners can create coach users.');
    }
    
    const organizationId = context.auth.token.organizationId;
     if (!organizationId) {
        throw new functions.https.HttpsError('failed-precondition', 'The owner is not associated with an organization.');
    }

    const { email, password, displayName } = data || {};

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
        ownerId: context.auth.uid, 
        organizationId: organizationId
      });

      console.log('createCoachUser success uid:', userRecord.uid);
      return { success: true, uid: userRecord.uid };

    } catch (err: any) {
      console.error('createCoachUser error:', err);
      if (err.code && err.code.startsWith('auth/')) {
        throw new functions.https.HttpsError('already-exists', err.message);
      }
      throw new functions.https.HttpsError('internal', err.message || 'Internal error');
    }
  }
);


export const updateOwnerPassword = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const callerRole = context.auth.token.role;

    if (callerRole !== "super-admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only super-admins can update owner passwords."
      );
    }

    const { targetUid, newPassword } = data;
    if (!targetUid || !newPassword) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: targetUid and newPassword"
      );
    }

    try {
      await admin.auth().updateUser(targetUid, {
        password: newPassword,
      });

      return {
        success: true,
        message: `Password for user ${targetUid} updated successfully.`
      };
    } catch (err: unknown) {
      console.error("Error in updateOwnerPassword:", err);
      const message =
        (err as Error).message ||
        "An internal error occurred while updating the password.";
      throw new functions.https.HttpsError("internal", message);
    }
  }
);
