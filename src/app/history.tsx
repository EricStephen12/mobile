import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { TabBar } from '../components/TabBar';
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

// Mock Data
const MOCK_HISTORY = [
  { id: '1', title: 'Summer Sale Video', date: 'Just now', type: 'ad' },
  { id: '2', title: 'Influencer Collab', date: '2 hours ago', type: 'content' },
  { id: '3', title: 'Product Launch teaser', date: 'Yesterday', type: 'ad' },
  { id: '4', title: 'Behind the Scenes', date: 'Jul 1', type: 'content' },
  { id: '5', title: 'UGC Review 1', date: 'Jun 28', type: 'ad' },
  { id: '6', title: 'UGC Review 2', date: 'Jun 28', type: 'ad' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if (!token || !user) return;
        const res = await fetch(`${API_URL}/api/user-sessions?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data || []);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={BRAND_GREEN} size="large" />
        ) : history.length === 0 ? (
          <Text style={{ color: colors.textSubtle, textAlign: 'center', marginTop: 40 }}>No history found. Run your first scan!</Text>
        ) : (
          <View style={styles.historyList}>
            {history.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                activeOpacity={0.7}
                onPress={() => router.push(`/chat?sessionId=${item.id}`)}
              >
                <View style={styles.historyCardLeft}>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title || 'Analysis Session'}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.textSubtle }]}>
                      {new Date(item.updatedAt || item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Analysis</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── TAB BAR ── */}
      <TabBar activeTab="history" />
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
  historyList: {
    gap: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  historyInfo: {
    gap: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ffffff',
  },
  historyDate: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#64748b',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeAd: {
    backgroundColor: '#1a220d',
    borderColor: '#2d3f11',
  },
  badgeContent: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextAd: {
    color: BRAND_GREEN,
  },
  badgeTextContent: {
    color: '#94a3b8',
  },
});
