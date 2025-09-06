
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true });

export const createCoachUser = functions.region('us-central1').https.onRequest((req, res) => {
    corsHandler(req, res, async () => {

        // Handle preflight OPTIONS request for CORS
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        try {
            // 1. Authentication and Authorization Check
            const idToken = req.headers.authorization?.split('Bearer ')[1];
            if (!idToken) {
                res.status(401).send({ error: { message: 'Authentication token is missing.' } });
                return;
            }
            
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            if (decodedToken.role !== 'owner') {
                res.status(403).send({ error: { message: 'Only owners can create coach users.' } });
                return;
            }
            
            const organizationId = decodedToken.organizationId;
            if (!organizationId) {
                res.status(400).send({ error: { message: 'The owner is not associated with an organization.' } });
                return;
            }

            // 2. Input Validation
            const { email, password, displayName, coachUsername } = req.body.data || {};
            if (!email || !password || !displayName || !coachUsername) {
                res.status(400).send({ error: { message: 'The request body is missing required fields: email, password, displayName, coachUsername.' } });
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

        } catch (error: any) {
            console.error('Error creating coach user:', error);

            if (error.code === 'auth/id-token-expired') {
                res.status(401).send({ error: { message: 'Authentication token has expired. Please log in again.' } });
                return;
            }
             if (error.code === 'auth/email-already-exists') {
                res.status(409).send({ error: { message: 'The email address is already in use by another account.' } });
                return;
            }
            if (error.code === 'auth/invalid-password') {
                res.status(400).send({ error: { message: 'The password must be a string with at least 6 characters.' } });
                return;
            }
            
            res.status(500).send({ error: { message: 'An unexpected error occurred while creating the user.' } });
        }
    });
});


export const setOwnerClaim = functions
  .region("us-central1")
  .https.onCall(async (_, context) => {
    console.log("setOwnerClaim called for user:", context.auth?.uid);

    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    }

    try {
      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
      
      if (!userDoc.exists) {
        console.log("User document not found, skipping claim setting");
        return { success: true, message: "User document not found, no claims set" };
      }

      const userData = userDoc.data();
      const userRole = userData?.role;
      const organizationId = userData?.organizationId;

      if (userRole === "owner") {
        await admin.auth().setCustomUserClaims(context.auth.uid, { role: "owner", organizationId });
        console.log("Owner claim set successfully for:", context.auth.uid);
        return { success: true, message: "Owner claim set successfully" };
      } else {
        console.log("User is not an owner, skipping claim setting");
        return { success: true, message: "User is not an owner, no claims set" };
      }

    } catch (error: any) {
      console.error("Error in setOwnerClaim:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
