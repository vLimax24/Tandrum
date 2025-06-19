import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSSO, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';
import { AlertModal } from '@/components/AlertModal';
import { useNavigationStore } from '@/stores/NavigationStore';

const { width, height } = Dimensions.get('window');

interface TutorialPage {
  id: number;
  title: string;
  description: string;
  image: any;
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
}

const tutorialPages: TutorialPage[] = [
  {
    id: 1,
    title: 'Build Habits Together',
    description:
      'Join a community where accountability meets motivation. Transform your daily routines with the power of shared commitment.',
    image: require('../../../assets/trees/tree-1.png'),
    iconName: 'people-circle',
    gradientColors: ['#009966', '#00cc88'] as const,
  },
  {
    id: 2,
    title: 'Track Your Growth',
    description:
      'Visualize your progress with beautiful insights and celebrate every milestone with your accountability partners.',
    image: require('../../../assets/trees/tree-3.png'),
    iconName: 'analytics',
    gradientColors: ['#009966', '#00cc88'] as const,
  },
  {
    id: 3,
    title: 'Stay Motivated Daily',
    description:
      'Turn habit-building into an engaging journey with gamified progress and meaningful connections that keep you going.',
    image: require('../../../assets/trees/tree-4.png'),
    iconName: 'trophy',
    gradientColors: ['#009966', '#00cc88'] as const,
  },
];

