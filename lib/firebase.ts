// Firebase app configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBk8Dzk0Vebk4Mi4clAsRgu3HToTEXgqVs",
  authDomain: "medscanai-511f2.firebaseapp.com",
  projectId: "medscanai-511f2",
  storageBucket: "medscanai-511f2.firebasestorage.app",
  messagingSenderId: "672416791415",
  appId: "1:672416791415:web:4aa95eba5bb3dcbddf7f72",
  measurementId: "G-FZ4561XHKR",
};

// Prevent re-initialisation during Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Analytics — only initialise in the browser (not during SSR)
export const analyticsPromise =
  typeof window !== 'undefined'
    ? isSupported().then((yes) => yes ? getAnalytics(app) : null)
    : Promise.resolve(null);

export default app;
