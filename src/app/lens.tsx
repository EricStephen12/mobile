import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
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

const LeafLogoX = ({ size = 28, color = '#bdf522' }: { size?: number; color?: string }) => {
  const leafPath = 'M 0,0 C -5,-7 -9,-12 -9,-17 C -9,-22 -5,-25 0,-28 C 5,-25 9,-22 9,-17 C 9,-12 5,-7 0,0';
  return (
    <Svg width={size} height={size} viewBox="-30 -30 60 60">
      <G transform="rotate(-45) translate(0, -3)"><Path d={leafPath} fill={color} /></G>
      <G transform="rotate(45) translate(0, -3)"><Path d={leafPath} fill={color} /></G>
      <G transform="rotate(135) translate(0, -3)"><Path d={leafPath} fill={color} /></G>
      <G transform="rotate(-135) translate(0, -3)"><Path d={leafPath} fill={color} /></G>
    </Svg>
  );
};

// Flower icon for the cards
const LensFlower = ({ color = '#ffffff' }: { color?: string }) => {
  return (
    <Svg width={48} height={48} viewBox="-30 -30 60 60">
      <G>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <G key={i} transform={`rotate(${angle})`}>
            <Path
              d="M 0,0 C -5,-10 -6,-20 0,-22 C 6,-20 5,-10 0,0"
              fill={color}
              opacity={i % 2 === 0 ? 1 : 0.8}
            />
          </G>
        ))}
      </G>
    </Svg>
  );
};

export default function LensScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [selectedLens, setSelectedLens] = useState<'ad' | 'content'>('ad');

  const handleContinue = () => {
    // Navigate to home dashboard after choosing lens
    router.replace({ pathname: '/home', params: { lens: selectedLens } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={[styles.logoTextLeft, { color: colors.text }]}>EI</Text>
          <LeafLogoX size={24} color={BRAND_GREEN} />
          <Text style={[styles.logoTextRight, { color: colors.text }]}>ORA</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* ── TITLE ── */}
        <Text style={[styles.title, { color: colors.text }]}>CHOOSE{'\n'}YOUR LENS</Text>

        {/* ── CARDS ── */}
        <View style={styles.cardsRow}>
          {/* Ad Intelligence Card */}
          <TouchableOpacity
            style={[
              styles.card, 
              { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
              selectedLens === 'ad' && [styles.cardSelected, { backgroundColor: colors.badgeBg }]
            ]}
            onPress={() => setSelectedLens('ad')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <LensFlower color={selectedLens === 'ad' ? BRAND_GREEN : colors.text} />
            </View>
            <View style={styles.cardMid}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>AD{'\n'}INTELLIGENCE</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSubtle }]}>Dropshippers and{'\n'}media buyers.</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={[styles.radioOuter, selectedLens === 'ad' && styles.radioOuterSelected]}>
                {selectedLens === 'ad' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Content Intelligence Card */}
          <TouchableOpacity
            style={[
              styles.card, 
              { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
              selectedLens === 'content' && [styles.cardSelected, { backgroundColor: colors.badgeBg }]
            ]}
            onPress={() => setSelectedLens('content')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <LensFlower color={selectedLens === 'content' ? BRAND_GREEN : colors.text} />
            </View>
            <View style={styles.cardMid}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>CONTENT{'\n'}INTELLIGENCE</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSubtle }]}>Creators and{'\n'}marketers.</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={[styles.radioOuter, selectedLens === 'content' && styles.radioOuterSelected]}>
                {selectedLens === 'content' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CONTINUE BUTTON ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  logoTextLeft: {
    fontSize: 20,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#bdf522', // Gold/Green tint in the screenshot
    letterSpacing: 1.5,
  },
  logoTextRight: {
    fontSize: 20,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#bdf522',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 44,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.5,
    marginBottom: 40,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 280,
  },
  cardSelected: {
    borderColor: BRAND_GREEN,
    backgroundColor: '#0a0d02', // Very faint green tint
  },
  cardTop: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardMid: {
    flex: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: serifFont,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardBottom: {
    height: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: BRAND_GREEN,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_GREEN,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 12 : 32,
  },
  continueButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
  },
});
