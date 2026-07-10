import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const createTokenCache = () => {
  return {
    async getToken(key: string) {
      try {
        if (!isExpoGo) {
          const item = await SecureStore.getItemAsync(key);
          if (item) {
            console.log(`${key} was retrieved securely 🔐`);
            return item;
          }
        }
        // Fallback to AsyncStorage if SecureStore is null or if in Expo Go
        const fallbackItem = await AsyncStorage.getItem(key);
        if (fallbackItem) {
          console.log(`${key} was retrieved from fallback cache`);
        } else {
          console.log('No values stored under key: ' + key);
        }
        return fallbackItem;
      } catch (error) {
        console.error('SecureStore get item error, falling back: ', error);
        try {
          return await AsyncStorage.getItem(key);
        } catch (fallbackError) {
          return null;
        }
      }
    },
    async saveToken(key: string, value: string) {
      try {
        if (!isExpoGo) {
          await SecureStore.setItemAsync(key, value);
        }
        // Always save to fallback cache just in case SecureStore drops it later (common on Android Keystore resets)
        await AsyncStorage.setItem(key, value);
      } catch (err) {
        console.error('SecureStore save item error: ', err);
        try {
          await AsyncStorage.setItem(key, value);
        } catch (fallbackError) {
          // ignore
        }
      }
    },
  };
};

export const tokenCache = createTokenCache();
