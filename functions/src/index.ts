
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({region: "us-central1"});

// Allows a Super Admin to grant Owner role to a target user
export const grantOwnerRole = onCall(async (request) => {
  // Check for auth context
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const callerRole = request.auth.token.role;

  if (callerRole !== "super-admin") {
    throw new HttpsError("permission-denied", "Only super-admins can grant owner roles.");
  }

  const {targetUid, organizationId} = request.data;
  if (!targetUid || !organizationId) {
    throw new HttpsError("invalid-argument", "Missing required fields: targetUid and organizationId.");
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
    throw new HttpsError("internal", message);
  }
});

export const createStadiumAndCoach = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const ownerUid = request.auth.uid;
  let ownerRole = request.auth.token.role as string | undefined;
  let organizationId = request.auth.token.organizationId as string | undefined;

  // Claims fallback: if role/org missing or stale on the token, hydrate from Firestore
  if (ownerRole !== "owner" || !organizationId) {
    const ownerDoc = await admin.firestore().collection("users").doc(ownerUid).get();
    if (!ownerDoc.exists) {
      throw new HttpsError("permission-denied", "Only authenticated owners can perform this action.");
    }
    const data = ownerDoc.data() as { role?: string; organizationId?: string };
    if (data?.role === "owner" && data?.organizationId) {
      ownerRole = "owner";
      organizationId = data.organizationId;
      // Best-effort: refresh claims to keep client/server in sync
      await admin.auth().setCustomUserClaims(ownerUid, {
        ...(request.auth.token || {}),
        role: "owner",
        organizationId: data.organizationId,
      });
    } else {
      throw new HttpsError("permission-denied", "Only authenticated owners can perform this action.");
    }
  }

  const {
    stadiumName, location,
    coachFullName, coachEmail, coachPhone,
    coachUsername, coachPassword,
  } = request.data;

  if (
    !stadiumName || !location || !coachFullName || !coachEmail ||
    !coachPhone || !coachUsername || !coachPassword
  ) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = admin.firestore();
  const auth = admin.auth();

  try {
  // --- Validation Checks ---
    const stadiumQuery = db.collection("stadiums")
        .where("name", "==", stadiumName)
        .where("organizationId", "==", organizationId);
    if (!(await stadiumQuery.get()).empty) {
      throw new HttpsError("already-exists", "A stadium with this name already exists.");
    }

    const emailQuery = db.collection("users").where("email", "==", coachEmail);
    if (!(await emailQuery.get()).empty) {
      throw new HttpsError("already-exists", "This email address is already in use.");
    }

    const usernameQuery = db.collection("users").where("username", "==", coachUsername);
    if (!(await usernameQuery.get()).empty) {
      throw new HttpsError("already-exists", "This username is already taken.");
    }

    // --- Creation Process ---
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
      message: `Stadium '${stadiumName}' and Coach '${coachFullName}' created.`,
    };
  } catch (err: unknown) {
    console.error("Error in createStadiumAndCoach:", err);
    if (err instanceof HttpsError) {
      throw err;
    }
    const message = (err as Error).message || "An internal error occurred.";
    throw new HttpsError("internal", message);
  }
});

