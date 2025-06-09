// src/app/(auth)/(onboarding)/avatar.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";

const { width } = Dimensions.get("window");
const avatarSize = (width - 60) / 3 - 10; // 3 columns with spacing

// Avatar options - you can replace these with your actual avatar images
const avatarOptions = [
  { id: 1, source: require("@/assets/orange.png"), name: "Orange" },
  { id: 2, source: require("@/assets/orange.png"), name: "Blue" },
  { id: 3, source: require("@/assets/orange.png"), name: "Green" },
  { id: 4, source: require("@/assets/orange.png"), name: "Purple" },
  { id: 5, source: require("@/assets/orange.png"), name: "Red" },
  { id: 6, source: require("@/assets/orange.png"), name: "Yellow" },
  { id: 7, source: require("@/assets/orange.png"), name: "Pink" },
  { id: 8, source: require("@/assets/orange.png"), name: "Teal" },
  { id: 9, source: require("@/assets/orange.png"), name: "Indigo" },
];

export default function AvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnims = React.useRef(
    avatarOptions.map(() => new Animated.Value(1))
  ).current;

  const updateUser = useMutation(api.users.completeOnboarding);
  const getUserData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
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
  }, []);

  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId);

    // Animate the selected avatar
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: avatarOptions[index].id === avatarId ? 1.1 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    });
  };

  const handleFinish = async () => {
    if (!selectedAvatar || !user) return;

    setIsLoading(true);
    try {
      // Get the current user data to preserve the username
      const currentUserQuery = getUserData;
      const currentUsername =
        currentUserQuery?.name || user.firstName || "User";

      // Update user with selected avatar, preserving the username
      await updateUser({
        clerkId: user.id,
        name: currentUsername, // Use the existing username instead of user.firstName
        profileImage: `avatar_${selectedAvatar}`,
      });

      // Navigate directly - onboarding completion is now handled server-side
      router.dismissAll();
      router.replace("/(auth)/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to save avatar. Please try again.");
      console.error("Avatar update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-sm text-gray-500 font-medium">Step 2 of 2</Text>
      </View>

      {/* Progress Bar */}
      <View className="px-6 mb-8">
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <View className="w-full h-2 bg-primary rounded-full" />
        </View>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1 px-6"
      >
        {/* Title Section */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-3">
            Pick Your Avatar
          </Text>
          <Text className="text-lg text-gray-600 leading-6">
            Choose an avatar that represents you. This will be visible to your
            learning partners.
          </Text>
        </View>

        {/* Selected Avatar Preview */}
        {selectedAvatar && (
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full border-4 border-primary p-1 mb-3">
              <Image
                source={
                  avatarOptions.find((a) => a.id === selectedAvatar)?.source
                }
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              {avatarOptions.find((a) => a.id === selectedAvatar)?.name} Avatar
            </Text>
          </View>
        )}

        {/* Avatar Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-5 pt-10"
        >
          <View className="flex-row flex-wrap justify-between">
            {avatarOptions.map((avatar, index) => (
              <Animated.View
                key={avatar.id}
                style={{
                  transform: [{ scale: scaleAnims[index] }],
                }}
                className="mb-4"
              >
                <TouchableOpacity
                  onPress={() => handleAvatarSelect(avatar.id)}
                  style={[
                    {
                      borderRadius: 16,
                      overflow: "hidden",
                      width: avatarSize,
                      height: avatarSize,
                    },
                    selectedAvatar === avatar.id
                      ? {
                          borderWidth: 2,
                          borderColor: "#57b686",
                        }
                      : {
                          borderWidth: 2,
                          borderColor: "#e5e7eb",
                        },
                  ]}
                  activeOpacity={0.8}
                >
                  <Image
                    source={avatar.source}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {/* Selection Indicator */}
                  {selectedAvatar === avatar.id && (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        backgroundColor: "#57b686",
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Avatar Name */}
                <Text className="text-center text-sm text-gray-600 mt-2">
                  {avatar.name}
                </Text>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        {/* Finish Button */}
        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
              alignItems: "center",
              borderRadius: 16,
              backgroundColor: "#57b686",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
            activeOpacity={0.8}
            onPress={handleFinish}
            disabled={!selectedAvatar || isLoading}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontWeight: "600", fontSize: 18, color: "white" }}>
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Text>
              {!isLoading && selectedAvatar && (
                <View style={{ marginLeft: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
