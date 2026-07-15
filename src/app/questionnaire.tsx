import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { AmbientGlow } from '../components/AmbientGlow';
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

const ROLES = [
  { id: 'creator', label: 'Content Creator', icon: '🎥' },
  { id: 'marketer', label: 'Marketer', icon: '📈' },
  { id: 'agency', label: 'Agency', icon: '🏢' },
  { id: 'brand', label: 'Brand Owner', icon: '💎' },
];

const GOALS = [
  { id: 'competitors', label: 'Analyze Competitors', icon: '🔍' },
  { id: 'engagement', label: 'Improve Engagement', icon: '❤️' },
  { id: 'trends', label: 'Discover Trends', icon: '🔥' },
  { id: 'roi', label: 'Maximize ROI', icon: '💰' },
];


const TypewriterText = ({ text, style, delay = 0 }: { text: string, style: any, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTyping = () => {
      interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, 60); // Speed of typing
    };

    const timeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return <Text style={style}>{displayedText}</Text>;
};

export default function QuestionnaireScreen() {

  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  
  const [role, setRole] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [lens, setLens] = useState<'ad' | 'content'>('ad');
  
  const [isFinishing, setIsFinishing] = useState(false);

  const opacity = useSharedValue(1);

  const transitionToStep = (nextStep: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setStep)(nextStep);
      opacity.value = withTiming(1, { duration: 300 });
    });
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    transitionToStep(5); // the loading step
    setIsFinishing(true);

    try {
      if (user) {
        // Split name into first and last for Clerk standard fields
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await user.update({
          firstName,
          lastName,
          unsafeMetadata: {
            role,
            goal,
            lens,
            onboardingComplete: true
          }
        });
      }
    } catch (err) {
      console.error('Failed to update user metadata:', err);
    }

    setTimeout(() => {
      router.replace({ pathname: '/home', params: { lens } });
    }, 2500);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
  }));

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <TypewriterText text={"What describes\nyou best?"} style={[styles.stepTitle, { color: colors.text }]} />
      <TypewriterText text="This helps us tailor your intelligence feed." style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />
      
      <View style={styles.optionsList}>
        {ROLES.map((r) => {
          const isSelected = role === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.optionCard, 
                { backgroundColor: colors.surface, borderColor: isSelected ? BRAND_GREEN : colors.surfaceBorder },
                isSelected && styles.optionCardSelected
              ]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                setRole(r.id);
                setTimeout(() => transitionToStep(2), 400); // Auto-advance
              }}
            >
              <Text style={styles.optionIcon}>{r.icon}</Text>
              <Text style={[styles.optionLabel, { color: isSelected ? BRAND_GREEN : colors.text }]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <TypewriterText text={"What is your\nprimary goal?"} style={[styles.stepTitle, { color: colors.text }]} />
      <TypewriterText text="We'll focus your insights on what matters." style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />
      
      <View style={styles.optionsList}>
        {GOALS.map((g) => {
          const isSelected = goal === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.optionCard, 
                { backgroundColor: colors.surface, borderColor: isSelected ? BRAND_GREEN : colors.surfaceBorder },
                isSelected && styles.optionCardSelected
              ]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                setGoal(g.id);
                setTimeout(() => transitionToStep(3), 400); // Auto-advance
              }}
            >
              <Text style={styles.optionIcon}>{g.icon}</Text>
              <Text style={[styles.optionLabel, { color: isSelected ? BRAND_GREEN : colors.text }]}>{g.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <TypewriterText text={"What is your\nfull name?"} style={[styles.stepTitle, { color: colors.text }]} />
      <TypewriterText text="So we know what to call you." style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="First Last"
          placeholderTextColor={colors.surfaceBorder}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
        />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.skipButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); transitionToStep(4); }}>
          <Text style={[styles.skipText, { color: colors.textSubtle }]}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, (!fullName) && { opacity: 0.5 }]} 
          disabled={!fullName}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); transitionToStep(4); }}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <TypewriterText text={"Choose your\nIntelligence Lens"} style={[styles.stepTitle, { color: colors.text }]} />
      <TypewriterText text="Select your primary workspace." style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />
      
      <View style={styles.optionsList}>
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: lens === 'ad' ? BRAND_GREEN : colors.surfaceBorder }, lens === 'ad' && styles.optionCardSelected]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            setLens('ad');
            setTimeout(() => handleFinish(), 400); // Auto-advance to finish
          }}
        >
          <Text style={styles.optionIcon}>📊</Text>
          <Text style={[styles.optionLabel, { color: lens === 'ad' ? BRAND_GREEN : colors.text }]}>Ad Intelligence</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: lens === 'content' ? BRAND_GREEN : colors.surfaceBorder }, lens === 'content' && styles.optionCardSelected]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            setLens('content');
            setTimeout(() => handleFinish(), 400); // Auto-advance to finish
          }}
        >
          <Text style={styles.optionIcon}>🎨</Text>
          <Text style={[styles.optionLabel, { color: lens === 'content' ? BRAND_GREEN : colors.text }]}>Content Intelligence</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center', paddingBottom: 100 }]}>
      <ActivityIndicator size="large" color={BRAND_GREEN} style={{ marginBottom: 30 }} />
      <Text style={[styles.loadingTitle, { color: colors.text }]}>Tailoring your dashboard...</Text>
      <Text style={[styles.loadingSubtitle, { color: colors.textSubtle }]}>Preparing your intelligence feed</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientGlow />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {step < 5 && (
        <View style={styles.header}>
          {step > 1 ? (
            <TouchableOpacity onPress={() => transitionToStep(step - 1)} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Text style={[styles.backText, { color: colors.textSubtle }]}>← BACK</Text>
            </TouchableOpacity>
          ) : <View />}
          <Text style={[styles.stepIndicator, { color: colors.primary }]}>{step} / 4</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" bounces={false}>
          <Animated.View style={animatedStyle}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
  backText: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  stepIndicator: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 28,
  },
  stepTitle: {
    fontSize: 42,
    fontFamily: serifFont,
    marginBottom: 16,
    lineHeight: 46,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: sansFont,
    marginBottom: 48,
    lineHeight: 24,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 16,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(189, 245, 34, 0.05)',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: sansFont,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    paddingBottom: 12,
    marginBottom: 48,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontFamily: sansFont,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: BRAND_GREEN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  nextText: {
    color: '#000000',
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: serifFont,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: sansFont,
    textAlign: 'center',
  },
});
