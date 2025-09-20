
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// Allows a Super Admin to grant Owner role to a target user
export const grantOwnerRole = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
    }

    const callerRole = request.auth.token.role;
    if (callerRole !== "super-admin") {
      throw new HttpsError("permission-denied", "Only super-admins can grant owner roles.");
    }

    const { targetUid, organizationId } = request.data;
    if (!targetUid || !organizationId) {
      throw new HttpsError("invalid-argument", "Missing required fields: targetUid and organizationId.");
    }

    try {
      await admin.auth().setCustomUserClaims(targetUid, {
        role: "owner",
        organizationId: organizationId,
      });

      return { success: true, message: `Owner role granted to user ${targetUid}.` };
    } catch (err: any) {
      console.error("Error in grantOwnerRole:", err);
      throw new HttpsError("internal", err.message || "An internal error occurred.");
    }
  }
);

// Callable function to sync a user's role from Firestore to their Auth token claims
export const syncUserRole = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
    }
    const uid = request.auth.uid;

    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            throw new HttpsError("not-found", "User document not found.");
        }

        const { role, organizationId } = userDoc.data()!;
        const validRoles = ["owner", "super-admin"];

        if (validRoles.includes(role)) {
            let claims: {[key: string]: any} = { role };
            if (role === "owner" && organizationId) {
                claims.organizationId = organizationId;
            }

            await admin.auth().setCustomUserClaims(uid, claims);
            console.log(`Claims successfully set for user ${uid}:`, claims);
            return { success: true, message: `Role '${role}' synced to custom claims.` };
        } else {
            console.log(`User ${uid} role ('${role}') requires no special claims.`);
            return { success: true, message: "No claims to set." };
        }
    } catch (error: any) {
        console.error("Error in syncUserRole:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", error.message || "An internal error occurred.");
    }
  }
);


export const createCoachUser = onCall(
  { region: "us-central1" },
  async (request) => {
    // 1. Authentication and Authorization Check
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to call this function.");
    }
    const decodedToken = request.auth.token;
    const role = (decodedToken.role) || null;
    if (role !== "owner") {
        throw new HttpsError("permission-denied", "Only owners can create coach users.");
    }

    // 2. Input validation
    const { email, password, displayName, coachUsername } = request.data;
    if (!email || !password || !displayName) {
        throw new HttpsError("invalid-argument", "Missing required fields: email, password, displayName.");
    }

    // 3. Logic
    try {
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName,
          emailVerified: true,
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: "coach",
          ownerId: decodedToken.uid,
        });

        await admin.firestore().collection("users").doc(userRecord.uid).set({
          uid: userRecord.uid,
          email,
          username: coachUsername || null,
          fullName: displayName,
          role: "coach",
          ownerId: decodedToken.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("createCoachUser success uid:", userRecord.uid);
        return { success: true, uid: userRecord.uid };
    } catch (err: any) {
        console.error("createCoachUser error:", err);
        if (err.code && err.code.startsWith("auth/")) {
            throw new HttpsError("already-exists", err.message, err.code);
        } else {
            throw new HttpsError("internal", err.message || "Internal error");
        }
    }
  }
);