export const syncUserRole = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
        "unauthenticated",
        "Authentication is required."
    );
  }

  try {
    console.log(`syncUserRole: Starting for user ${uid}`);
    console.log("syncUserRole: Auth context:", {
      uid: request.auth?.uid,
      email: request.auth?.token?.email,
      role: request.auth?.token?.role,
    });

    // Use admin SDK with explicit admin privileges
    const db = admin.firestore();
    console.log(`syncUserRole: Attempting to read user document for ${uid}`);

    const userDoc = await db.collection("users").doc(uid).get();
    console.log(`syncUserRole: Document exists: ${userDoc.exists}`);

    if (!userDoc.exists) {
      console.log(`syncUserRole: User document not found for ${uid}`);

      // Instead of clearing claims, let's check if this is during account creation
      // Don't clear claims immediately - let the creation process complete first
      console.warn(`syncUserRole: User document missing for ${uid}. This might be during account creation.`);
      return {success: true, role: null, message: "User document not found - may be during account creation."};
    }

    const userData = userDoc.data()!;
    console.log(`syncUserRole: User document data for ${uid}:`, userData);

    const newClaims: { [key: string]: any } = {};
    if (userData.role) newClaims.role = userData.role;
    if (userData.organizationId) newClaims.organizationId = userData.organizationId;
    if (userData.ownerId) newClaims.ownerId = userData.ownerId;
    if (userData.isSuperAdmin === true) newClaims.isSuperAdmin = true;

    console.log(`syncUserRole: New claims to set for ${uid}:`, newClaims);

    const currentUser = await admin.auth().getUser(uid);
    const currentClaims = currentUser.customClaims || {};
    console.log(`syncUserRole: Current claims for ${uid}:`, currentClaims);

    const sortAndStringify = (obj: object) => {
      if (!obj) return "{}";
      return JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
        (acc as any)[key] = (obj as any)[key]; return acc;
      }, {} as {[key:string]: any}));
    };

    const claimsChanged = sortAndStringify(newClaims) !== sortAndStringify(currentClaims);
    console.log(`syncUserRole: Claims changed for ${uid}:`, claimsChanged);

    if (claimsChanged) {
      console.log(`syncUserRole: Updating claims for ${uid} from`, currentClaims, "to", newClaims);
      await admin.auth().setCustomUserClaims(uid, newClaims);
      console.log(`syncUserRole: Claims successfully updated for user ${uid}:`, newClaims);
      return {success: true, role: newClaims.role || null, message: "User claims were successfully updated."};
    } else {
      console.log(`syncUserRole: Claims for user ${uid} are already up-to-date.`);
      return {success: true, role: currentClaims.role || null, message: "User claims are already in sync."};
    }
  } catch (error: unknown) {
    console.error("Error in syncUserRole:", error);
    const message = (error as Error).message || "An internal error occurred.";
    throw new HttpsError("internal", message);
  }
});


export const createCoachUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const role = request.auth.token.role;
  if (role !== "owner") {
    throw new HttpsError("permission-denied", "Only owners can create coach users.");
  }

  const organizationId = request.auth.token.organizationId;
  if (!organizationId) {
    throw new HttpsError("failed-precondition", "The owner is not associated with an organization.");
  }

  const {email, password, displayName} = request.data || {};

  if (!email || !password || !displayName) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
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
      ownerId: request.auth.uid,
      organizationId: organizationId,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      fullName: displayName,
      role: "coach",
      ownerId: request.auth.uid,
      organizationId: organizationId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("createCoachUser success uid:", userRecord.uid);
    return {success: true, uid: userRecord.uid};
  } catch (err: any) {
    console.error("createCoachUser error:", err);
    if (err.code && err.code.startsWith("auth/")) {
      throw new HttpsError("already-exists", err.message);
    }
    throw new HttpsError("internal", err.message || "Internal error");
  }
});


export const updateOwnerPassword = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const callerRole = request.auth.token.role;

  if (callerRole !== "super-admin") {
    throw new HttpsError(
        "permission-denied",
        "Only super-admins can update owner passwords."
    );
  }

  const {targetUid, newPassword} = request.data;
  if (!targetUid || !newPassword) {
    throw new HttpsError(
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
      message: `Password for user ${targetUid} updated successfully.`,
    };
  } catch (err: unknown) {
    console.error("Error in updateOwnerPassword:", err);
    const message =
    (err as Error).message ||
    "An internal error occurred while updating the password.";
    throw new HttpsError("internal", message);
  }
});

