import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useSignIn, useAuth } from '@clerk/clerk-expo';

const { width, height } = Dimensions.get('window');
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

const LeafLogoX = ({ size = 40, color = '#ffffff' }: { size?: number; color?: string }) => {
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

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMfaPending, setIsMfaPending] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const handleSignIn = async () => {
    if (!isLoaded || !email || !password) return;
    setLoading(true);
    
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/lens');
      } else if (signInAttempt.status === 'needs_second_factor') {
        // Prepare MFA (this sends the email code)
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setIsMfaPending(true);
      } else {
        // If status is null, the account likely doesn't exist or hasn't been created
        if (!signInAttempt.status) {
          Alert.alert('Account not found', 'Please tap "Create an Account" first.');
        } else {
          Alert.alert('Sign in incomplete', 'Please check your credentials or create an account.');
        }
        console.error('Incomplete Sign-In Attempt:', JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'session_exists') {
        // The backend thinks we are logged in, but the frontend doesn't.
        // We force sign out the old session to reset the state.
        await signOut();
        Alert.alert('Stale session', 'Old session detected and cleared. Please click Sign In again.');
      } else {
        console.error(JSON.stringify(err, null, 2));
        Alert.alert('Sign in failed', err.errors?.[0]?.message || 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!isLoaded || !mfaCode) return;
    setLoading(true);
    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: mfaCode,
      });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/lens');
      } else {
        console.error(attempt);
        Alert.alert('Verification failed', 'Invalid MFA code');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Verification failed', err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Text style={[styles.logoTextLeft, { color: colors.text }]}>EI</Text>
              <LeafLogoX size={38} color={colors.primary} />
              <Text style={[styles.logoTextRight, { color: colors.text }]}>ORA</Text>
            </View>
            <View style={styles.taglineRow}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>VIDEO INTELLIGENCE</Text>
              <View style={styles.taglineLine} />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>WELCOME{'\n'}BACK.</Text>
            <Text style={[styles.subtitle, { color: colors.textSubtle }]}>Sign in to continue.</Text>
          </View>

          {/* Form */}
          {!isMfaPending ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'email' && { borderColor: colors.primary }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'password' && { borderColor: colors.primary }]}>
                  <TextInput
                    style={[styles.input, { flex: 1, color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSubtle}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.forgotRow} 
                activeOpacity={0.7}
                onPress={() => router.push('/forgot')}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={{ color: colors.text, marginBottom: 10 }}>Check your email for a verification code.</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>VERIFICATION CODE</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'code' && { borderColor: colors.primary }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={mfaCode}
                    onChangeText={setMfaCode}
                    placeholder="123456"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('code')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonBlock}>
            {!isMfaPending ? (
              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: colors.primary }, (!email || !password) && styles.signInButtonDisabled]}
                onPress={handleSignIn}
                activeOpacity={0.85}
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.signInText}>SIGN IN</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: colors.primary }, (!mfaCode) && styles.signInButtonDisabled]}
                onPress={handleVerifyMfa}
                activeOpacity={0.85}
                disabled={loading || !mfaCode}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.signInText}>VERIFY CODE</Text>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.createButton, { borderColor: colors.surfaceBorder }]}
              onPress={() => router.push('/signup')}
              activeOpacity={0.85}
            >
              <Text style={[styles.createText, { color: colors.text }]}>CREATE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 44,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoTextLeft: {
    fontSize: 36,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoTextRight: {
    fontSize: 36,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    width: '100%',
  },
  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  tagline: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#4a5568',
    letterSpacing: 5,
  },
  titleBlock: {
    marginBottom: 36,
  },
  title: {
    fontSize: 42,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: sansFont,
    color: '#64748b',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  form: {
    gap: 20,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    height: 54,
  },
  inputFocused: {
    borderColor: BRAND_GREEN,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: sansFont,
    color: '#ffffff',
  },
  eyeButton: {
    paddingLeft: 12,
  },
  eyeText: {
    fontSize: 9,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#4a5568',
    letterSpacing: 1.5,
  },
  forgotRow: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 13,
    fontFamily: sansFont,
    color: BRAND_GREEN,
  },
  buttonBlock: {
    marginTop: 32,
    gap: 16,
  },
  signInButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonDisabled: {
    opacity: 0.4,
  },
  signInText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  dividerText: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#4a5568',
  },
  createButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
});
