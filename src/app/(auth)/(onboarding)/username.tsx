// src/app/(auth)/(onboarding)/username.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const updateUser = useMutation(api.users.updateUserInfo);

  // Only query when we have a valid username that's been debounced and meets criteria
  const shouldCheckUsername =
    debouncedUsername.length >= 3 &&
    debouncedUsername.length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(debouncedUsername);

  const existingUser = useQuery(
    api.users.getUserByUsername,
    shouldCheckUsername ? { username: debouncedUsername } : "skip"
  );

  // Debounce username input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 500); // Increased debounce time

    return () => clearTimeout(timer);
  }, [username]);

  // Set checking state when debounced username changes
  useEffect(() => {
    if (shouldCheckUsername && debouncedUsername !== username.trim()) {
      setIsCheckingUsername(true);
    }
  }, [debouncedUsername, username, shouldCheckUsername]);

  // Handle query result
  useEffect(() => {
    if (shouldCheckUsername && existingUser !== undefined) {
      setIsCheckingUsername(false);
    }
  }, [existingUser, shouldCheckUsername]);

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

  // Validate username whenever inputs change
  useEffect(() => {
    validateUsername();
  }, [username, existingUser, debouncedUsername, isCheckingUsername]);

  const validateUsername = useCallback(() => {
    const trimmedUsername = username.trim();
    setErrorMessage("");

    if (trimmedUsername.length === 0) {
      setIsValid(false);
      return;
    }

    if (trimmedUsername.length < 3) {
      setIsValid(false);
      setErrorMessage("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 20) {
      setIsValid(false);
      setErrorMessage("Username must be less than 20 characters");
      return;
    }

    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(trimmedUsername)) {
      setIsValid(false);
      setErrorMessage(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    // If we're still checking or haven't checked yet, don't validate availability
    if (
      isCheckingUsername ||
      (shouldCheckUsername && existingUser === undefined)
    ) {
      setIsValid(false);
      return;
    }

    // Check if username is taken (only if we have query results)
    if (shouldCheckUsername && existingUser && existingUser.id !== user?.id) {
      setIsValid(false);
      setErrorMessage("This username is already taken");
      return;
    }

    setIsValid(true);
  }, [
    username,
    existingUser,
    debouncedUsername,
    isCheckingUsername,
    shouldCheckUsername,
    user?.id,
  ]);

  const handleContinue = async () => {
    if (!isValid || !user || isLoading) return;

    setIsLoading(true);
    try {
      // Only update the username/name, don't complete onboarding yet
      await updateUser({
        clerkId: user.id,
        name: username.trim(),
        profileImage: user.imageUrl || "",
      });

      router.push("/(auth)/(onboarding)/avatar");
    } catch (error) {
      Alert.alert("Error", "Failed to update username. Please try again.");
      console.error("Username update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = useCallback(() => {
    const baseNames = ["learner", "student", "explorer", "scholar", "genius"];
    const suggestions = baseNames.map(
      (base) => `${base}${Math.floor(Math.random() * 1000) + 1}`
    );
    return suggestions.slice(0, 3); // Return only 3 suggestions
  }, []);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setUsername(suggestion);
    // Reset states when suggestion is selected
    setIsCheckingUsername(false);
    setErrorMessage("");
  }, []);

  const handleBackPress = useCallback(() => {
    router.replace("/(auth)/(onboarding)/");
  }, [router]);

  const suggestions = generateSuggestions();

  const getInputStatus = () => {
    if (username.trim().length === 0) return "default";
    if (isCheckingUsername) return "checking";
    if (isValid) return "valid";
    return "invalid";
  };

  const getStatusIcon = () => {
    const status = getInputStatus();
    switch (status) {
      case "checking":
        return "time-outline";
      case "valid":
        return "checkmark-circle";
      case "invalid":
        return "close-circle";
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    const status = getInputStatus();
    switch (status) {
      case "checking":
        return "#f59e0b";
      case "valid":
        return "#10b981";
      case "invalid":
        return "#ef4444";
      default:
        return "#d1d5db";
    }
  };

  const getBorderColor = () => {
    const status = getInputStatus();
    switch (status) {
      case "checking":
        return "border-yellow-400";
      case "valid":
        return "border-green-400";
      case "invalid":
        return "border-red-400";
      default:
        return "border-gray-200";
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={handleBackPress}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 font-medium font-mainRegular">
            Step 1 of 2
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="px-6 mb-8">
          <View className="w-full h-2 bg-gray-200 rounded-full">
            <View className="w-1/2 h-2 bg-primary rounded-full" />
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
            <Text className="text-3xl font-bold text-gray-900 mb-3 font-mainRegular">
              Choose Your Username
            </Text>
            <Text className="text-lg text-gray-600 leading-6 font-mainRegular">
              This is how other learners will know you. Don't worry, you can
              change it later.
            </Text>
          </View>

          {/* Input Section */}
          <View className="mb-6">
            <View className="relative">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                className={`w-full p-4 text-lg border-2 rounded-2xl font-mainRegular bg-white ${getBorderColor()}`}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              {username.trim().length > 0 && (
                <View className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Ionicons
                    name={getStatusIcon()}
                    size={24}
                    color={getStatusColor()}
                  />
                </View>
              )}
            </View>

            {/* Status Messages */}
            {isCheckingUsername ? (
              <Text className="text-yellow-600 text-sm mt-2 ml-1 font-mainRegular">
                Checking availability...
              </Text>
            ) : errorMessage ? (
              <Text className="text-red-500 text-sm mt-2 ml-1 font-mainRegular">
                {errorMessage}
              </Text>
            ) : username.trim().length >= 3 && isValid ? (
              <Text className="text-green-600 text-sm mt-2 ml-1 font-mainRegular">
                Great! This username is available
              </Text>
            ) : null}

            {/* Character Count */}
            <Text className="text-gray-400 text-sm mt-2 ml-1 font-mainRegular">
              {username.length}/20 characters
            </Text>
          </View>

          {/* Suggestions */}
          {username.trim().length === 0 && (
            <View className="mb-8">
              <Text className="text-gray-700 font-medium mb-3 font-mainRegular">
                Need inspiration? Try these:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`${suggestion}-${index}`}
                    onPress={() => handleSuggestionPress(suggestion)}
                    className="bg-gray-100 px-4 py-2 rounded-full border border-gray-200"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-mainRegular">
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="flex-1 justify-end pb-6">
            <TouchableOpacity
              style={[
                {
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: "center",
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                },
                isValid && !isLoading && !isCheckingUsername
                  ? { backgroundColor: "#57b686" }
                  : { backgroundColor: "#e5e7eb" },
              ]}
              activeOpacity={0.8}
              onPress={handleContinue}
              disabled={!isValid || isLoading || isCheckingUsername}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[
                    { fontWeight: "600", fontSize: 18 },
                    isValid && !isLoading && !isCheckingUsername
                      ? { color: "white" }
                      : { color: "#9ca3af" },
                  ]}
                  className="font-mainRegular"
                >
                  {isLoading
                    ? "Saving..."
                    : isCheckingUsername
                      ? "Checking..."
                      : "Continue"}
                </Text>
                {!isLoading && !isCheckingUsername && (
                  <View style={{ marginLeft: 8 }}>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={isValid ? "white" : "#9ca3af"}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
