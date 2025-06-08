// src/app/(auth)/(onboarding)/avatar.tsx - Fixed version
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const avatarSize = (width - 80) / 3 - 8; // 3 avatars per row with spacing

// Avatar options - using orange as placeholder for now
const avatarOptions = [
  { id: 1, name: "Avatar 1", source: require("@/assets/orange.png") },
  { id: 2, name: "Avatar 2", source: require("@/assets/orange.png") },
  { id: 3, name: "Avatar 3", source: require("@/assets/orange.png") },
  { id: 4, name: "Avatar 4", source: require("@/assets/orange.png") },
  { id: 5, name: "Avatar 5", source: require("@/assets/orange.png") },
  { id: 6, name: "Avatar 6", source: require("@/assets/orange.png") },
  { id: 7, name: "Avatar 7", source: require("@/assets/orange.png") },
  { id: 8, name: "Avatar 8", source: require("@/assets/orange.png") },
  { id: 9, name: "Avatar 9", source: require("@/assets/orange.png") },
];

export default function OnboardingAvatarScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const progressAnimation = new Animated.Value(0.5);

  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    // Animate progress bar to 100%
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Load username from AsyncStorage
    const loadUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("onboardingUsername");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Error loading username:", error);
      }
    };
    loadUsername();
  }, []);

  const handleFinishOnboarding = async () => {
    if (!selectedAvatar || !username || !user?.id) {
      Alert.alert("Fehler", "Bitte wähle einen Avatar aus");
      return;
    }

    setIsLoading(true);
    try {
      // Complete onboarding using the new backend function
      await completeOnboarding({
        clerkId: user.id,
        name: username,
        profileImage: `avatar_${selectedAvatar}`, // Store avatar reference
      });

      // IMPORTANT: Mark onboarding as completed BEFORE navigation
      await AsyncStorage.setItem("onboardingCompleted", "true");

      // Clean up temporary data
      await AsyncStorage.removeItem("onboardingUsername");

      // Add a small delay to ensure AsyncStorage is written
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to main app using replace to prevent going back
      router.replace("/(auth)/(tabs)/home");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert(
        "Fehler",
        "Profil konnte nicht erstellt werden. Bitte versuche es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#fafbfc]">
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Subtle background */}
      <View className="absolute inset-0">
        <View
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            backgroundColor: "rgba(16, 185, 129, 0.03)",
            top: height * 0.2,
            left: -50,
          }}
        />
      </View>

      {/* Enhanced Progress Indicator - Full Width */}
      <View className="pt-16 pb-6 px-0 relative z-10">
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-semibold text-gray-700">
              Schritt 2 von 2
            </Text>
            <Text className="text-sm font-medium text-gray-500">100%</Text>
          </View>
        </View>

        {/* Full-width progress bars - both filled */}
        <View className="flex-row h-1">
          <Animated.View
            style={{
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: "#10B981",
            }}
            className="h-full"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 relative z-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View className="px-6 mb-6">
          <View
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              Wähle deinen Avatar
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Dein Avatar repräsentiert dich in der App. Du kannst ihn später in
              den Einstellungen ändern.
            </Text>
          </View>
        </View>

        {/* Preview section */}
        {selectedAvatar && (
          <View className="px-6 mb-6">
            <View
              className="bg-primary rounded-2xl p-6 items-center"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View
                className="bg-white rounded-full p-2 mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Image
                  source={avatarOptions[selectedAvatar - 1].source}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                  }}
                />
              </View>
              <Text className="text-xl font-semibold text-white mb-1">
                {username}
              </Text>
              <Text className="text-sm text-white/80">
                So wirst du anderen angezeigt
              </Text>
            </View>
          </View>
        )}

        {/* Avatar selection */}
        <View className="px-6 mb-6">
          <View
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Text className="text-sm font-semibold text-gray-700 mb-6">
              Wähle einen Avatar:
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {avatarOptions.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  className={`mb-4 p-2 rounded-2xl active:scale-95 ${
                    selectedAvatar === avatar.id
                      ? "bg-primary/10"
                      : "bg-gray-50"
                  }`}
                  style={{
                    width: avatarSize + 16,
                    borderWidth: 2,
                    borderColor:
                      selectedAvatar === avatar.id ? "#10B981" : "transparent",
                  }}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={avatar.source}
                    style={{
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                    }}
                  />
                  {selectedAvatar === avatar.id && (
                    <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Info section with clean design */}
        <View className="px-6 mb-8">
          <View className="bg-[#f9f9f9] p-4 rounded-xl">
            <Text className="font-semibold text-gray-900 mb-3 text-sm">
              💡 Gut zu wissen:
            </Text>
            {[
              "Dein Avatar ist nur für andere Nutzer sichtbar",
              "Du kannst ihn jederzeit in den Einstellungen ändern",
              "Alle Avatare sind kostenlos verfügbar",
            ].map((info, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                <Text className="text-sm text-gray-700 flex-1">{info}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View className="p-6 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className={`py-4 px-8 items-center rounded-2xl shadow-lg ${
            selectedAvatar && !isLoading
              ? "bg-primary active:scale-95"
              : "bg-gray-300"
          }`}
          activeOpacity={0.9}
          onPress={handleFinishOnboarding}
          disabled={!selectedAvatar || isLoading}
        >
          <Text
            className={`font-semibold text-lg ${
              selectedAvatar && !isLoading ? "text-white" : "text-gray-500"
            }`}
          >
            {isLoading ? "Profil wird erstellt..." : "Profil erstellen"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-2"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-center text-gray-500">Zurück</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
