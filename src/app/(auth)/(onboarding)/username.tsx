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
import { AlertModal } from "@/components/AlertModal";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { BlurView } from "expo-blur";

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

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

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
    icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
    iconColor?: string
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
      showAlert(
        "Error",
        "Failed to update username. Please try again.",
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
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
        return theme.colors.primary;
      case "invalid":
        return "#ef4444";
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getInputBorderColor = () => {
    const status = getInputStatus();
    switch (status) {
      case "checking":
        return "rgba(245, 158, 11, 0.4)";
      case "valid":
        return "rgba(0, 153, 102, 0.4)";
      case "invalid":
        return "rgba(239, 68, 68, 0.4)";
      default:
        return theme.colors.cardBorder;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background[0] }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />

        {/* Background Gradient Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
          }}
          className="absolute top-0 left-0 right-0 h-1/2"
        />

        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 mb-2">
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
                borderWidth: 1,
              }}
              className="w-12 h-12 items-center justify-center rounded-2xl"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>

            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: theme.colors.glass,
              }}
            >
              <Text
                style={{ color: theme.colors.text.secondary }}
                className="text-sm font-medium font-mainRegular"
              >
                Step 1 of 2
              </Text>
            </BlurView>
          </View>

          {/* Progress Bar */}
          <View className="px-6 mb-8">
            <View
              style={{ backgroundColor: theme.colors.cardBorder }}
              className="w-full h-2 rounded-full overflow-hidden"
            >
              <View
                style={{ backgroundColor: theme.colors.primary }}
                className="w-1/2 h-2 rounded-full"
              />
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
            <View className="mb-10">
              <View className="flex-row items-center gap-3 mb-4">
                <View
                  style={{ backgroundColor: theme.colors.primary }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ color: theme.colors.text.primary }}
                    className="text-2xl font-bold font-mainRegular"
                  >
                    Choose Your Username
                  </Text>
                </View>
              </View>
            </View>

            {/* Input Card */}
            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: getInputBorderColor(),
                borderWidth: 1,
                borderRadius: 24,
                marginBottom: 24,
                overflow: "hidden",
              }}
            >
              <View className="p-6">
                <View className="relative">
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor={theme.colors.text.tertiary}
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: 18,
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      paddingRight: username.trim().length > 0 ? 60 : 20,
                      borderRadius: 16,
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "rgba(255, 255, 255, 0.5)",
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                    }}
                    className="font-mainRegular"
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
                <View className="mt-4 min-h-6">
                  {isCheckingUsername ? (
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="refresh" size={16} color="#f59e0b" />
                      <Text
                        style={{ color: "#f59e0b" }}
                        className="text-sm font-mainRegular"
                      >
                        Checking availability...
                      </Text>
                    </View>
                  ) : errorMessage ? (
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="alert-circle" size={16} color="#ef4444" />
                      <Text
                        style={{ color: "#ef4444" }}
                        className="text-sm font-mainRegular"
                      >
                        {errorMessage}
                      </Text>
                    </View>
                  ) : username.trim().length >= 3 && isValid ? (
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={{ color: theme.colors.primary }}
                        className="text-sm font-mainRegular"
                      >
                        Perfect! This username is available
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Character Count */}
                <View className="flex-row justify-between items-center mt-2">
                  <Text
                    style={{ color: theme.colors.text.tertiary }}
                    className="text-sm font-mainRegular"
                  >
                    {username.length}/20 characters
                  </Text>
                  {username.length >= 18 && (
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="warning" size={14} color="#f59e0b" />
                      <Text
                        style={{ color: "#f59e0b" }}
                        className="text-xs font-mainRegular"
                      >
                        Almost at limit
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </BlurView>

            {/* Suggestions */}
            {username.trim().length === 0 && (
              <BlurView
                intensity={15}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                  borderWidth: 1,
                  borderRadius: 20,
                  marginBottom: 32,
                  overflow: "hidden",
                }}
              >
                <View className="p-6">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Ionicons
                      name="bulb"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{ color: theme.colors.text.primary }}
                      className="font-semibold font-mainRegular"
                    >
                      Need inspiration?
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-3">
                    {suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={`${suggestion}-${index}`}
                        onPress={() => handleSuggestionPress(suggestion)}
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(0, 153, 102, 0.1)"
                            : "rgba(0, 153, 102, 0.05)",
                          borderColor: theme.colors.primary + "40",
                          borderWidth: 1,
                        }}
                        className="px-4 py-3 rounded-full"
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{ color: theme.colors.primary }}
                          className="font-medium font-mainRegular"
                        >
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </BlurView>
            )}

            <View className="flex-1 justify-end pb-6">
              <TouchableOpacity
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  alignItems: "center",
                  borderRadius: 20,
                  backgroundColor:
                    isValid && !isLoading && !isCheckingUsername
                      ? theme.colors.primary
                      : theme.colors.cardBorder,
                  ...(isValid &&
                    !isLoading &&
                    !isCheckingUsername && {
                      borderWidth: 1,
                      borderColor: theme.colors.primary + "40",
                    }),
                }}
                activeOpacity={0.8}
                onPress={handleContinue}
                disabled={!isValid || isLoading || isCheckingUsername}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 18,
                      color:
                        isValid && !isLoading && !isCheckingUsername
                          ? "white"
                          : theme.colors.text.tertiary,
                    }}
                    className="font-mainRegular"
                  >
                    {isLoading
                      ? "Saving..."
                      : isCheckingUsername
                        ? "Checking..."
                        : "Continue Your Journey"}
                  </Text>
                  {!isLoading && !isCheckingUsername && (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={isValid ? "white" : theme.colors.text.tertiary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
      </View>
    </TouchableWithoutFeedback>
  );
}
