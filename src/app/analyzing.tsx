import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Path,
  G,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Filter,
  FeGaussianBlur,
} from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { downloadVideo, extractFrames, cleanupVideo } from '../utils/videoProcessor';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';

const { width, height } = Dimensions.get('window');
const BRAND_GREEN = '#bdf522';

const sansFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

// ── Ixora Flower SVG (exact match) ─────────────────────────────────────────
const IxoraFlower = ({ glowOpacity }: { glowOpacity: SharedValue<number> }) => {
  const animStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // 8 petals: alternating long and slightly shorter, thin tapered lancet shapes
  const PETALS = [
    { angle: 0,   length: 62 },
    { angle: 45,  length: 55 },
    { angle: 90,  length: 62 },
    { angle: 135, length: 55 },
    { angle: 180, length: 62 },
    { angle: 225, length: 55 },
    { angle: 270, length: 62 },
    { angle: 315, length: 55 },
  ];

  return (
    <Animated.View style={[styles.flowerWrapper, animStyle]}>
      <Svg width={220} height={260} viewBox="-110 -110 220 260">
        <Defs>
          {/* Radial glow behind the flower head */}
          <RadialGradient id="glowBg" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor={BRAND_GREEN} stopOpacity="0.18" />
            <Stop offset="60%"  stopColor={BRAND_GREEN} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={BRAND_GREEN} stopOpacity="0"    />
          </RadialGradient>
        </Defs>

        {/* ── Soft ambient glow disc ── */}
        <Circle cx="0" cy="0" r="96" fill="url(#glowBg)" />

        {/* ── Outer halo ring ── */}
        <Circle
          cx="0" cy="0" r="80"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="0.6"
          strokeOpacity="0.35"
        />

        {/* ── Inner halo ring ── */}
        <Circle
          cx="0" cy="0" r="68"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="0.4"
          strokeOpacity="0.22"
        />

        {/* ── Petals ── thin lancet shapes with a center vein */}
        {PETALS.map(({ angle, length }, i) => {
          const w = 7; // half-width of petal at widest point
          return (
            <G key={i} transform={`rotate(${angle})`}>
              {/* Petal outline: thin lancet (pointed top and bottom) */}
              <Path
                d={`M 0,0 C -${w},-${length * 0.35} -${w * 0.6},-${length * 0.72} 0,-${length} C ${w * 0.6},-${length * 0.72} ${w},-${length * 0.35} 0,0`}
                fill="none"
                stroke={BRAND_GREEN}
                strokeWidth="1.1"
                strokeOpacity="0.88"
                strokeLinecap="round"
              />
              {/* Center vein line */}
              <Path
                d={`M 0,-4 L 0,-${length - 4}`}
                fill="none"
                stroke={BRAND_GREEN}
                strokeWidth="0.45"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            </G>
          );
        })}

        {/* ── Center disc ── */}
        <Circle cx="0" cy="0" r="5.5" fill="none" stroke={BRAND_GREEN} strokeWidth="1.2" strokeOpacity="0.9" />
        <Circle cx="0" cy="0" r="2.5" fill={BRAND_GREEN} opacity="0.7" />

        {/* ── Stem (slightly curved) ── */}
        <Path
          d="M 0,4 C 2,30 -4,70 -2,115"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="1.2"
          strokeOpacity="0.85"
          strokeLinecap="round"
        />

        {/* ── Left leaf (with vein) ~40 units down ── */}
        <Path
          d="M -1,48 C -22,32 -38,44 -26,58 C -16,55 -5,52 -1,48"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="1.0"
          strokeOpacity="0.78"
          strokeLinejoin="round"
        />
        {/* Left leaf center vein */}
        <Path
          d="M -1,48 L -22,54"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="0.4"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />

        {/* ── Right leaf (with vein) ~78 units down ── */}
        <Path
          d="M -2,82 C 18,68 32,80 20,94 C 10,90 0,86 -2,82"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="1.0"
          strokeOpacity="0.78"
          strokeLinejoin="round"
        />
        {/* Right leaf center vein */}
        <Path
          d="M -2,82 L 18,90"
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="0.4"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

// ── Steps ──────────────────────────────────────────────────────────────────
const STEPS = ['EXTRACTING FRAMES', 'READING VISUALS', 'BUILDING INSIGHT'];

const StepRow = ({
  label,
  delay,
  colors,
}: {
  label: string;
  delay: number;
  colors: any;
}) => {
  const opacity = useSharedValue(0);
  const dotScale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    dotScale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 500, easing: Easing.out(Easing.ease) }),
          withTiming(1.0, { duration: 500, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const rowStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <Animated.View style={[styles.stepRow, rowStyle]}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text style={[styles.stepLabel, { color: colors.text }]}>{label}</Text>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
export default function AnalyzingScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  // Flower pulsing glow
  const glowOpacity = useSharedValue(0.7);
  const { getToken, userId } = useAuth();

  const { url } = useLocalSearchParams<{ url: string }>();
  const [errorMsg, setErrorMsg] = React.useState('');

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    let isMounted = true;
    let localVideoPath = '';

    async function processVideo() {
      try {
        if (!url) {
          throw new Error('No video URL provided');
        }

        localVideoPath = await downloadVideo(url);
        const durationMs = 15000;

        const frames = await extractFrames(localVideoPath, durationMs, 30);

        const token = await getToken();

        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';
        const response = await fetch(`${API_URL}/api/analyze`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            frames,
            duration: durationMs / 1000,
            sourceUrl: url,
            userId,
          })
        });

        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.error || data.details || 'Analysis failed');
        }

        if (isMounted) {
          const sessionId = data.sessionId;
          
          while (isMounted) {
            try {
              const pollRes = await fetch(`${API_URL}/api/lounge-session/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (pollRes.ok) {
                const pollData = await pollRes.json();
                if (pollData.dna) {
                  if (pollData.dna.status === 'completed') {
                    router.replace(`/chat?sessionId=${sessionId}`);
                    break;
                  } else if (pollData.dna.status === 'failed') {
                    throw new Error(pollData.dna.error || 'Server failed to analyze video');
                  }
                }
              }
            } catch (pollErr: any) {
              // If it's the specific failed error, throw it to the outer catch block
              if (pollErr.message === 'Server failed to analyze video') {
                throw pollErr;
              }
              console.error('Polling warning:', pollErr);
            }
            await new Promise(r => setTimeout(r, 2500));
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'An error occurred during analysis');
        }
      } finally {
        if (localVideoPath) {
          cleanupVideo(localVideoPath);
        }
      }
    }

    processVideo();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.content}>
        {/* ── Flower ── */}
        <View style={styles.flowerContainer}>
          <IxoraFlower glowOpacity={glowOpacity} />
        </View>

        {/* ── Steps ── */}
        {errorMsg ? <Text style={{color: 'red', textAlign: 'center', marginBottom: 20}}>{errorMsg}</Text> : null}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => (
            <StepRow key={step} label={step} delay={i * 900} colors={colors} />
          ))}
        </View>

        {/* ── Cancel ── */}
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Text style={[styles.cancelText, { color: colors.textSubtle }]}>CANCEL</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 48,
  },
  flowerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsContainer: {
    width: '100%',
    gap: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_GREEN,
    shadowColor: BRAND_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2.5,
  },
  cancelButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 2,
  },
});
