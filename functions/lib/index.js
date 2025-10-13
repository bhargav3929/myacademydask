"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnerPassword = exports.createCoachUser = exports.syncUserRole = exports.createStadiumAndCoach = exports.grantOwnerRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({ region: "us-central1" });
// Allows a Super Admin to grant Owner role to a target user
exports.grantOwnerRole = (0, https_1.onCall)(async (request) => {
    // Check for auth context
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callerRole = request.auth.token.role;
    if (callerRole !== "super-admin") {
        throw new https_1.HttpsError("permission-denied", "Only super-admins can grant owner roles.");
    }
    const { targetUid, organizationId } = request.data;
    if (!targetUid || !organizationId) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields: targetUid and organizationId.");
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
    }
    catch (err) {
        console.error("Error in grantOwnerRole:", err);
        const message = err.message || "An internal error occurred while setting claims.";
        throw new https_1.HttpsError("internal", message);
    }
});
exports.createStadiumAndCoach = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const ownerUid = request.auth.uid;
    let ownerRole = request.auth.token.role;
    let organizationId = request.auth.token.organizationId;
    // Claims fallback: if role/org missing or stale on the token, hydrate from Firestore
    if (ownerRole !== "owner" || !organizationId) {
        const ownerDoc = await admin.firestore().collection("users").doc(ownerUid).get();
        if (!ownerDoc.exists) {
            throw new https_1.HttpsError("permission-denied", "Only authenticated owners can perform this action.");
        }
        const data = ownerDoc.data();
        if ((data === null || data === void 0 ? void 0 : data.role) === "owner" && (data === null || data === void 0 ? void 0 : data.organizationId)) {
            ownerRole = "owner";
            organizationId = data.organizationId;
            // Best-effort: refresh claims to keep client/server in sync
            await admin.auth().setCustomUserClaims(ownerUid, Object.assign(Object.assign({}, (request.auth.token || {})), { role: "owner", organizationId: data.organizationId }));
        }
        else {
            throw new https_1.HttpsError("permission-denied", "Only authenticated owners can perform this action.");
        }
    }
    const { stadiumName, location, coachFullName, coachEmail, coachPhone, coachUsername, coachPassword, } = request.data;
    if (!stadiumName || !location || !coachFullName || !coachEmail ||
        !coachPhone || !coachUsername || !coachPassword) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields.");
    }
    const db = admin.firestore();
    const auth = admin.auth();
    try {
        // --- Validation Checks ---
        const stadiumQuery = db.collection("stadiums")
            .where("name", "==", stadiumName)
            .where("organizationId", "==", organizationId);
        if (!(await stadiumQuery.get()).empty) {
            throw new https_1.HttpsError("already-exists", "A stadium with this name already exists.");
        }
        const emailQuery = db.collection("users").where("email", "==", coachEmail);
        if (!(await emailQuery.get()).empty) {
            throw new https_1.HttpsError("already-exists", "This email address is already in use.");
        }
        const usernameQuery = db.collection("users").where("username", "==", coachUsername);
        if (!(await usernameQuery.get()).empty) {
            throw new https_1.HttpsError("already-exists", "This username is already taken.");
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
    }
    catch (err) {
        console.error("Error in createStadiumAndCoach:", err);
        if (err instanceof https_1.HttpsError) {
            throw err;
        }
        const message = err.message || "An internal error occurred.";
        throw new https_1.HttpsError("internal", message);
    }
});
exports.syncUserRole = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d, _e, _f;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required.");
    }
    try {
        console.log(`syncUserRole: Starting for user ${uid}`);
        console.log("syncUserRole: Auth context:", {
            uid: (_b = request.auth) === null || _b === void 0 ? void 0 : _b.uid,
            email: (_d = (_c = request.auth) === null || _c === void 0 ? void 0 : _c.token) === null || _d === void 0 ? void 0 : _d.email,
            role: (_f = (_e = request.auth) === null || _e === void 0 ? void 0 : _e.token) === null || _f === void 0 ? void 0 : _f.role,
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
            return { success: true, role: null, message: "User document not found - may be during account creation." };
        }
        const userData = userDoc.data();
        console.log(`syncUserRole: User document data for ${uid}:`, userData);
        const newClaims = {};
        if (userData.role)
            newClaims.role = userData.role;
        if (userData.organizationId)
            newClaims.organizationId = userData.organizationId;
        if (userData.ownerId)
            newClaims.ownerId = userData.ownerId;
        if (userData.isSuperAdmin === true)
            newClaims.isSuperAdmin = true;
        console.log(`syncUserRole: New claims to set for ${uid}:`, newClaims);
        const currentUser = await admin.auth().getUser(uid);
        const currentClaims = currentUser.customClaims || {};
        console.log(`syncUserRole: Current claims for ${uid}:`, currentClaims);
        const sortAndStringify = (obj) => {
            if (!obj)
                return "{}";
            return JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
                acc[key] = obj[key];
                return acc;
            }, {}));
        };
        const claimsChanged = sortAndStringify(newClaims) !== sortAndStringify(currentClaims);
        console.log(`syncUserRole: Claims changed for ${uid}:`, claimsChanged);
        if (claimsChanged) {
            console.log(`syncUserRole: Updating claims for ${uid} from`, currentClaims, "to", newClaims);
            await admin.auth().setCustomUserClaims(uid, newClaims);
            console.log(`syncUserRole: Claims successfully updated for user ${uid}:`, newClaims);
            return { success: true, role: newClaims.role || null, message: "User claims were successfully updated." };
        }
        else {
            console.log(`syncUserRole: Claims for user ${uid} are already up-to-date.`);
            return { success: true, role: currentClaims.role || null, message: "User claims are already in sync." };
        }
    }
    catch (error) {
        console.error("Error in syncUserRole:", error);
        const message = error.message || "An internal error occurred.";
        throw new https_1.HttpsError("internal", message);
    }
});
exports.createCoachUser = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const role = request.auth.token.role;
    if (role !== "owner") {
        throw new https_1.HttpsError("permission-denied", "Only owners can create coach users.");
    }
    const organizationId = request.auth.token.organizationId;
    if (!organizationId) {
        throw new https_1.HttpsError("failed-precondition", "The owner is not associated with an organization.");
    }
    const { email, password, displayName } = request.data || {};
    if (!email || !password || !displayName) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields.");
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
        return { success: true, uid: userRecord.uid };
    }
    catch (err) {
        console.error("createCoachUser error:", err);
        if (err.code && err.code.startsWith("auth/")) {
            throw new https_1.HttpsError("already-exists", err.message);
        }
        throw new https_1.HttpsError("internal", err.message || "Internal error");
    }
});
exports.updateOwnerPassword = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callerRole = request.auth.token.role;
    if (callerRole !== "super-admin") {
        throw new https_1.HttpsError("permission-denied", "Only super-admins can update owner passwords.");
    }
    const { targetUid, newPassword } = request.data;
    if (!targetUid || !newPassword) {
        throw new https_1.HttpsError("invalid-argument", "Missing required fields: targetUid and newPassword");
    }
    try {
        await admin.auth().updateUser(targetUid, {
            password: newPassword,
        });
        return {
            success: true,
            message: `Password for user ${targetUid} updated successfully.`,
        };
    }
    catch (err) {
        console.error("Error in updateOwnerPassword:", err);
        const message = err.message ||
            "An internal error occurred while updating the password.";
        throw new https_1.HttpsError("internal", message);
    }
});
//# sourceMappingURL=index.js.map