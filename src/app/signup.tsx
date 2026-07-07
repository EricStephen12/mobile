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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useSignUp } from '@clerk/clerk-expo';

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

export default function SignupScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { signUp, setActive, isLoaded } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const passwordMatch = password === confirmPassword;
  const canSubmit = name && email && password && confirmPassword && passwordMatch;

  const handleSignUp = async () => {
    if (!isLoaded || !canSubmit) return;
    setLoading(true);
    
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/lens');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', padding: 20 }]}>
        <Text style={[styles.title, { color: colors.text, marginBottom: 20 }]}>VERIFY{'\n'}EMAIL.</Text>
        <Text style={[styles.subtitle, { color: colors.textSubtle, marginBottom: 20 }]}>Enter the code sent to {email}</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, marginBottom: 20 }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={code}
            onChangeText={setCode}
            placeholder="Verification code"
            placeholderTextColor={colors.textSubtle}
          />
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={onPressVerify}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.createText}>VERIFY</Text>}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
              <Text style={[styles.backText, { color: colors.textSubtle }]}>BACK</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <Text style={[styles.logoTextLeft, { color: colors.text }]}>EI</Text>
              <LeafLogoX size={34} color={BRAND_GREEN} />
              <Text style={[styles.logoTextRight, { color: colors.text }]}>ORA</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>CREATE{'\n'}ACCOUNT.</Text>
            <Text style={[styles.subtitle, { color: colors.textSubtle }]}>Join the intelligence network.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'name' && styles.inputFocused]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textSubtle}
                  autoCapitalize="words"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'email' && styles.inputFocused]}>
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
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }, focusedField === 'password' && styles.inputFocused]}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={[
                styles.inputWrapper,
                { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                focusedField === 'confirm' && styles.inputFocused,
                confirmPassword.length > 0 && !passwordMatch && styles.inputError,
              ]}>
                <TextInput
                  style={[styles.input, { flex: 1, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSubtle}
                  secureTextEntry={!showConfirm}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeText}>{showConfirm ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordMatch && (
                <Text style={styles.errorText}>Passwords don't match</Text>
              )}
            </View>
          </View>

          {/* Terms notice */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <View style={styles.buttonBlock}>
            <TouchableOpacity
              style={[styles.createButton, !canSubmit && styles.createButtonDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.createText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={[styles.signInButton, { borderColor: colors.surfaceBorder }]}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={[styles.signInText, { color: colors.text }]}>SIGN IN INSTEAD</Text>
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
    paddingTop: Platform.OS === 'ios' ? 12 : 32,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backArrow: {
    fontSize: 20,
    color: '#ffffff',
    lineHeight: 22,
  },
  backText: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  logoTextLeft: {
    fontSize: 28,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoTextRight: {
    fontSize: 28,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  titleBlock: {
    marginBottom: 32,
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
    gap: 18,
    marginBottom: 20,
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
  inputError: {
    borderColor: '#ef4444',
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
  errorText: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#ef4444',
    marginTop: 4,
  },
  termsText: {
    fontSize: 12,
    fontFamily: sansFont,
    color: '#4a5568',
    lineHeight: 18,
    marginBottom: 24,
  },
  termsLink: {
    color: BRAND_GREEN,
  },
  buttonBlock: {
    gap: 16,
  },
  createButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createText: {
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
  signInButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
});
