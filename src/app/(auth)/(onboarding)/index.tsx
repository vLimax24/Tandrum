// src/app/(auth)/(onboarding)/index.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

const { width, height } = Dimensions.get('window');

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  index: number;
  theme: ReturnType<typeof createTheme>;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  index,
  theme,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, index * 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="mb-6"
    >
      <BlurView
        intensity={20}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.colors.glass,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
        }}
      >
        <View className="p-6">
          <View className="flex-row items-start gap-4">
            <View
              className="rounded-xl items-center justify-center"
              style={{
                width: 48,
                height: 48,
                backgroundColor: `${theme.colors.primary}15`,
              }}
            >
              <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="text-lg font-semibold mb-2 font-mainRegular"
                style={{ color: theme.colors.text.primary }}
              >
                {title}
              </Text>
              <Text
                className="text-base leading-6 font-mainRegular"
                style={{ color: theme.colors.text.secondary }}
              >
                {description}
              </Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default function OnboardingWelcome() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.9)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  const features = [
    {
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      title: 'Build Together',
      description:
        'Join friends and stay accountable as you develop life-changing habits together.',
    },
    {
      icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
      title: 'Track Progress',
      description:
        'Visualize your growth with beautiful charts and celebrate every milestone achieved.',
    },
    {
      icon: 'trophy' as keyof typeof Ionicons.glyphMap,
      title: 'Gamified Experience',
      description:
        'Earn rewards, unlock achievements, and make habit-building an exciting journey.',
    },
  ];

  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/(onboarding)/username');
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background[0] }}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent />

      {/* Animated Background Elements */}
      <Animated.View
        className="absolute inset-0"
        style={{ opacity: backgroundAnim }}
      >
        <LinearGradient
          colors={[
            `${theme.colors.primary}08`,
            `${theme.colors.primary}03`,
            'transparent',
          ]}
          style={{
            position: 'absolute',
            width: width * 1.5,
            height: height * 0.6,
            borderRadius: width * 0.75,
            top: -height * 0.3,
            right: -width * 0.25,
          }}
        />
        <LinearGradient
          colors={[
            'transparent',
            `${theme.colors.primaryLight}05`,
            `${theme.colors.primary}08`,
          ]}
          style={{
            position: 'absolute',
            width: width * 1.2,
            height: height * 0.5,
            borderRadius: width * 0.6,
            bottom: -height * 0.25,
            left: -width * 0.1,
          }}
        />
      </Animated.View>

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 py-8">
            {/* Hero Section */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: heroScaleAnim },
                ],
              }}
              className="items-center mb-12 mt-12"
            >
              {/* Hero Icon */}
              <View className="items-center mb-10">
                <View className="relative items-center justify-center mb-8">
                  {/* Outer blur ring */}
                  <BlurView
                    intensity={15}
                    className="absolute rounded-full items-center justify-center overflow-hidden"
                    style={{
                      width: 140,
                      height: 140,
                      backgroundColor: theme.colors.glass,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                    }}
                  />

                  {/* Inner gradient circle */}
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="people" size={44} color="white" />
                  </LinearGradient>
                </View>

                {/* Title and Subtitle */}
                <View className="items-center max-w-sm">
                  <Text
                    className="text-4xl font-bold text-center mb-4 leading-tight font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Welcome to{'\n'}
                    <Text style={{ color: theme.colors.primary }}>Tandrum</Text>
                  </Text>
                  <Text
                    className="text-lg text-center leading-7 font-mainRegular"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Transform your life through the power of community. Build
                    lasting habits together.
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Features Section */}
            <View className="mb-12">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                  theme={theme}
                />
              ))}
            </View>

            {/* Action Section */}
            <View className="justify-end pb-6">
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                {/* Primary CTA */}
                <TouchableOpacity
                  className="rounded-2xl overflow-hidden mb-4"
                  activeOpacity={0.8}
                  onPress={handleGetStarted}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 18,
                      paddingHorizontal: 32,
                      alignItems: 'center',
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-semibold text-lg font-mainRegular">
                        Start Your Journey
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