export const updateOwnerCredentials = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const callerRole = request.auth.token.role;
  if (callerRole !== "super-admin") {
    throw new HttpsError(
        "permission-denied",
        "Only super-admins can update owner credentials."
    );
  }

  const {
    targetUid,
    ownerDocId,
    newUsername,
    newPassword,
  } = request.data as {
    targetUid?: string;
    ownerDocId?: string;
    newUsername?: string;
    newPassword?: string;
  };

  if (!targetUid || !ownerDocId || !newUsername) {
    throw new HttpsError(
        "invalid-argument",
        "Missing required fields: targetUid, ownerDocId, and newUsername."
    );
  }

  const normalizedUsername = String(newUsername).trim().toLowerCase();
  if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
    throw new HttpsError(
        "invalid-argument",
        "Username can only contain lowercase letters, numbers, and underscores."
    );
  }

  const db = admin.firestore();
  const ownerDocRef = db.collection("stadium_owners").doc(ownerDocId);
  const ownerDoc = await ownerDocRef.get();
  if (!ownerDoc.exists) {
    throw new HttpsError(
        "not-found",
        `Stadium owner document ${ownerDocId} could not be found.`
    );
  }

  const ownerData = ownerDoc.data() as { authUid?: string; credentials?: { username?: string } };
  if (ownerData?.authUid !== targetUid) {
    throw new HttpsError(
        "failed-precondition",
        "Owner document does not belong to the provided user."
    );
  }

  const usersRef = db.collection("users");
  const existingUsernameSnapshot = await usersRef
      .where("username", "==", normalizedUsername)
      .get();

  if (!existingUsernameSnapshot.empty) {
    const conflict = existingUsernameSnapshot.docs.find((docSnap) => docSnap.id !== targetUid);
    if (conflict) {
      throw new HttpsError(
          "already-exists",
          "This username is already in use. Choose a different username."
      );
    }
  }

  const newEmail = `${normalizedUsername}@owner.courtcommand.com`;

  const batch = db.batch();
  batch.update(usersRef.doc(targetUid), {
    username: normalizedUsername,
    email: newEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.update(ownerDocRef, {
    credentials: {
      username: normalizedUsername,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  const updateRequest: admin.auth.UpdateRequest = {
    email: newEmail,
  };

  if (typeof newPassword === "string" && newPassword.trim().length > 0) {
    if (newPassword.trim().length < 8) {
      throw new HttpsError(
          "invalid-argument",
          "Password must be at least 8 characters long."
      );
    }
    updateRequest.password = newPassword;
  }

  await admin.auth().updateUser(targetUid, updateRequest);
  await admin.auth().revokeRefreshTokens(targetUid);

  return {
    success: true,
    message: "Owner credentials were updated successfully.",
    email: newEmail,
    username: normalizedUsername,
    passwordUpdated: Boolean(updateRequest.password),
  };
});

export const toggleOwnerAccountStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const callerRole = request.auth.token.role;
  if (callerRole !== "super-admin") {
    throw new HttpsError(
        "permission-denied",
        "Only super-admins can manage owner account status."
    );
  }

  const {
    targetUid,
    ownerDocId,
    status,
  } = request.data as {
    targetUid?: string;
    ownerDocId?: string;
    status?: string;
  };

  if (!targetUid || !ownerDocId || !status) {
    throw new HttpsError(
        "invalid-argument",
        "Missing required fields: targetUid, ownerDocId, and status."
    );
  }

  if (!["active", "inactive", "suspended"].includes(status)) {
    throw new HttpsError(
        "invalid-argument",
        "Invalid status provided. Expected 'active', 'inactive', or 'suspended'."
    );
  }

  const db = admin.firestore();
  const ownerDocRef = db.collection("stadium_owners").doc(ownerDocId);
  const ownerDoc = await ownerDocRef.get();
  if (!ownerDoc.exists) {
    throw new HttpsError("not-found", `Owner document ${ownerDocId} does not exist.`);
  }

  const ownerData = ownerDoc.data() as { authUid?: string };
  if (ownerData?.authUid !== targetUid) {
    throw new HttpsError(
        "failed-precondition",
        "Owner document does not belong to the provided user."
    );
  }

  const batch = db.batch();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  batch.update(ownerDocRef, {
    status,
    updatedAt: timestamp,
  });

  const ownerUserRef = db.collection("users").doc(targetUid);
  batch.update(ownerUserRef, {
    status,
    updatedAt: timestamp,
  });

  const coachesSnapshot = await db
      .collection("users")
      .where("organizationId", "==", ownerDocId)
      .where("role", "==", "coach")
      .get();

  const affectedCoachUids: string[] = [];
  coachesSnapshot.forEach((coachDoc) => {
    affectedCoachUids.push(coachDoc.id);
    batch.update(coachDoc.ref, {
      status,
      updatedAt: timestamp,
    });
  });

  await batch.commit();

  const disableUser = status !== "active";
  await admin.auth().updateUser(targetUid, {disabled: disableUser});
  await admin.auth().revokeRefreshTokens(targetUid);

  if (affectedCoachUids.length > 0) {
    await Promise.all(
        affectedCoachUids.map(async (coachUid) => {
          try {
            await admin.auth().updateUser(coachUid, {disabled: disableUser});
            await admin.auth().revokeRefreshTokens(coachUid);
          } catch (error) {
            console.error(`Failed to update coach ${coachUid}:`, error);
          }
        })
    );
  }

  return {
    success: true,
    status,
    coachesUpdated: affectedCoachUids.length,
  };
});
