import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
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

  const hasCreator = customerInfo?.entitlements.active['creator'] !== undefined;
  const hasStudio = customerInfo?.entitlements.active['studio'] !== undefined;

  let tier: 'free' | 'creator' | 'studio' = 'free';
  if (hasStudio) tier = 'studio';
  else if (hasCreator) tier = 'creator';

  const isPro = tier !== 'free';

  return (
    <RevenueCatContext.Provider value={{ customerInfo, isPro, tier, loading }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
