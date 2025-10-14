import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Use the same env variable names as middleware.ts
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('❌ Missing Firebase Admin env vars:', { PROJECT_ID: !!PROJECT_ID, CLIENT_EMAIL: !!CLIENT_EMAIL, PRIVATE_KEY: !!PRIVATE_KEY });
  throw new Error('Missing required Firebase Admin SDK environment variables.');
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
