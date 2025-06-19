// src/components/LoadingScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

export default function LoadingScreen() {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        {/* Floating Background Elements */}
        <View className="absolute inset-0 overflow-hidden">
          {/* Primary floating element */}
          <View
            className="absolute rounded-full opacity-20"
            style={{
              width: 280,
              height: 280,
              backgroundColor: theme.colors.primary,
              top: -140,
              right: -140,
            }}
          />
          {/* Secondary floating element */}
          <View
            className="absolute rounded-full opacity-15"
            style={{
              width: 200,
              height: 200,
              backgroundColor: theme.colors.primaryLight,
              bottom: -100,
              left: -100,
            }}
          />
          {/* Tertiary accent */}
          <View
            className="absolute rounded-full opacity-10"
            style={{
              width: 120,
              height: 120,
              backgroundColor: theme.colors.primary,
              top: '40%',
              left: -60,
            }}
          />
        </View>

        <View className="flex-1 justify-center items-center px-8">
          {/* Main Content Card */}
          <BlurView
            intensity={isDarkMode ? 20 : 30}
            tint={isDarkMode ? 'dark' : 'light'}
            style={{
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: theme.colors.glass,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
            }}
            className="w-full max-w-sm"
          >
            <View className="px-8 py-12 items-center">
              {/* Hero Icon Container */}
              <View className="items-center mb-8">
                <View
                  className="relative items-center justify-center mb-6"
                  style={{ width: 100, height: 100 }}
                >
                  {/* Outer ring */}
                  <View
                    className="absolute rounded-full"
                    style={{
                      width: 100,
                      height: 100,
                      backgroundColor: isDarkMode
                        ? 'rgba(0, 153, 102, 0.15)'
                        : 'rgba(0, 153, 102, 0.1)',
                      borderWidth: 1,
                      borderColor: isDarkMode
                        ? 'rgba(0, 153, 102, 0.3)'
                        : 'rgba(0, 153, 102, 0.2)',
                    }}
                  />

                  {/* Icon gradient background */}
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="people" size={28} color="white" />
                  </LinearGradient>
                </View>

                {/* App name */}
                <Text
                  className="text-3xl font-bold text-center mb-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  Tandrum
                </Text>

                {/* Tagline */}
                <Text
                  className="text-sm text-center leading-5"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Building habits together
                </Text>
              </View>

              {/* Loading Content */}
              <View className="items-center gap-6">
                <View>
                  <Text
                    className="text-lg font-semibold text-center"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Setting up your journey
                  </Text>

                  <Text
                    className="text-sm text-center leading-5 max-w-xs"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    Preparing your personalized habit-building experience
                  </Text>
                </View>

                {/* Custom Loading Indicator */}
                <View className="items-center gap-3">
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />

                  {/* Progress dots */}
                  <View className="flex-row gap-2">
                    {[0, 1, 2].map((index) => (
                      <View
                        key={index}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: theme.colors.primary,
                          opacity: 0.3 + index * 0.2,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </BlurView>

          {/* Bottom motivational text */}
          <View className="mt-8 px-4">
            <Text
              className="text-xs text-center opacity-60"
              style={{ color: theme.colors.text.tertiary }}
            >
              Your accountability partners are waiting
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
