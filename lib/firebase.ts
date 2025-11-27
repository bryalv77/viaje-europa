import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const storage = getStorage(app);

export { app, db, storage };