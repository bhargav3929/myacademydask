
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOwnerClaim = exports.createCoachUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.createCoachUser = functions.https.onCall(async (data, context) => {
    // 1. Authentication and Authorization Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const callerIsOwner = context.auth.token.role === 'owner';
    if (!callerIsOwner) {
        throw new functions.https.HttpsError('permission-denied', 'Only owners can create coach users.');
    }
    const organizationId = context.auth.token.organizationId;
    if (!organizationId) {
        throw new functions.https.HttpsError('failed-precondition', 'The owner is not associated with an organization.');
    }
    // 2. Input Validation
    const { email, password, displayName, coachUsername } = data;
    if (!email || !password || !displayName || !coachUsername) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with email, password, displayName, and coachUsername.');
    }
    try {
        // 3. Create User in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName,
            emailVerified: true,
        });
        // 4. Set Custom Claims for the new user
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role: "coach",
            organizationId: organizationId
        });
        // 5. Respond with success
        return { success: true, uid: userRecord.uid };
    }
    catch (error) {
        console.error('Error creating coach user:', error);
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account.');
        }
        if (error.code === 'auth/invalid-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password must be a string with at least 6 characters.');
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while creating the user.');
    }
});
exports.setOwnerClaim = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const user = await admin.auth().getUser(uid);
    // This check is a failsafe. The owner should be the only one with this email.
    if (user.email !== 'director@courtcommand.com') {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }
    try {
        // Set custom claims
        await admin.auth().setCustomUserClaims(uid, { role: 'owner', organizationId: 'mock-org-id-for-testing' });
        return { success: true, message: 'Owner claim set successfully.' };
    }
    catch (error) {
        console.error('Error setting owner claim:', error);
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred.');
    }
});
//# sourceMappingURL=index.js.map
