// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCjTT5sSmMBQc7WFz3v9ifsbWqCbTTI5Q",
  authDomain: "bishi-883da.firebaseapp.com",
  projectId: "bishi-883da",
  storageBucket: "bishi-883da.firebasestorage.app",
  messagingSenderId: "55544164961",
  appId: "1:55544164961:web:c56f4ca4626db781ff7020",
  measurementId: "G-SRPRDWP4C3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export const isFirebaseConfigured = true;
export { app, analytics, db, auth, storage, firebaseConfig };
export default app;
