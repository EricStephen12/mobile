import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { TabBar } from '../components/TabBar';
import { useTheme } from '../theme/ThemeContext';
import { useRevenueCat } from '../theme/RevenueCatProvider';
import { AmbientGlow } from '../components/AmbientGlow';

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

const ChevronRight = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

const SettingsItem = ({ icon, label, onPress, value, showChevron = true, colors }: any) => (
  <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: colors.surfaceBorder }]} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
    <View style={styles.settingsItemLeft}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.settingsItemLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
    <View style={styles.settingsItemRight}>
      {value && <Text style={[styles.settingsItemValue, { color: colors.textSubtle }]}>{value}</Text>}
      {onPress && showChevron && <ChevronRight />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { signOut } = useAuth();
  const { tier, isPro } = useRevenueCat();
  const [notifications, setNotifications] = useState(true);

  const tierLabel = tier === 'studio' ? 'Eixora Studio' : tier === 'creator' ? 'Eixora Creator' : 'Free';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (err) {
              console.error('Sign out error:', err);
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>PREFERENCES</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <SettingsItem label="Account" onPress={() => router.push('/account')} colors={colors} />
            <SettingsItem 
              label="Subscription" 
              value={tierLabel}
              onPress={() => router.push('/pricing')} 
              colors={colors}
            />
            <SettingsItem 
              label="Notifications" 
              value={notifications ? "On" : "Off"} 
              onPress={() => setNotifications(!notifications)} 
              showChevron={false}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>APP</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <SettingsItem 
              label="Dark Mode" 
              value={isDark ? "On" : "Off"} 
              onPress={toggleTheme}
              showChevron={false}
              colors={colors}
            />
            <SettingsItem label="About Eixora" onPress={() => router.push('/about')} colors={colors} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: '#3f1a1a' }]} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── TAB BAR ── */}
      <TabBar activeTab="settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: serifFont,
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: 15,
    fontFamily: sansFont,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 14,
    fontFamily: sansFont,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3f1a1a',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ef4444',
  },
});
