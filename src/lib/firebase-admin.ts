
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized using environment variables.");
    } catch (error) {
      console.error("CRITICAL ERROR: Failed to initialize Firebase Admin SDK from environment variables.", error);
    }
  } else {
    console.warn("Firebase Admin environment variables are not fully set. Admin SDK not initialized.");
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
