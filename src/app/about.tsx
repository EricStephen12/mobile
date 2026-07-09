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
  Linking,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
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

const BackArrow = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const LeafLogoX = ({ size = 60, color = BRAND_GREEN }: { size?: number; color?: string }) => {
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

export default function AboutScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrow color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Eixora</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.logoSection}>
          <LeafLogoX />
          <Text style={[styles.appName, { color: colors.text }]}>EIXORA</Text>
          <Text style={[styles.appVersion, { color: colors.textSubtle }]}>Version 1.0.0</Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Eixora is the ultimate video intelligence platform designed for modern creators, dropshippers, and media buyers.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            By utilizing advanced AI, Eixora breaks down your content and competitor ads frame-by-frame to deliver actionable insights on engagement, pacing, and visual effectiveness.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Whether you're looking for the edge in your next ad campaign, or trying to maximize organic reach on TikTok and Reels, Eixora brings the data to your creative process.
          </Text>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://eixora.store/terms')}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://eixora.store/privacy')}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('mailto:hello@eixora.store')}>
            <Text style={styles.linkText}>Contact Support</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: serifFont,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginTop: 16,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#64748b',
    marginTop: 4,
  },
  contentSection: {
    gap: 20,
    marginBottom: 48,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: sansFont,
    color: '#e2e8f0',
    lineHeight: 22,
    textAlign: 'center',
  },
  linksSection: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  linkItem: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 13,
    fontFamily: sansFont,
    color: BRAND_GREEN,
    fontWeight: '600',
  },
});
