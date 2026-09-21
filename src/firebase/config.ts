import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyBCjTT5sSmMBQc7WFz3v9ifsbWqCbTTI5Q",
  authDomain: "bishi-883da.firebaseapp.com",
  projectId: "bishi-883da",
  storageBucket: "bishi-883da.firebasestorage.app",
  messagingSenderId: "55544164961",
  appId: "1:55544164961:web:c56f4ca4626db781ff7020",
  measurementId: "G-SRPRDWP4C3"
};

export const isFirebaseConfigured = true;

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const analytics: Analytics | null = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
  analytics,
};

export type {
  FirebaseApp,
  Auth,
  Firestore,
  FirebaseStorage,
  Analytics,
};

export default app;
