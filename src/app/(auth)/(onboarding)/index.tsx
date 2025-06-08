// src/app/(auth)/(onboarding)/index.tsx
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  index: number;
}

export default function OnboardingWelcome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.8)).current;
  const featureAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate features in sequence
      featureAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 150,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  const handleGetStarted = () => {
    router.push("/(auth)/(onboarding)/username");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" translucent />

      {/* Subtle Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            backgroundColor: "rgba(87, 182, 134, 0.04)",
            top: -150,
            right: -150,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            backgroundColor: "rgba(139, 92, 246, 0.03)",
            bottom: -100,
            left: -100,
          }}
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header Section */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: heroScaleAnim }],
            }}
            className="items-center mb-12 mt-8"
          >
            {/* Hero Icon with sophisticated styling */}
            <View className="items-center mb-8">
              <View
                className="relative items-center justify-center mb-6"
                style={{
                  width: 120,
                  height: 120,
                }}
              >
                {/* Outer glow ring */}
                <View
                  className="absolute rounded-full"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "rgba(87, 182, 134, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(87, 182, 134, 0.2)",
                  }}
                />
                {/* Inner gradient circle */}
                <LinearGradient
                  colors={["#57b686", "#4ade80"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#57b686",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="rocket" size={36} color="white" />
                </LinearGradient>
              </View>

              {/* Title and Subtitle */}
              <View className="items-center">
                <Text className="text-4xl font-bold text-gray-900 text-center mb-4 leading-tight">
                  Welcome to Your{"\n"}Learning Journey
                </Text>
                <Text className="text-lg text-gray-600 text-center leading-7 max-w-sm">
                  Let's personalize your experience and connect you with a
                  community of learners just like you.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Section */}
          <View className="flex-1 justify-end pb-6">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: "#57b686",
                  shadowColor: "#57b686",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                activeOpacity={0.8}
                onPress={handleGetStarted}
              >
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold text-lg mr-2">
                    Get Started
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              </TouchableOpacity>

              {/* Skip option */}
              <TouchableOpacity
                className="items-center mt-4 py-2"
                activeOpacity={0.7}
                onPress={() => router.replace("/(auth)/(tabs)/home")}
              >
                <Text className="text-gray-500 text-base">Skip for now</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
