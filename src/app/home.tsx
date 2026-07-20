import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Platform, ScrollView, KeyboardAvoidingView, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import Svg, { Path, G, Polygon } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { TabBar } from '../components/TabBar';
import { useTheme } from '../theme/ThemeContext';
import { useRevenueCat } from '../theme/RevenueCatProvider';
import { AmbientGlow } from '../components/AmbientGlow';

const { width } = Dimensions.get('window');

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

// --- SVG Icons ---
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

const BoltIcon = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill={color} stroke="none">
    <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round">
    <Path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark, colors } = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { isPro } = useRevenueCat();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';
  
  const initialMode = params.lens === 'content' ? 'content' : params.lens === 'product-intel' ? 'product-intel' : 'ad';
  const [mode, setMode] = useState<'ad' | 'content' | 'product-intel'>(initialMode as any);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const FREE_SCAN_LIMIT = 3;
  const scansRemaining = isPro ? '∞' : Math.max(0, FREE_SCAN_LIMIT - scanCount);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = await getToken();
        if (!token || !user) return;
        const res = await fetch(`${API_URL}/api/user-sessions?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecent((data || []).slice(0, 3));
          setScanCount((data || []).length);
        }
      } catch (err) {
        console.error('Fetch recent error:', err);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, [user]);

  const BRAND_GREEN = colors.primary;
  const activeColor = BRAND_GREEN;
  const placeholderText = mode === 'ad' ? "Paste ad link..." : mode === 'content' ? "Paste content link..." : "Paste product video link...";
  const modeText = mode === 'ad' ? "Ad Intelligence" : mode === 'content' ? "Content Intelligence" : "Product Intelligence";

  const handleToggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(prev => {
      if (prev === 'ad') return 'content';
      if (prev === 'content') return 'product-intel';
      return 'ad';
    });
  };

  const handleAnalyze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!link) return;
    if (!isPro && scanCount >= FREE_SCAN_LIMIT) {
      setShowLimitModal(true);
      return;
    }
    router.push({ pathname: '/analyzing', params: { url: link, mode: mode } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow />
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ───────── TOP NAV ───────── */}
        <View style={styles.topNav}>
          <View style={styles.logoRow}>
            <Text style={[styles.logoTextLeft, { color: colors.text }]}>EI</Text>
            <LeafLogoX size={22} color={activeColor} />
            <Text style={[styles.logoTextRight, { color: colors.text }]}>ORA</Text>
          </View>
          <TouchableOpacity style={[styles.avatar, { borderColor: colors.surfaceBorder, backgroundColor: colors.surface }]} activeOpacity={0.8}>
            <Text style={[styles.avatarInitial, { color: colors.text }]}>{user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'E'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          
          {/* ───────── GREETING ───────── */}
          <Text style={[styles.greeting, { color: colors.text }]}>
            Welcome back, {user?.firstName || 'Creator'}.
          </Text>

          {/* ───────── MODE PILL ───────── */}

          <View style={styles.pillRow}>
            <TouchableOpacity style={[styles.modePill, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]} activeOpacity={0.85} onPress={handleToggleMode}>
              {mode === 'ad' ? <BoltIcon color={activeColor} /> : mode === 'product-intel' ? <View style={[styles.contentDot, { backgroundColor: '#6366f1', borderRadius: 4, width: 8, height: 8 }]} /> : <View style={[styles.contentDot, { backgroundColor: activeColor }]} />}
              <Text style={[styles.pillText, { color: colors.text }]}>{modeText}</Text>
              <FilterIcon />
            </TouchableOpacity>
          </View>

          {/* ───────── INPUT CARD ───────── */}
          <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.inputLabel, { color: colors.textSubtle }]}>DROP YOUR VIDEO LINK</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.linkInput, { color: colors.text }]}
                value={link}
                onChangeText={setLink}
                placeholder={placeholderText}
                placeholderTextColor={colors.textSubtle}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.goButton, { backgroundColor: activeColor }, !link && styles.goButtonDisabled]}
                activeOpacity={0.85}
                disabled={!link}
                onPress={handleAnalyze}
              >
                <ArrowIcon />
              </TouchableOpacity>
            </View>
                        <View style={styles.scanCountRow}>
              <Text style={[styles.scanCountText, { color: colors.textSubtle }]}>
                {!isPro 
                  ? `${scansRemaining} of ${FREE_SCAN_LIMIT} free scans remaining • Max 90s video` 
                  : `Unlimited Scans • Extended video length enabled`}
              </Text>
            </View>
          </View>
          {/* ───────── RECENT ───────── */}
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>RECENT ANALYSES</Text>
            {loadingRecent ? (
              <ActivityIndicator color={BRAND_GREEN} style={{ marginTop: 20 }} />
            ) : recent.length === 0 ? (
              <Text style={{ color: colors.textSubtle, fontSize: 12, marginTop: 10 }}>No recent analyses found.</Text>
            ) : (
              <View style={styles.recentList}>
                {recent.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.recentItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]} 
                    activeOpacity={0.75}
                    onPress={() => router.push(`/chat?sessionId=${item.id}`)}
                  >
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title || 'Analysis Session'}
                      </Text>
                      <Text style={[styles.recentDate, { color: colors.textSubtle }]}>
                        {new Date(item.updatedAt || item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.recentBadge, { backgroundColor: activeColor + '20' }]}>
                      <Text style={[styles.recentBadgeText, { color: activeColor }]}>View</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ───────── LIMIT MODAL ───────── */}
      <Modal
        visible={showLimitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>SCAN LIMIT REACHED</Text>
            <Text style={[styles.modalMessage, { color: colors.textSubtle }]}>
              You've used all {FREE_SCAN_LIMIT} free scans this month. Upgrade to Eixora Creator or Studio for unlimited intelligence.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#1e293b' }]}
                onPress={() => setShowLimitModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: BRAND_GREEN }]}
                onPress={() => {
                  setShowLimitModal(false);
                  router.push('/pricing');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: '#000000' }]}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ───────── BOTTOM TAB BAR ───────── */}
      <TabBar activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoTextLeft: {
    fontSize: 22,
    fontFamily: serifFont,
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoTextRight: {
    fontSize: 22,
    fontFamily: serifFont,
    color: '#ffffff',
    letterSpacing: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  avatarInitial: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
    greeting: {
    fontSize: 28,
    fontFamily: serifFont,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  pillRow: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  pillText: {
    fontSize: 13,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  contentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkInput: {
    flex: 1,
    fontSize: 26,
    fontFamily: serifFont,
    color: '#ffffff',
    padding: 0,
  },
  goButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonDisabled: {
    opacity: 0.5,
  },
  recentSection: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2.5,
  },
  recentList: {
    gap: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
    gap: 14,
    paddingRight: 14,
  },
  recentThumb: {
    width: 72,
    height: 60,
    borderRadius: 0,
  },
  recentInfo: {
    flex: 1,
    gap: 4,
  },
  recentTitle: {
    fontSize: 13.5,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ffffff',
  },
  recentDate: {
    fontSize: 11,
    fontFamily: sansFont,
    color: '#64748b',
  },
  recentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recentBadgeText: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scanCountRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  scanCountText: {
    fontSize: 11,
    fontFamily: sansFont,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: serifFont,
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: sansFont,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
