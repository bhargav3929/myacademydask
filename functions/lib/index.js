"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOwnerClaim = exports.createCoachUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.createCoachUser = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    var _a;
    console.log('createCoachUser called, data:', data, 'context.auth?.uid:', (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid);
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }
    // Check role from token (context.auth.token)
    const role = (context.auth.token && context.auth.token.role) || null;
    console.log('Caller custom claims token.role =', role);
    if (role !== 'owner') {
        throw new functions.https.HttpsError('permission-denied', 'Only owners can create coach users.');
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
            ownerId: context.auth.uid // optional, tie coach to creator
        });
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            username: coachUsername || null,
            fullName: displayName,
            role: 'coach',
            ownerId: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('createCoachUser success uid:', userRecord.uid);
        return { success: true, uid: userRecord.uid };
    }
    catch (err) {
        console.error('createCoachUser error:', err);
        // map auth errors nicely
        if (err.code && err.code.startsWith('auth/')) {
            throw new functions.https.HttpsError('already-exists', err.message);
        }
        throw new functions.https.HttpsError('internal', err.message || 'Internal error');
    }
});
exports.setOwnerClaim = functions
    .region("us-central1")
    .https.onCall(async (_, context) => {
    var _a;
    console.log("setOwnerClaim called for user:", (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid);
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
        const userRole = userData === null || userData === void 0 ? void 0 : userData.role;
        console.log("User role in Firestore:", userRole);
        // Only set owner claims if the user's Firestore role is "owner"
        if (userRole === "owner") {
            await admin.auth().setCustomUserClaims(context.auth.uid, { role: "owner" });
            console.log("Owner claim set successfully for:", context.auth.uid);
            return { success: true, message: "Owner claim set successfully" };
        }
        else {
            console.log("User is not an owner, skipping claim setting");
            return { success: true, message: "User is not an owner, no claims set" };
        }
    }
    catch (error) {
        console.error("Error in setOwnerClaim:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=index.js.map