export default function TutorialScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  // Use Zustand store instead of AsyncStorage
  const { completeTutorial } = useNavigationStore();

  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap,
    iconColor?: string,
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  // Animation refs - using single scroll position for smooth dot animations
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef(
    tutorialPages.map(() => new Animated.Value(0)),
  ).current;
  const slideAnims = useRef(
    tutorialPages.map(() => new Animated.Value(50)),
  ).current;
  const scaleAnims = useRef(
    tutorialPages.map(() => new Animated.Value(0.9)),
  ).current;
  const authFadeAnim = useRef(new Animated.Value(0)).current;
  const authSlideAnim = useRef(new Animated.Value(50)).current;

  // Initial animation
  useEffect(() => {
    // Animate first page on mount
    Animated.parallel([
      Animated.timing(fadeAnims[0], {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnims[0], {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[0], {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auth screen animation
  useEffect(() => {
    if (showAuth) {
      Animated.parallel([
        Animated.timing(authFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(authSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAuth]);

  const animatePageTransition = (pageIndex: number) => {
    // Fade out previous page
    if (currentPage !== pageIndex) {
      Animated.timing(fadeAnims[currentPage], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // Animate new page
    Animated.parallel([
      Animated.timing(fadeAnims[pageIndex], {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnims[pageIndex], {
        toValue: 0,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[pageIndex], {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
      animatePageTransition(nextPage);
    } else {
      setShowAuth(true);
    }
  };

  const handleSkip = () => {
    setShowAuth(true);
  };

  const handleGoogleLogin = async () => {
    try {
      // Mark tutorial as completed in Zustand store
      completeTutorial();

      // Start SSO flow
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        // Navigation will be handled automatically by the layout
      }
    } catch (error: any) {
      console.error('Login error:', error);

      showAlert(
        'Login Failed',
        error.message || 'An error occurred during login. Please try again.',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#ef4444',
      );
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollPosition / width);

    if (page !== currentPage) {
      setCurrentPage(page);
      animatePageTransition(page);
    }
  };

  const renderSmoothAnimatedDots = () => {
    return (
      <View className="flex-row justify-center items-center mb-4 gap-2">
        {tutorialPages.map((_, index) => {
          // Calculate the input range for each dot
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          // Smooth width animation based on scroll position
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 32, 8], // inactive: 8px, active: 32px
            extrapolate: 'clamp',
          });

          // Smooth opacity animation
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3], // inactive: 30%, active: 100%
            extrapolate: 'clamp',
          });

          // Smooth background color transition
          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: [
              theme.colors.text.tertiary,
              theme.colors.primary,
              theme.colors.text.tertiary,
            ],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={{
                width: dotWidth,
                height: 8,
                borderRadius: 4,
                backgroundColor,
                opacity,
              }}
            />
          );
        })}
      </View>
    );
  };

  if (showAuth) {
    return (
      <LinearGradient colors={theme.colors.background} className="flex-1">
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />

        {/* Floating background elements */}
        <View className="absolute inset-0 overflow-hidden">
          <View
            className="absolute rounded-full"
            style={{
              width: 400,
              height: 400,
              backgroundColor: theme.colors.primary + '15',
              top: -200,
              right: -200,
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 320,
              height: 320,
              backgroundColor: theme.colors.primaryLight + '10',
              bottom: -160,
              left: -160,
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              backgroundColor: theme.colors.primary + '08',
              top: height * 0.2,
              left: -100,
            }}
          />
        </View>

        <SafeAreaView className="flex-1">
          <Animated.View
            style={{
              flex: 1,
              opacity: authFadeAnim,
              transform: [{ translateY: authSlideAnim }],
            }}
            className="justify-center items-center px-6"
          >
            <View className="items-center w-full">
              {/* Hero Section */}
              <View className="items-center mb-16">
                <View className="relative items-center justify-center mb-12">
                  {/* Main glassmorphic container */}
                  <BlurView
                    intensity={isDarkMode ? 15 : 25}
                    tint={isDarkMode ? 'dark' : 'light'}
                    className="rounded-3xl"
                    style={{
                      width: 180,
                      height: 180,
                      backgroundColor: theme.colors.glass,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                    }}
                  >
                    <View className="flex-1 items-center justify-center">
                      {/* Inner gradient container */}
                      <LinearGradient
                        colors={['#009966', '#00cc88']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="items-center justify-center"
                        style={{
                          width: 110,
                          height: 110,
                          borderRadius: 24,
                        }}
                      >
                        <Ionicons name="rocket" size={48} color="white" />
                      </LinearGradient>
                    </View>
                  </BlurView>

                  {/* Floating accent elements */}
                  <View
                    className="absolute rounded-full"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: theme.colors.primary + '40',
                      top: 15,
                      right: 10,
                    }}
                  />
                  <View
                    className="absolute rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: theme.colors.primaryLight + '30',
                      bottom: 20,
                      left: 15,
                    }}
                  />
                </View>

                <Text
                  className="text-4xl font-bold text-center mb-6 leading-tight tracking-tight"
                  style={{ color: theme.colors.text.primary }}
                >
                  Welcome to{'\n'}
                  <Text style={{ color: theme.colors.primary }}>Tandrum</Text>
                </Text>

                <Text
                  className="text-lg text-center leading-7 max-w-md px-4"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Start building lasting habits with the support of an amazing
                  community. Your transformation begins here.
                </Text>
              </View>

              {/* CTA Section */}
              <View className="w-full max-w-sm">
                <TouchableOpacity
                  className="mb-6 rounded-3xl overflow-hidden"
                  activeOpacity={0.85}
                  onPress={handleGoogleLogin}
                >
                  <BlurView
                    intensity={isDarkMode ? 20 : 30}
                    tint={isDarkMode ? 'dark' : 'light'}
                    className="relative"
                    style={{
                      backgroundColor: theme.colors.glass,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                    }}
                  >
                    <LinearGradient
                      colors={['#009966', '#00cc88']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-8 py-5"
                      style={{ borderRadius: 24 }}
                    >
                      <View className="flex-row items-center justify-center gap-3">
                        <Ionicons name="logo-google" size={24} color="white" />
                        <Text className="text-white font-bold text-lg">
                          Continue with Google
                        </Text>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>

                <Text
                  className="text-sm text-center px-6 leading-5"
                  style={{ color: theme.colors.text.tertiary }}
                >
                  By continuing, you agree to build better habits together with
                  our supportive community
                </Text>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.background} className="flex-1">
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Enhanced floating background elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            backgroundColor: theme.colors.primary + '12',
            top: -240,
            right: -240,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 360,
            height: 360,
            backgroundColor: theme.colors.primaryLight + '08',
            bottom: -180,
            left: -180,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            backgroundColor: theme.colors.primary + '06',
            top: height * 0.3,
            left: -80,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            backgroundColor: theme.colors.primaryLight + '10',
            top: height * 0.6,
            right: -60,
          }}
        />
      </View>

      <SafeAreaView className="flex-1">
        {/* Enhanced skip button */}
        <View className="absolute top-10 right-6 z-10">
          <TouchableOpacity
            onPress={handleSkip}
            className="rounded-2xl"
            activeOpacity={0.8}
          >
            <BlurView
              intensity={isDarkMode ? 15 : 25}
              tint={isDarkMode ? 'dark' : 'light'}
              className="py-2 px-4 rounded-full"
              style={{
                backgroundColor: theme.colors.glass,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: theme.colors.text.secondary }}
              >
                Skip
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Tutorial pages */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: handleScroll,
            },
          )}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {tutorialPages.map((page, index) => (
            <View
              key={page.id}
              style={{ width }}
              className="flex-1 justify-center items-center px-6"
            >
              <Animated.View
                style={{
                  opacity: fadeAnims[index],
                  transform: [
                    { translateY: slideAnims[index] },
                    { scale: scaleAnims[index] },
                  ],
                }}
                className="items-center"
              >
                {/* Enhanced Hero Icon Section */}
                <View className="items-center mb-12">
                  <View className="relative items-center justify-center mb-5">
                    {/* Main glassmorphic background */}
                    <BlurView
                      intensity={isDarkMode ? 15 : 25}
                      tint={isDarkMode ? 'dark' : 'light'}
                      className="rounded-3xl"
                      style={{
                        width: 160,
                        height: 160,
                        backgroundColor: theme.colors.glass,
                        borderWidth: 1,
                        borderColor: theme.colors.cardBorder,
                      }}
                    >
                      <View className="flex-1 items-center justify-center">
                        {/* Icon container */}
                        <LinearGradient
                          colors={page.gradientColors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="items-center justify-center"
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 24,
                          }}
                        >
                          <Ionicons
                            name={page.iconName}
                            size={56}
                            color="white"
                          />
                        </LinearGradient>
                      </View>
                    </BlurView>

                    {/* Floating accent elements */}
                    <View
                      className="absolute rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: theme.colors.primary + '30',
                        top: 10,
                        right: 10,
                      }}
                    />
                    <View
                      className="absolute rounded-full"
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: theme.colors.primaryLight + '25',
                        bottom: 15,
                        left: 15,
                      }}
                    />
                  </View>

                  {/* Enhanced Decorative Image */}
                  <View className="mb-8 opacity-90">
                    <Image
                      source={page.image}
                      style={{
                        width: 240,
                        height: 180,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                </View>

                {/* Enhanced Content */}
                <View className="items-center max-w-md px-4">
                  <Text
                    className="text-3xl font-bold text-center mb-2 leading-tight tracking-tight"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {page.title}
                  </Text>
                  <Text
                    className="text-md text-center leading-5"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {page.description}
                  </Text>
                </View>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        {/* Enhanced Bottom section with smooth animated dots and next button */}
        <View className="pb-8 px-6">
          {renderSmoothAnimatedDots()}

          <TouchableOpacity
            className="rounded-3xl overflow-hidden"
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <BlurView
              intensity={isDarkMode ? 20 : 30}
              tint={isDarkMode ? 'dark' : 'light'}
              className="relative"
              style={{
                backgroundColor: theme.colors.glass,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <LinearGradient
                colors={['#009966', '#00cc88']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-5"
                style={{ borderRadius: 24 }}
              >
                <View className="flex-row items-center justify-center gap-3">
                  <Text className="text-white font-bold text-lg">
                    {currentPage === tutorialPages.length - 1
                      ? 'Get Started'
                      : 'Continue'}
                  </Text>
                  <Ionicons
                    name={
                      currentPage === tutorialPages.length - 1
                        ? 'rocket'
                        : 'arrow-forward'
                    }
                    size={22}
                    color="white"
                  />
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </LinearGradient>
  );
}
