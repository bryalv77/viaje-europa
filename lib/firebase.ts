import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };