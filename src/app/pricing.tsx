import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');
const BRAND_GREEN = '#bdf522';

const serifFont = Platform.select({
  ios: 'Singsong',
  android: 'Singsong',
  default: 'serif',
});

const sansFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

export default function PricingScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ── HEADER ── */}
        <Text style={styles.title}>UNLOCK{'\n'}EIXORA</Text>

        {/* ── PRICING CARDS ── */}
        <View style={styles.cardsContainer}>
          
          {/* Creator Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.cardPlanName, { color: colors.text }]}>CREATOR</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: colors.text }]}>$</Text>
              <Text style={[styles.price, { color: colors.text }]}>5</Text>
              <Text style={[styles.period, { color: colors.textSubtle }]}>/month</Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>20 analyses / month</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Standard insights</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Community access</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Email support</Text>
              </View>
            </View>
          </View>

          {/* Studio Card */}
          <View style={[styles.card, styles.cardPopular, { backgroundColor: colors.surface }]}>
            <Text style={styles.cardPlanNameStudio}>STUDIO</Text>
            <View style={[styles.popularPill, { backgroundColor: colors.background }]}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: colors.text }]}>$</Text>
              <Text style={[styles.price, { color: colors.text }]}>10</Text>
              <Text style={[styles.period, { color: colors.textSubtle }]}>/month</Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Unlimited analyses</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Advanced insights</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Priority support</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Export reports</Text>
              </View>
              <View style={styles.featureRow}>
                <CheckIcon color={colors.textMuted} /><Text style={[styles.featureText, { color: colors.textMuted }]}>Early access</Text>
              </View>
            </View>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.beginButton} 
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text style={styles.beginText}>BEGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel anytime.</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#e4d084', // Goldish color from screenshot
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  cardPopular: {
    borderColor: BRAND_GREEN,
    borderWidth: 1.5,
  },
  cardPlanName: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 16,
  },
  cardPlanNameStudio: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#e4d084',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  popularPill: {
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#33411a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  popularText: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#e4d084',
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  currency: {
    fontSize: 24,
    fontFamily: serifFont,
    color: '#ffffff',
    marginRight: 2,
  },
  price: {
    fontSize: 48,
    fontFamily: serifFont,
    color: '#ffffff',
  },
  period: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#94a3b8',
    marginLeft: 2,
  },
  featuresList: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#e2e8f0',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  beginButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  beginText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: sansFont,
    color: '#64748b',
  },
});
