
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true, allowedHeaders: ["Content-Type", "Authorization"] });

/**
 * Creates a new coach user account and sets custom claims.
 * This function must be called by an authenticated user (an owner).
 */
export const createCoachUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // 0. Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // 1. Authentication Check
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
      res.status(403).send('Unauthorized');
      return;
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      const callerUid = decodedIdToken.uid;
      const callerUserRecord = await admin.auth().getUser(callerUid);

      // 2. Role Check (Ensure caller is an owner)
      if (callerUserRecord.customClaims?.role !== 'owner') {
        console.error('Caller is not an owner.', { uid: callerUid });
        res.status(403).send('Permission denied: Only owners can create coaches.');
        return;
      }

      // 3. Input Validation from request body
      const { email, password, displayName, organizationId } = req.body;
      if (!email || !password || !displayName || !organizationId) {
        console.error('Missing fields in request body', { body: req.body });
        res.status(400).send('Bad Request: The function must be called with email, password, displayName, and organizationId.');
        return;
      }
      
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

      res.status(200).send({ uid: userRecord.uid });

    } catch (error: any) {
        console.error('Error creating coach user:', error);
        if (error.code === 'auth/email-already-exists') {
            res.status(409).send('The email address is already in use by another account.');
        } else if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            res.status(403).send('Unauthorized');
        } else {
            res.status(500).send('An unexpected error occurred while creating the user.');
        }
    }
  });
});
