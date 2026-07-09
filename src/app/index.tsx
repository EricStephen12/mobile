import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity, Dimensions, Platform, SafeAreaView, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import Svg, { Path, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Brand green color constant
const BRAND_GREEN = '#bdf522';

// Custom SVG Leaf X Component representing the Ixora plant flower/leaves
const LeafLogoX = ({ size = 55 }: { size?: number }) => {
  const leafColor = '#000000'; // Pure black color from original logo
  // Mathematically defined leaf path: elegant, organic curve with bold weight
  const leafPath = "M 0,0 C -5,-7 -9,-12 -9,-17 C -9,-22 -5,-25 0,-28 C 5,-25 9,-22 9,-17 C 9,-12 5,-7 0,0";

  return (
    <Svg width={size} height={size} viewBox="-30 -30 60 60">
      {/* Top Left Leaf */}
      <G transform="rotate(-45) translate(0, -3)">
        <Path d={leafPath} fill={leafColor} />
      </G>
      {/* Top Right Leaf */}
      <G transform="rotate(45) translate(0, -3)">
        <Path d={leafPath} fill={leafColor} />
      </G>
      {/* Bottom Right Leaf */}
      <G transform="rotate(135) translate(0, -3)">
        <Path d={leafPath} fill={leafColor} />
      </G>
      {/* Bottom Left Leaf */}
      <G transform="rotate(-135) translate(0, -3)">
        <Path d={leafPath} fill={leafColor} />
      </G>
    </Svg>
  );
};

// SVG-based smooth gradient overlay to fade the hero image into pure black
const GradientOverlay = ({ height = 150 }: { height?: number }) => {
  return (
    <Svg height={height} width="100%" style={styles.gradient}>
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <Stop offset="50%" stopColor="#000000" stopOpacity="0.5" />
          <Stop offset="85%" stopColor="#000000" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height={height} fill="url(#grad)" />
    </Svg>
  );
};

const ONBOARDING_SLIDES = [
  {
    id: '1',
    image: require('@/assets/images/welcome_hero.jpg'),
    titlePrefix: 'EVERY VIDEO\nHAS A ',
    titleHighlight: 'SECRET.',
    subtitle: 'EIXORA decodes it.',
  },
  {
    id: '2',
    image: require('@/assets/images/welcome_hero_2.jpg'),
    titlePrefix: 'YOUR AI\nCREATIVE\n',
    titleHighlight: 'DIRECTOR.',
    subtitle: 'Always on.\nAlways watching.',
  },
  {
    id: '3',
    image: require('@/assets/images/welcome_hero_3.jpg'),
    titlePrefix: 'SEE WHAT\nOTHERS ',
    titleHighlight: 'MISS.',
    subtitle: 'Frame by frame.\nInsight by insight.',
  }
];


export default function AppFlow() {
  const [stage, setStage] = useState<'splash' | 'onboarding'>('splash');
  const [statusBarColor, setStatusBarColor] = useState<'dark' | 'light'>('dark');

  // Animation values
  const splashOpacity = useSharedValue(1);
  const onboardingOpacity = useSharedValue(0);

  // Auto-scroll ref and state
  const flatListRef = useRef<FlatList>(null);
  const slideIndex = useRef(0);

  useEffect(() => {
    if (stage === 'onboarding') {
      const interval = setInterval(() => {
        slideIndex.current = (slideIndex.current + 1) % ONBOARDING_SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: slideIndex.current, animated: true });
      }, 4000); // 4 seconds per slide
      return () => clearInterval(interval);
    }
  }, [stage]);


  useEffect(() => {
    // Automatically transition from splash to onboarding stage after 2.5 seconds
    const timer = setTimeout(() => {
      // Fade out splash
      splashOpacity.value = withTiming(0, { duration: 600 }, () => {
        runOnJS(setStage)('onboarding');
        runOnJS(setStatusBarColor)('light');
        // Fade in onboarding
        onboardingOpacity.value = withTiming(1, { duration: 800 });
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedSplashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  const animatedOnboardingStyle = useAnimatedStyle(() => ({
    opacity: onboardingOpacity.value,
  }));

  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <View style={[styles.container, stage === 'onboarding' ? styles.bgBlack : styles.bgGreen]}>
      <StatusBar style={statusBarColor} />

      {stage === 'splash' && (
        <Animated.View style={[styles.splashWrapper, animatedSplashStyle]}>
          <ImageBackground
            source={require('@/assets/images/splash_background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.splashOverlay}>
              {/* Logo block */}
              <View style={styles.brandRow}>
                <Text style={styles.brandTextSide}>EI</Text>
                <View style={styles.svgWrapper}>
                  <LeafLogoX size={55} />
                </View>
                <Text style={styles.brandTextSide}>ORA</Text>
              </View>
              {/* Subtitle */}
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>VIDEO INTELLIGENCE</Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>
      )}

      {stage === 'onboarding' && (
        <Animated.View style={[styles.onboardingWrapper, animatedOnboardingStyle]}>
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            renderItem={({ item }) => (
              <View style={{ width, height: '100%' }}>
                {/* Top Half: Hero Image */}
                <View style={styles.heroContainer}>
                  <Image
                    source={item.image}
                    style={styles.heroImage}
                    resizeMode="cover"
                  />
                  <GradientOverlay height={180} />
                </View>

                {/* Bottom Half: Onboarding Text */}
                <SafeAreaView style={styles.onboardingContent}>
                  <View style={styles.textContainer}>
                    <Text style={styles.onboardingTitle}>
                      {item.titlePrefix}<Text style={styles.greenText}>{item.titleHighlight}</Text>
                    </Text>
                    <Text style={styles.onboardingSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>
                  {/* Dummy space for buttons to maintain layout */}
                  <View style={styles.dummyButtonSpace} />
                </SafeAreaView>
              </View>
            )}
          />

          {/* Absolute Buttons over the carousel */}
          <SafeAreaView style={styles.absoluteButtonContainer} pointerEvents="box-none">
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.85}
              >
                <Text style={styles.getStartedText}>GET STARTED</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                activeOpacity={0.85}
              >
                <Text style={styles.signInText}>SIGN IN</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </View>
  );
}

// Fallback logic for fonts to look exactly like high-contrast serif and sans-serif
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlack: {
    backgroundColor: '#000000',
  },
  bgGreen: {
    backgroundColor: '#84cc16',
  },
  splashWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  splashOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextSide: {
    fontSize: 52,
    fontFamily: serifFont,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 2,
  },
  svgWrapper: {
    marginHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleContainer: {
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 10.5,
    fontFamily: sansFont,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 7.5,
    textAlign: 'center',
  },
  onboardingWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroContainer: {
    width: '100%',
    height: height * 0.54,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  onboardingTitle: {
    fontSize: 37,
    fontFamily: serifFont,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.2,
  },
  greenText: {
    color: BRAND_GREEN,
  },
  onboardingSubtitle: {
    fontSize: 16.5,
    fontFamily: sansFont,
    fontWeight: '400',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 0.2,
  },
  dummyButtonSpace: {
    height: 124, // Matches 2 buttons (52 each) + gap (12) + marginBottom (8)
  },
  absoluteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 26,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 8,
  },
  getStartedButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 14.5,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  signInButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14.5,
    fontFamily: sansFont,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
