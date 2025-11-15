"server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import {
  getFirestore,
  FieldValue,
  type Firestore,
} from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App;
if (!getApps().length) {
  const firebase_private_key_bas64 = process.env.FIREBASE_PRIVATE_KEY_BASE64!;
  if (!firebase_private_key_bas64) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. " +
        "Add it to your .env.local file."
    );
  }
  const firebase_private_key = Buffer.from(
    firebase_private_key_bas64,
    "base64"
  ).toString("utf8");
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: firebase_private_key.replace(/\\n/g, "\n")!,
    }),
  });
} else {
  adminApp = getApps()[0]!;
}

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export const AdminFieldValue = FieldValue;
