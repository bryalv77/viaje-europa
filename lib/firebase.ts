import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDekpEFG2v886hNRn0yE0zlaDqbtban53k",
  authDomain: "vacacioneseuropa.firebaseapp.com",
  databaseURL: "https://vacacioneseuropa-default-rtdb.firebaseio.com",
  projectId: "vacacioneseuropa",
  storageBucket: "vacacioneseuropa.firebasestorage.app",
  messagingSenderId: "17419236448",
  appId: "1:17419236448:web:769231fcb6d2bb35463f05",
  measurementId: "G-GNVKGMXLQR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };