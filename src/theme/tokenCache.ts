import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const createTokenCache = () => {
  if (isExpoGo) {
    console.log('Expo Go detected. Using AsyncStorage for token cache to bypass SecureStore native errors.');
    return {
      async getToken(key: string) {
        try {
          return await AsyncStorage.getItem(key);
        } catch (err) {
          return null;
        }
      },
      async saveToken(key: string, value: string) {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (err) {
          return;
        }
      }
    };
  }

  // Require SecureStore lazily to prevent crashing on import in Expo Go
  const SecureStore = require('expo-secure-store');
  
  return {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`${key} was used 🔐 \n`);
        } else {
          console.log('No values stored under key: ' + key);
        }
        return item;
      } catch (error) {
        console.error('SecureStore get item error: ', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value);
      } catch (err) {
        return;
      }
    },
  };
};

export const tokenCache = createTokenCache();
