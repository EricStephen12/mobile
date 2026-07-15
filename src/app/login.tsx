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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeContext';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
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
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [flowType, setFlowType] = useState<'signIn' | 'signUp' | null>(null);

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const handleEmailSubmit = async () => {
    if (!isSignInLoaded || !isSignUpLoaded || !email) return;
    setLoading(true);
    
    try {
      // First, try to sign in
      const signInAttempt = await signIn.create({
        identifier: email,
        strategy: 'email_code',
      });

      if (signInAttempt.status === 'needs_first_factor') {
        // Successful login OTP generation
        setFlowType('signIn');
        setPendingVerification(true);
      } else {
        console.warn('Unexpected sign in status:', signInAttempt.status);
        Alert.alert('Error', 'Unable to start login process.');
      }
    } catch (err: any) {
      // If the user doesn't exist, the error code is 'form_identifier_not_found'
      const isUserNotFound = err.errors?.some((e: any) => e.code === 'form_identifier_not_found');
      
      if (isUserNotFound) {
        // Fallback to Sign Up
        try {
          await signUp.create({
            emailAddress: email,
          });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setFlowType('signUp');
          setPendingVerification(true);
        } catch (signUpErr: any) {
          console.error(JSON.stringify(signUpErr, null, 2));
          Alert.alert('Sign up failed', signUpErr.errors?.[0]?.message || 'Something went wrong.');
        }
      } else {
        console.error(JSON.stringify(err, null, 2));
        Alert.alert('Error', err.errors?.[0]?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);

    try {
      if (flowType === 'signIn') {
        const attempt = await signIn!.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });
        
        if (attempt.status === 'complete') {
          await setSignInActive!({ session: attempt.createdSessionId });
          router.replace('/home');
        } else {
          Alert.alert('Verification failed', 'The code is incomplete or invalid.');
        }
      } else if (flowType === 'signUp') {
        const attempt = await signUp!.attemptEmailAddressVerification({ code });
        
        if (attempt.status === 'complete') {
          await setSignUpActive!({ session: attempt.createdSessionId });
          router.replace('/questionnaire');
        } else {
          Alert.alert('Verification failed', 'The code is incomplete or invalid.');
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Verification failed', err.errors?.[0]?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <LeafLogoX size={32} color={colors.text} />
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={[styles.cancelText, { color: colors.textSubtle }]}>CANCEL</Text>
          </TouchableOpacity>
        </View>

        {!pendingVerification ? (
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>WELCOME.</Text>
            <Text style={[styles.subtitle, { color: colors.textSubtle }]}>Enter your email to sign in or create a new account instantly.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.surfaceBorder, backgroundColor: colors.surface }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.surfaceBorder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="go"
                onSubmitEditing={handleEmailSubmit}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (!email || loading) && { opacity: 0.5 }]} 
              onPress={handleEmailSubmit}
              disabled={!email || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>CONTINUE</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>VERIFY.</Text>
            <Text style={[styles.subtitle, { color: colors.textSubtle }]}>We sent a 6-digit code to {email}.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.surfaceBorder, backgroundColor: colors.surface, letterSpacing: 8, fontSize: 24, textAlign: 'center' }]}
                placeholder="000000"
                placeholderTextColor={colors.surfaceBorder}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleVerifyCode}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (code.length < 6 || loading) && { opacity: 0.5 }]} 
              onPress={handleVerifyCode}
              disabled={code.length < 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>VERIFY</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => { setPendingVerification(false); setCode(''); }}>
              <Text style={{ color: colors.textSubtle, textAlign: 'center', fontFamily: sansFont, fontSize: 12, fontWeight: '600' }}>USE A DIFFERENT EMAIL</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 20,
    marginBottom: 40,
    zIndex: 10,
  },
  cancelText: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 48,
    fontFamily: serifFont,
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: sansFont,
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: sansFont,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: BRAND_GREEN,
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#000000',
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
