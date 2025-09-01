
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import { HttpsError, onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

admin.initializeApp();

// Define a type for the data expected by the function
interface CreateStadiumAndCoachData {
    organizationId: string;
    stadiumName: string;
    location: string;
    coachEmail: string;
    coachPassword: string;
    coachFullName: string;
}

export const createStadiumAndCoach = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const data: CreateStadiumAndCoachData = request.body;

    logger.info("Starting stadium and coach creation for org:", data.organizationId);

    try {
      // 1. Create a new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: data.coachEmail,
        password: data.coachPassword,
        displayName: data.coachFullName,
        emailVerified: true,
        disabled: false,
      });
      logger.info("Successfully created new user:", userRecord.uid);

      // 2. Set custom claims for the new user (e.g., role: 'coach')
      await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: "coach",
          organizationId: data.organizationId,
      });
      logger.info("Set custom claims for user:", userRecord.uid);


      // Use a batch to ensure atomic operations
      const db = admin.firestore();
      const batch = db.batch();

      // 3. Create the stadium document in Firestore
      const stadiumRef = db.collection("stadiums").doc(); // Auto-generate ID
      batch.set(stadiumRef, {
          name: data.stadiumName,
          location: data.location,
          organizationId: data.organizationId,
          assignedCoachId: userRecord.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info("Added stadium creation to batch:", stadiumRef.id);

      // 4. Create the coach's user profile in Firestore
      const userProfileRef = db.collection("users").doc(userRecord.uid);
      batch.set(userProfileRef, {
          uid: userRecord.uid,
          email: data.coachEmail,
          fullName: data.coachFullName,
          organizationId: data.organizationId,
          role: "coach",
          assignedStadiums: [stadiumRef.id], // Link coach to the new stadium
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info("Added user profile creation to batch for user:", userRecord.uid);

      // Commit the batch
      await batch.commit();
      logger.info("Batch committed successfully.");

      response.status(200).send({ success: true, stadiumId: stadiumRef.id, coachId: userRecord.uid });

    } catch (error) {
      logger.error("Error creating stadium and coach:", error);
      // Re-throw as an HttpsError to send a structured error to the client
      if (error instanceof Error) {
        response.status(500).send({ success: false, error: error.message });
      } else {
        response.status(500).send({ success: false, error: "An unknown error occurred." });
      }
    }
  });
});
