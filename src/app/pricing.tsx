import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { AmbientGlow } from '../components/AmbientGlow';

const { width } = require('react-native').Dimensions.get('window');
const BRAND_GREEN = '#bdf522';

const serifFont = Platform.select({ ios: 'Singsong', android: 'Singsong', default: 'serif' });
const sansFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' });

const BackArrow = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

export default function PricingScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<string>('studio'); // default to higher tier

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
          
          // Try to select the studio package by default if it exists
          const studio = offerings.current.availablePackages.find(p => p.identifier.toLowerCase().includes('studio'));
          if (studio) {
            setSelectedPkg(studio.identifier);
          } else {
            setSelectedPkg(offerings.current.availablePackages[0].identifier);
          }
        }
      } catch (e: any) {
        console.warn("Error fetching offerings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (typeof customerInfo.entitlements.active['Eixora Studio'] !== 'undefined' || 
          typeof customerInfo.entitlements.active['Eixora Creator'] !== 'undefined' ||
          typeof customerInfo.entitlements.active['Eixora Pro'] !== 'undefined') {
        Alert.alert("Success", "Welcome to Eixora Pro!");
        router.back();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Error", e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert("Success", "Purchases restored successfully!");
        router.back();
      } else {
        Alert.alert("Restore", "No active subscriptions found.");
      }
    } catch (e: any) {
      Alert.alert("Restore Error", e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Hardcoded UI representations for when RevenueCat isn't configured in dev
  const defaultTiers = [
    {
      id: 'creator',
      title: 'The Creator',
      price: '$5',
      period: '/mo',
      badge: 'Essential Access',
      features: ['30 Studio Scans / mo', 'Up to 5 minute videos', '30 Strategy Briefs / mo', 'Creative Lounge Access']
    },
    {
      id: 'studio',
      title: 'The Studio',
      price: '$10',
      period: '/mo',
      badge: 'Best Value',
      features: ['250 Studio Scans / mo', 'Up to 30 minute videos', '250 Strategy Briefs / mo', 'Priority AI Speed', 'Advanced PDF Exports']
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}>
          <BackArrow color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Unlock Full Intelligence</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <Text style={[styles.heroText, { color: colors.textSubtle }]}>Join 2,000+ creators and media buyers analyzing ads frame-by-frame.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={BRAND_GREEN} size="large" />
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {defaultTiers.map((tier) => {
              // Try to find the matching real package from RevenueCat
              const realPkg = packages.find(p => p.identifier.toLowerCase().includes(tier.id));
              const isSelected = selectedPkg === (realPkg?.identifier || tier.id);
              
              // If we have a real package, use its price string, otherwise use the hardcoded one
              const displayPrice = realPkg ? realPkg.product.priceString : tier.price;
              
              return (
                <TouchableOpacity 
                  key={tier.id}
                  style={[
                    styles.card, 
                    { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                    isSelected && [styles.cardSelected, { borderColor: BRAND_GREEN, backgroundColor: '#131b04' }]
                  ]}
                  activeOpacity={0.9}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPkg(realPkg?.identifier || tier.id);
                  }}
                >
                  {tier.id === 'studio' && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  
                  <Text style={[styles.cardBadge, { color: BRAND_GREEN }]}>{tier.badge}</Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{tier.title}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>{displayPrice}</Text>
                    <Text style={[styles.periodText, { color: colors.textSubtle }]}> / mo</Text>
                  </View>

                  <View style={styles.featuresList}>
                    {tier.features.map((feat, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <CheckIcon color={BRAND_GREEN} />
                        <Text style={[styles.featureText, { color: colors.text }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {isSelected && (
                    <TouchableOpacity 
                      style={[styles.subscribeButton, { backgroundColor: BRAND_GREEN }]}
                      activeOpacity={0.8}
                      onPress={() => realPkg ? handlePurchase(realPkg) : Alert.alert('Error', 'Billing not configured in dev.')}
                      disabled={isPurchasing}
                    >
                      {isPurchasing ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={styles.subscribeText}>Continue with {tier.title}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.footerText, { color: colors.textSubtle }]}>Restore Purchases</Text>
          </TouchableOpacity>
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => Linking.openURL('https://eixora.store/terms')}>
              <Text style={[styles.footerText, { color: colors.textSubtle }]}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={[styles.footerText, { color: colors.textSubtle, marginHorizontal: 8 }]}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://eixora.store/privacy')}>
              <Text style={[styles.footerText, { color: colors.textSubtle }]}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: serifFont,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroText: {
    fontSize: 15,
    fontFamily: sansFont,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: BRAND_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
  },
  popularText: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  cardBadge: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: serifFont,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceText: {
    fontSize: 42,
    fontFamily: sansFont,
    fontWeight: '700',
  },
  periodText: {
    fontSize: 16,
    fontFamily: sansFont,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontFamily: sansFont,
    opacity: 0.9,
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  subscribeText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#000',
  },
  footerLinks: {
    alignItems: 'center',
    gap: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: sansFont,
    textDecorationLine: 'underline',
  }
});
