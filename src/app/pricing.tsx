import React from 'react';
import { SafeAreaView, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

const BackArrow = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

export default function PricingScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Custom Back Button overlaid if Paywall doesn't provide one natively */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrow color={colors.text} />
        </TouchableOpacity>
      </View>

      <RevenueCatUI.Paywall 
        style={styles.paywall}
        onDismiss={() => router.back()}
        onPurchaseCompleted={(customerInfo) => {
          console.log("Purchase completed:", customerInfo);
          router.back();
        }}
        onRestoreCompleted={(customerInfo) => {
          console.log("Restore completed:", customerInfo);
          alert("Purchases restored!");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  paywall: {
    flex: 1,
  }
});
