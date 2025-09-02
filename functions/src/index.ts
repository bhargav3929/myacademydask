
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

interface CreateStadiumAndCoachData {
  organizationId: string;
  stadiumName: string;
  location: string;
  coachEmail: string;
  coachPassword: string;
  coachFullName: string;
}

export const createStadiumAndCoach = functions.https.onCall(
  async (data: CreateStadiumAndCoachData, context) => {
    
    functions.logger.info("Starting stadium and coach creation for org:", data.organizationId);

    try {
      // 1. Create a new user in Firebase Authentication for the coach
      const userRecord = await admin.auth().createUser({
        email: data.coachEmail,
        password: data.coachPassword,
        displayName: data.coachFullName,
        emailVerified: true,
        disabled: false,
      });
      functions.logger.info("Successfully created new auth user:", userRecord.uid);

      // 2. Set custom claims to assign the 'coach' role
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: "coach",
        organizationId: data.organizationId,
      });
      functions.logger.info("Set custom claims for user:", userRecord.uid);

      // Use a batch for atomic writes to Firestore
      const batch = db.batch();
      const creationTime = new Date();

      // 3. Create the stadium document in Firestore
      const stadiumRef = db.collection("stadiums").doc(); // Auto-generate ID
      batch.set(stadiumRef, {
        name: data.stadiumName,
        location: data.location,
        organizationId: data.organizationId,
        assignedCoachId: userRecord.uid,
        coachDetails: {
            name: data.coachFullName,
            email: data.coachEmail,
        },
        createdAt: creationTime,
      });
      functions.logger.info("Added stadium creation to batch:", stadiumRef.id);

      // 4. Create the coach's user profile in the 'users' collection
      const userProfileRef = db.collection("users").doc(userRecord.uid);
      batch.set(userProfileRef, {
        email: data.coachEmail,
        fullName: data.coachFullName,
        organizationId: data.organizationId,
        role: "coach",
        assignedStadiums: [stadiumRef.id], // Link coach to the new stadium
        createdAt: creationTime,
      });
      functions.logger.info("Added user profile creation to batch for user:", userRecord.uid);

      // Commit the batch
      await batch.commit();
      functions.logger.info("Batch committed successfully.");

      return { success: true, stadiumId: stadiumRef.id, coachId: userRecord.uid };

    } catch (error: any) {
      functions.logger.error("Error creating stadium and coach:", error);
      // Throw a structured error for the client to handle
      throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred while creating the stadium and coach.",
        error
      );
    }
  }
);
