import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

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
    title: "Welcome to Your Learning Journey",
    description:
      "Discover a new way to learn and grow with personalized lessons tailored just for you. Start your transformation today.",
    image: require("../../../assets/tree-1.png"),
    iconName: "rocket",
    gradientColors: ["#57b686", "#4ade80"] as const,
  },
  {
    id: 2,
    title: "Track Your Progress",
    description:
      "Monitor your achievements and see how far you've come with detailed progress tracking and meaningful insights.",
    image: require("../../../assets/tree-1.png"),
    iconName: "trending-up",
    gradientColors: ["#8b5cf6", "#a855f7"] as const,
  },
  {
    id: 3,
    title: "Learn with Friends",
    description:
      "Connect with others, share your progress, and learn together in a supportive community of like-minded learners.",
    image: require("../../../assets/tree-1.png"),
    iconName: "people",
    gradientColors: ["#06b6d4", "#0891b2"] as const,
  },
];

export default function TutorialScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const clerkId = user?.id;

  // Animation refs
  const dotAnimations = useRef(
    tutorialPages.map(() => new Animated.Value(0))
  ).current;
  const fadeAnims = useRef(
    tutorialPages.map(() => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    tutorialPages.map(() => new Animated.Value(50))
  ).current;
  const scaleAnims = useRef(
    tutorialPages.map(() => new Animated.Value(0.9))
  ).current;
  const authFadeAnim = useRef(new Animated.Value(0)).current;
  const authSlideAnim = useRef(new Animated.Value(50)).current;

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

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

    // Animate first dot
    animateDot(0);
  }, []);

  // Store convex user when available
  useEffect(() => {
    const storeConvexUser = async () => {
      if (convexUser) {
        try {
          await AsyncStorage.setItem("convexUser", JSON.stringify(convexUser));
        } catch (e) {
          console.error("Failed to save Convex user to AsyncStorage", e);
        }
      }
    };
    storeConvexUser();
  }, [convexUser]);

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

  const animateDot = (index: number) => {
    // Reset all dots
    dotAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

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

    animateDot(pageIndex);
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
    const targetPage = tutorialPages.length - 1; // Go to last page (index 2)
    setCurrentPage(targetPage);
    scrollViewRef.current?.scrollTo({
      x: targetPage * width,
      animated: true,
    });
    animatePageTransition(targetPage);
  };

  const handleGoogleLogin = async () => {
    try {
      // Set flags immediately to trigger loading screen
      await AsyncStorage.setItem("isFirstTime", "false");
      await AsyncStorage.setItem("tutorialCompleted", "true");

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (error) {
      // Reset flags on error
      await AsyncStorage.removeItem("isFirstTime");
      await AsyncStorage.removeItem("tutorialCompleted");
      console.error("Login error:", error);
      Alert.alert("Login failed", error.message);
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

  const renderAnimatedDots = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {tutorialPages.map((_, index) => (
          <View key={index} className="mx-1">
            <View className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
              <Animated.View
                style={{
                  width: dotAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  height: "100%",
                  backgroundColor: "#57b686",
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (showAuth) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Background Elements */}
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
              width: 250,
              height: 250,
              backgroundColor: "rgba(139, 92, 246, 0.03)",
              bottom: -125,
              left: -125,
            }}
          />
        </View>

        <Animated.View
          style={{
            flex: 1,
            opacity: authFadeAnim,
            transform: [{ translateY: authSlideAnim }],
          }}
          className="justify-center items-center px-6"
        >
          <View className="items-center mb-12">
            {/* Hero Icon */}
            <View className="items-center mb-8">
              <View
                className="relative items-center justify-center mb-6"
                style={{ width: 120, height: 120 }}
              >
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
                  <Ionicons name="checkmark-circle" size={36} color="white" />
                </LinearGradient>
              </View>
            </View>

            <Text className="text-4xl font-bold text-gray-900 text-center mb-4 leading-tight">
              Ready to Start Your{"\n"}Journey?
            </Text>
            <Text className="text-lg text-gray-600 text-center leading-7 max-w-sm">
              Sign in with Google to unlock your personalized learning
              experience and join our community.
            </Text>
          </View>

          <View className="w-full max-w-sm">
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
                marginBottom: 16,
              }}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
            >
              <View className="flex-row items-center">
                <Ionicons name="logo-google" size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-3">
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-3"
              activeOpacity={0.7}
              onPress={handleSkip}
            >
              <Text className="text-gray-500 text-base">Skip for now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            backgroundColor: "rgba(87, 182, 134, 0.03)",
            top: -200,
            right: -200,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            backgroundColor: "rgba(139, 92, 246, 0.02)",
            bottom: -150,
            left: -150,
          }}
        />
      </View>

      {/* Skip button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity
          onPress={handleSkip}
          className="py-2 px-4 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text className="text-gray-600 text-base font-medium">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Tutorial pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {tutorialPages.map((page, index) => (
          <View
            key={page.id}
            style={{ width }}
            className="flex-1 justify-center items-center px-8"
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
              {/* Hero Icon Section */}
              <View className="items-center mb-8">
                <View
                  className="relative items-center justify-center mb-6"
                  style={{ width: 140, height: 140 }}
                >
                  {/* Outer glow ring */}
                  <View
                    className="absolute rounded-full"
                    style={{
                      width: 140,
                      height: 140,
                      backgroundColor: `${page.gradientColors[0]}15`,
                      borderWidth: 1,
                      borderColor: `${page.gradientColors[0]}25`,
                    }}
                  />
                  {/* Inner gradient circle */}
                  <LinearGradient
                    colors={page.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: page.gradientColors[0],
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name={page.iconName} size={40} color="white" />
                  </LinearGradient>
                </View>

                {/* Decorative Image */}
                <View className="mb-6">
                  <Image
                    source={page.image}
                    style={{
                      width: 200,
                      height: 200,
                      resizeMode: "contain",
                      opacity: 0.8,
                    }}
                  />
                </View>
              </View>

              {/* Content */}
              <View className="items-center max-w-sm">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-4 leading-tight">
                  {page.title}
                </Text>
                <Text className="text-lg text-gray-600 text-center leading-7">
                  {page.description}
                </Text>
              </View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section with animated dots and next button */}
      <View className="pb-8 px-8">
        {renderAnimatedDots()}

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
          onPress={handleNext}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-lg mr-2">
              {currentPage === tutorialPages.length - 1
                ? "Get Started"
                : "Continue"}
            </Text>
            <Ionicons
              name={
                currentPage === tutorialPages.length - 1
                  ? "rocket"
                  : "arrow-forward"
              }
              size={20}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
