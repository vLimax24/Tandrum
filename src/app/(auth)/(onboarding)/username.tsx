// Enhanced Username Screen - Enterprise Level
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function OnboardingUsernameScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const progressAnimation = new Animated.Value(0);

  // Check if username is available using the new function
  const usernameCheck = useQuery(
    api.users.checkUsernameAvailability,
    username.length >= 3
      ? {
          username,
          excludeClerkId: user?.id,
        }
      : "skip"
  );

  useEffect(() => {
    // Animate progress bar on mount
    Animated.timing(progressAnimation, {
      toValue: 0.5,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Pre-fill with user's first name if available
    if (user?.firstName && !username) {
      setUsername(user.firstName);
    }
  }, [user]);

  useEffect(() => {
    // Validate username
    const isValidLength = username.length >= 3 && username.length <= 20;
    const isValidChars = /^[a-zA-Z0-9_-]+$/.test(username);
    const isAvailable = usernameCheck?.available ?? false;

    setIsValid(isValidLength && isValidChars && isAvailable);
  }, [username, usernameCheck]);

  const handleContinue = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Save username to AsyncStorage for later use
      await AsyncStorage.setItem("onboardingUsername", username);
      router.push("/(auth)/(onboarding)/avatar");
    } catch (error) {
      Alert.alert("Fehler", "Username konnte nicht gespeichert werden");
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationMessage = () => {
    if (username.length === 0) return "";
    if (username.length < 3) return "Mindestens 3 Zeichen erforderlich";
    if (username.length > 20) return "Maximal 20 Zeichen erlaubt";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Nur Buchstaben, Zahlen, - und _ erlaubt";
    }
    if (usernameCheck && !usernameCheck.available) {
      return "Dieser Username ist bereits vergeben";
    }
    if (usernameCheck && usernameCheck.available) {
      return "✓ Username verfügbar";
    }
    return "Verfügbarkeit wird geprüft...";
  };

  const validationMessage = getValidationMessage();
  const isError =
    validationMessage &&
    !validationMessage.startsWith("✓") &&
    !validationMessage.includes("geprüft");

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#fafbfc]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
            right: -50,
          }}
        />
      </View>

      {/* Enhanced Progress Indicator - Full Width */}
      <View className="pt-16 pb-6 px-0 relative z-10">
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-semibold text-gray-700">
              Schritt 1 von 2
            </Text>
            <Text className="text-sm font-medium text-gray-500">50%</Text>
          </View>
        </View>

        {/* Full-width progress bars */}
        <View className="flex-row h-1">
          {/* Active progress bar */}
          <Animated.View
            style={{
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "50%"],
              }),
              backgroundColor: "#10B981",
            }}
            className="h-full"
          />
          {/* Remaining progress */}
          <View className="flex-1 h-full bg-gray-200" />
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
              Wähle deinen Username
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Dein Username wird anderen Nutzern angezeigt und kann später nicht
              mehr geändert werden.
            </Text>
          </View>
        </View>

        {/* Input Section */}
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
            <Text className="text-sm font-semibold text-gray-700 mb-4">
              Username
            </Text>

            {/* Clean input design */}
            <View
              className={`rounded-xl p-1 ${
                username.length > 0
                  ? isError
                    ? "bg-red-50"
                    : "bg-green-50"
                  : "bg-gray-50"
              }`}
              style={{
                borderWidth: 2,
                borderColor:
                  username.length > 0
                    ? isError
                      ? "#EF4444"
                      : "#10B981"
                    : "#E5E7EB",
              }}
            >
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="z.B. MaxMustermann"
                className="text-lg text-gray-900 font-medium px-4 py-3"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Validation message */}
            {validationMessage && (
              <View className="mt-3 flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isError ? "bg-red-400" : "bg-green-400"
                  }`}
                />
                <Text
                  className={`text-sm font-medium ${
                    isError ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {validationMessage}
                </Text>
              </View>
            )}

            {/* Character count */}
            <Text className="text-xs text-gray-500 mt-2 text-right">
              {username.length}/20 Zeichen
            </Text>

            {/* Rules section with clean design */}
            <View className="mt-6 bg-[#f9f9f9] p-4 rounded-xl">
              <Text className="font-semibold text-gray-900 mb-3 text-sm">
                📋 Username Regeln:
              </Text>
              {[
                "3-20 Zeichen lang",
                "Nur Buchstaben, Zahlen, - und _",
                "Muss einzigartig sein",
              ].map((rule, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                  <Text className="text-sm text-gray-700 flex-1">{rule}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Suggestions */}
        {user?.firstName && username !== user.firstName && (
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
              <Text className="text-sm font-semibold text-gray-700 mb-4">
                💡 Vorschläge:
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  user.firstName,
                  `${user.firstName}${Math.floor(Math.random() * 100)}`,
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    className="mr-3 mb-3 px-4 py-2 bg-[#f9f9f9] rounded-lg active:scale-95"
                    onPress={() => setUsername(suggestion!)}
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 font-medium">
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Clean bottom actions */}
      <View
        className="p-6 bg-white relative z-10"
        style={{
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          className={`rounded-xl py-4 px-6 active:scale-98 ${
            isValid && !isLoading ? "bg-primary" : "bg-gray-300"
          }`}
          activeOpacity={0.9}
          onPress={handleContinue}
          disabled={!isValid || isLoading}
          style={{
            shadowColor: isValid && !isLoading ? "#10B981" : "#9CA3AF",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text
            className={`font-semibold text-base text-center ${
              isValid && !isLoading ? "text-white" : "text-gray-500"
            }`}
          >
            {isLoading ? "Wird überprüft..." : "Weiter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 py-2"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text className="text-center text-gray-500 font-medium">Zurück</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
