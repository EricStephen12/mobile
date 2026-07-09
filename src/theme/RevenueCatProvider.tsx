import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  isPro: boolean;
  tier: 'free' | 'creator' | 'studio';
  loading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType>({
  customerInfo: null,
  isPro: false,
  tier: 'free',
  loading: true,
});

export const useRevenueCat = () => useContext(RevenueCatContext);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initRevenueCat = async () => {
      if (isExpoGo) {
        console.log('Expo Go detected. Bypassing RevenueCat initialization.');
        setLoading(false);
        return;
      }
      
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        
        if (Platform.OS === 'ios') {
          Purchases.configure({ apiKey: API_KEY_IOS });
        } else if (Platform.OS === 'android') {
          Purchases.configure({ apiKey: API_KEY_ANDROID });
        }

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        Purchases.addCustomerInfoUpdateListener((info) => {
          setCustomerInfo(info);
        });
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  // Check for specific entitlements — adjust keys to match your RevenueCat dashboard
  const isStudio = customerInfo?.entitlements.active['Eixora Studio'] !== undefined 
    || customerInfo?.entitlements.active['Eixora Pro'] !== undefined;
  const isCreator = customerInfo?.entitlements.active['Eixora Creator'] !== undefined;
  const isPro = isStudio || isCreator;
  const tier: 'free' | 'creator' | 'studio' = isStudio ? 'studio' : isCreator ? 'creator' : 'free';

  return (
    <RevenueCatContext.Provider value={{ customerInfo, isPro, tier, loading }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
