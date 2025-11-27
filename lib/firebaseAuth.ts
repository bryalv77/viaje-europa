import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  Auth,
} from 'firebase/auth';
import { app } from './firebase';
import Storage from './storage';
import { isWeb, isNative } from '@/utils/Platform';

let auth: Auth | null = null;

const initializeFirebaseAuth = async () => {
  try {
    if (isWeb) {
      // 🖥️ Web
      auth = getAuth(app);
      await auth.setPersistence(browserLocalPersistence);
    } else if (isNative) {
      // 📱 React Native
      const { getReactNativePersistence } = await import("firebase/auth");
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(Storage),
      });
    } else {
      auth = getAuth(app);
    }

    return auth;
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    return getAuth(app);
  }
};

let authInitialization: Promise<Auth | null> | null = null;

const getFirebaseAuth = () => {
  if (!authInitialization) {
    authInitialization = initializeFirebaseAuth();
  }
  return authInitialization;
};

export default getFirebaseAuth;
