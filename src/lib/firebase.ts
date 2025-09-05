
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;
let appCheck: AppCheck | undefined = undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

if (typeof window !== 'undefined') {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    // Check if the site key is present and not the placeholder value
    if (siteKey && siteKey !== 'YOUR_RECAPTCHA_SITE_KEY') {
        console.log("Valid reCAPTCHA site key found. Initializing Firebase App Check.");
        try {
            appCheck = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(siteKey),
                isTokenAutoRefreshEnabled: true
            });
            console.log("Firebase App Check initialized successfully.");
        } catch (error) {
            console.error("Firebase App Check initialization failed:", error);
        }
    } else {
        console.warn(`
********************************************************************************
*                                                                              *
* Firebase App Check is NOT INITIALIZED.                                       *
* Your backend is currently unprotected.                                       *
*                                                                              *
* To enable security, set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env.local file. *
* Make sure to also enforce App Check on your Firebase Cloud Functions.        *
*                                                                              *
********************************************************************************
        `);
    }
}

auth = getAuth(app);
firestore = getFirestore(app);
functions = getFunctions(app);

export { app, auth, firestore, functions, appCheck };
