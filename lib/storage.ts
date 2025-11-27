// storage.ts
import { Platform } from "react-native";

export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const isLocalStorageAvailable = () => {
  try {
    if (Platform.OS === "web") {
      const test = "test";
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

class StorageUtility implements IStorage {
  private storagePromise: Promise<IStorage>;

  constructor() {
    this.storagePromise = this.initializeStorage();
  }

  private async initializeStorage(): Promise<IStorage> {
    if (isLocalStorageAvailable()) {
      return {
        getItem: async (key: string) => window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
        removeItem: async (key: string) => window.localStorage.removeItem(key),
      };
    }

    if (Platform.OS !== "web") {
      try {
        const AsyncStorageModule = await import("@react-native-async-storage/async-storage");
        return AsyncStorageModule.default;
      } catch (error) {
        console.error("Error loading AsyncStorage:", error);
      }
    }

    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }

  async getItem(key: string): Promise<string | null> {
    const storage = await this.storagePromise;
    const value = await storage.getItem(key);
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    const storage = await this.storagePromise;
    await storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const storage = await this.storagePromise;
    await storage.removeItem(key);
  }

  async getStorageType(): Promise<string> {
    if (isLocalStorageAvailable()) {
      return "localStorage";
    } else if (Platform.OS !== "web") {
      return "AsyncStorage";
    }
    return "fallback";
  }
}

// Singleton instance
export const storage = new StorageUtility();
export default storage;
