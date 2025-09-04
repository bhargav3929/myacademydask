"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoachUser = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
admin.initializeApp();
const corsHandler = cors({ origin: true });
exports.createCoachUser = functions.region('us-central1').https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        var _a, _b, _c;
        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Origin', '*');
            res.status(204).send('');
            return;
        }
        // 1. Authentication and Authorization Check
        const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
        if (!idToken) {
            res.status(401).send({ error: 'Unauthorized', message: 'The function must be called while authenticated.' });
            return;
        }
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const callerUid = decodedToken.uid;
            const callerUserRecord = await admin.auth().getUser(callerUid);
            if (((_b = callerUserRecord.customClaims) === null || _b === void 0 ? void 0 : _b.role) !== 'owner') {
                res.status(403).send({ error: 'permission-denied', message: 'Only owners can create coach users.' });
                return;
            }
            const organizationId = (_c = callerUserRecord.customClaims) === null || _c === void 0 ? void 0 : _c.organizationId;
            if (!organizationId) {
                res.status(400).send({ error: 'failed-precondition', message: 'The owner is not associated with an organization.' });
                return;
            }
            // 2. Input Validation
            const { email, password, displayName, coachUsername } = req.body.data || {};
            if (!email || !password || !displayName || !coachUsername) {
                res.status(400).send({ error: 'invalid-argument', message: 'The function must be called with email, password, displayName, and coachUsername.' });
                return;
            }
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
            res.status(200).send({ data: { success: true, uid: userRecord.uid } });
        }
        catch (error) {
            console.error('Error creating coach user:', error);
            // Map common auth errors to user-friendly callable errors
            if (error.code === 'auth/email-already-exists') {
                res.status(409).send({ error: 'already-exists', message: 'The email address is already in use by another account.' });
                return;
            }
            if (error.code === 'auth/invalid-password') {
                res.status(400).send({ error: 'invalid-argument', message: 'The password must be a string with at least 6 characters.' });
                return;
            }
            // For other errors, throw a generic internal error
            res.status(500).send({ error: 'internal', message: 'An unexpected error occurred while creating the user.' });
        }
    });
});
//# sourceMappingURL=index.js.map