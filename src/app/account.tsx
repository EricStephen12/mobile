import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

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

export default function AccountScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token || !user) return;
        
        const res = await fetch(`${API_URL}/api/me?userId=${user.id}&email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setName(data.name || user.fullName || '');
          setEmail(data.email || user.primaryEmailAddress?.emailAddress || '');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.id, name })
      });
      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (e) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrow color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={BRAND_GREEN} size="large" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase() || 'E'}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSubtle }]}>FULL NAME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.textSubtle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSubtle }]}>EMAIL ADDRESS (READ-ONLY)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, color: colors.textSubtle }]}
                  value={email}
                  editable={false}
                />
              </View>
            </View>

          </ScrollView>
        )}

        {!loading && (
          <View style={[styles.footer, { borderTopColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.saveButton, saving && { opacity: 0.7 }]} 
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.saveText}>SAVE CHANGES</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontFamily: sansFont,
    fontWeight: '700',
    color: BRAND_GREEN,
  },
  changeAvatarText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#94a3b8',
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
  },
  input: {
    height: 52,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: sansFont,
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 12 : 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  saveButton: {
    height: 54,
    backgroundColor: BRAND_GREEN,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
  },
});
