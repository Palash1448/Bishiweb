import type { FirebaseApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';

export declare const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export declare const isFirebaseConfigured: boolean;
export declare const app: FirebaseApp;
export declare const analytics: Analytics | null;
export declare const db: Firestore;
export declare const auth: Auth;
export declare const storage: FirebaseStorage;

export default app;
