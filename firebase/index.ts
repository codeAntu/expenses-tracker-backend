// filepath: /c:/programing/git/expenses-tracker-backend/lib/firebaseAdmin.ts
// filepath: /c:/programing/git/expenses-tracker-backend/firebase/index.ts
import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
export const auth = admin.auth();
