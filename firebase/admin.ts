import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    // Debug logs to verify env vars are loaded (avoid printing private key)
    console.log("[firebase/admin] Initialized Firebase Admin for project:", process.env.FIREBASE_PROJECT_ID);
    console.log("[firebase/admin] FIREBASE_CLIENT_EMAIL set:", !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log("[firebase/admin] FIREBASE_PRIVATE_KEY set:", !!process.env.FIREBASE_PRIVATE_KEY);
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
