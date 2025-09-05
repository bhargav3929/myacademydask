
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";

// The /app directory in Next.js can be server or client, so we can't rely on server-only packages like 'dotenv'.
// Next.js automatically makes NEXT_PUBLIC_ variables available in the browser.
// This log is safe to run in the browser and helps diagnose configuration issues.
// console.log("--- Firebase Initialization ---");
// console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING");
// console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING");
// console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "MISSING");
// console.log("-----------------------------");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;

// This check prevents re-initializing the app on every hot-reload
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);
functions = getFunctions(app);

export { app, auth, firestore, functions };
