import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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

export default function ForgotScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>RESET{'\n'}PASSWORD</Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
            {sent 
              ? "We've sent a recovery link to your email." 
              : "Enter your email to receive a recovery link."}
          </Text>
        </View>

        {!sent ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, color: colors.text }]}
                placeholder="hello@example.com"
                placeholderTextColor={colors.textSubtle}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, !email && styles.buttonDisabled]} 
              onPress={handleReset}
              disabled={!email || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>SEND LINK</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.buttonText}>RETURN TO LOGIN</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerText}>Wait, I remember it.</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: sansFont,
    color: '#94a3b8',
    lineHeight: 22,
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
  button: {
    height: 54,
    backgroundColor: BRAND_GREEN,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1.5,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
