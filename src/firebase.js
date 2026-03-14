import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const firebaseConfigured = requiredKeys.every(key => Boolean(firebaseConfig[key]));

let app = null;
let db = null;
let auth = null;
let firebaseInitError = null;

if (firebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    firebaseInitError = error;
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase disabled: missing VITE_FIREBASE_* environment variables.');
}

export { app, db, auth, firebaseInitError };
export const firebaseReady = Boolean(db);

// Analytics only runs in browser environments
export const analytics = app && firebaseConfig.measurementId
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null)
  : Promise.resolve(null);

export default app;
