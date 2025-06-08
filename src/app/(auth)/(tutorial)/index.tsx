import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const { width } = Dimensions.get("window");

interface TutorialPage {
  id: number;
  title: string;
  description: string;
  image: any; // You'll need to replace with your actual image sources
}

const tutorialPages: TutorialPage[] = [
  {
    id: 1,
    title: "Welcome to Your Learning Journey",
    description:
      "Discover a new way to learn and grow with personalized lessons tailored just for you.",
    image: require("../../../assets/tree-1.png"), // Replace with your tutorial image
  },
  {
    id: 2,
    title: "Track Your Progress",
    description:
      "Monitor your achievements and see how far you've come with detailed progress tracking.",
    image: require("../../../assets/tree-1.png"), // Replace with your tutorial image
  },
  {
    id: 3,
    title: "Learn with Friends",
    description:
      "Connect with others, share your progress, and learn together in a supportive community.",
    image: require("../../../assets/tree-1.png"), // Replace with your tutorial image
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

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  // Store convex user when available
  React.useEffect(() => {
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

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
    } else {
      // Show auth screen after last tutorial page
      setShowAuth(true);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("isFirstTime", "false");
      await AsyncStorage.setItem("tutorialCompleted", "true");
      router.replace("/(public)");
    } catch (error) {
      console.error("Error saving tutorial completion:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Set flags BEFORE starting SSO to prevent flash
      await AsyncStorage.setItem("isFirstTime", "false");
      await AsyncStorage.setItem("tutorialCompleted", "true");

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        // Don't navigate here - let _layout handle it based on onboarding status
      }
    } catch (error) {
      // If login fails, reset the flags
      await AsyncStorage.removeItem("isFirstTime");
      await AsyncStorage.removeItem("tutorialCompleted");
      console.error("Login error:", error);
      Alert.alert("Login failed", error.message);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollPosition / width);
    setCurrentPage(page);
  };

  const renderDots = () => {
    return (
      <View className="flex-row justify-center items-center gap-1 mb-8">
        {tutorialPages.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentPage ? "bg-primary" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    );
  };

  if (showAuth) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center mb-12">
            <Image
              source={require("@/assets/tree-1.png")}
              style={{ width: 300, height: 300, resizeMode: "contain" }}
            />
            <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
              Ready to Start?
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Sign in with Google to begin your learning journey
            </Text>
          </View>

          <TouchableOpacity
            className="bg-primary py-4 px-8 w-full max-w-sm items-center rounded-2xl mb-4"
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
          >
            <Text className="text-white font-semibold text-lg">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 px-6"
            activeOpacity={0.8}
            onPress={handleSkip}
          >
            <Text className="text-gray-500">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Skip button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
          <Text className="text-gray-500 text-base">Skip</Text>
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
        {tutorialPages.map((page) => (
          <View
            key={page.id}
            style={{ width }}
            className="flex-1 justify-center items-center px-8"
          >
            <Image
              source={page.image}
              style={{ width: 300, height: 300, resizeMode: "contain" }}
              className="mb-8"
            />
            <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
              {page.title}
            </Text>
            <Text className="text-lg text-gray-600 text-center leading-6">
              {page.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section with dots and next button */}
      <View className="pb-12 px-8">
        {renderDots()}

        <TouchableOpacity
          className="bg-primary py-4 px-8 items-center rounded-2xl"
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <Text className="text-white font-semibold text-lg">
            {currentPage === tutorialPages.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
