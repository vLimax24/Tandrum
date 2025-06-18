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
import { BlurView } from "expo-blur";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { avatarOptions } from "@/utils/avatarImages";
import { AlertModal } from "@/components/AlertModal";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

const { width, height } = Dimensions.get("window");
const avatarSize = (width - 80) / 3 - 12; // 3 columns with better spacing

export default function AvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const headerAnim = React.useRef(new Animated.Value(-50)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnims = React.useRef(
    avatarOptions.map(() => new Animated.Value(0.8))
  ).current;

  const updateUser = useMutation(api.users.completeOnboarding);
  const getUserData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

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

  useEffect(() => {
    // Staggered animations for better UX
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
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
      ]),
      Animated.stagger(
        80,
        scaleAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          })
        )
      ),
    ]).start();
  }, []);

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

  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId);

    // Animate the selected avatar with more refined animation
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: avatarOptions[index].id === avatarId ? 1.08 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    });
  };

  const handleFinish = async () => {
    if (!selectedAvatar || !user) return;

    setIsLoading(true);
    try {
      const currentUserQuery = getUserData;
      const currentUsername =
        currentUserQuery?.name || user.firstName || "User";

      await updateUser({
        clerkId: user.id,
        name: currentUsername,
        profileImage: `avatar_${selectedAvatar}`,
      });

      router.dismissAll();
      router.replace("/(auth)/(tabs)/home");
    } catch (error) {
      showAlert(
        "Error",
        "Failed to save avatar. Please try again.",
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
      console.error("Avatar update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background[0] }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Background Gradient */}
      <View className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          style={{
            transform: [{ translateY: headerAnim }],
          }}
          className="flex-row items-center justify-between px-6 py-4 mb-2"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: theme.colors.cardBackground }}
          >
            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              className="absolute inset-0 rounded-2xl"
            />
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
        </Animated.View>

        {/* Progress Bar with Glass Effect */}
        <View className="px-6 mb-8">
          <View
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.cardBorder }}
          >
            <Animated.View
              className="h-full rounded-full"
              style={{
                backgroundColor: theme.colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
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
          {/* Title Section with Glass Card */}
          <View
            className="mb-8 p-6 rounded-3xl"
            style={{ backgroundColor: theme.colors.cardBackground }}
          >
            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              className="absolute inset-0 rounded-3xl"
            />
            <View className="flex-row items-center gap-3 mb-4">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              >
                <Ionicons
                  name="person-circle"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: theme.colors.text.primary }}
                >
                  Pick Your Avatar
                </Text>
                <Text
                  className="text-base leading-5"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Choose one that represents you in your habit journey
                </Text>
              </View>
            </View>
          </View>

          {/* Selected Avatar Preview */}
          {selectedAvatar && (
            <Animated.View
              className="items-center mb-8"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              }}
            >
              <View
                className="p-1 rounded-3xl mb-4"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <View
                  className="w-20 h-20 overflow-hidden"
                  style={{ borderRadius: 18 }}
                >
                  <Image
                    source={
                      avatarOptions.find((a) => a.id === selectedAvatar)?.source
                    }
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: theme.colors.cardBackground }}
              >
                <BlurView
                  intensity={15}
                  tint={isDarkMode ? "dark" : "light"}
                  className="absolute inset-0 rounded-full"
                />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.colors.text.primary }}
                >
                  {avatarOptions.find((a) => a.id === selectedAvatar)?.name}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Avatar Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
            className="flex-1"
          >
            <View className="flex-row flex-wrap justify-between gap-2">
              {avatarOptions.map((avatar, index) => (
                <Animated.View
                  key={avatar.id}
                  style={{
                    transform: [{ scale: scaleAnims[index] }],
                    width: avatarSize,
                    padding: 4,
                  }}
                  className=""
                >
                  <TouchableOpacity
                    onPress={() => handleAvatarSelect(avatar.id)}
                    className="rounded-3xl overflow-hidden"
                    style={{
                      height: avatarSize - 8,
                      backgroundColor: theme.colors.cardBackground,
                      borderWidth: selectedAvatar === avatar.id ? 2 : 1,
                      borderColor:
                        selectedAvatar === avatar.id
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                    }}
                    activeOpacity={0.8}
                  >
                    <BlurView
                      intensity={10}
                      tint={isDarkMode ? "dark" : "light"}
                      className="absolute inset-0"
                    />

                    <View className="p-2 flex-1">
                      <View className="flex-1 rounded-2xl overflow-hidden">
                        <Image
                          source={avatar.source}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Avatar Name */}
                  <Text
                    className="text-center text-xs mt-2 font-medium"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {avatar.name}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Finish Button with Glassmorphism */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor:
                selectedAvatar && !isLoading
                  ? theme.colors.primary
                  : theme.colors.cardBackground,
              opacity: selectedAvatar && !isLoading ? 1 : 0.6,
            }}
            activeOpacity={0.8}
            onPress={handleFinish}
            disabled={!selectedAvatar || isLoading}
          >
            {(!selectedAvatar || isLoading) && (
              <BlurView
                intensity={20}
                tint={isDarkMode ? "dark" : "light"}
                className="absolute inset-0"
              />
            )}

            <View className="flex-row items-center justify-center py-4 px-6">
              {isLoading ? (
                <View className="flex-row items-center gap-3">
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons
                      name="sync"
                      size={20}
                      color={theme.colors.text.primary}
                    />
                  </Animated.View>
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Setting up your profile...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-3">
                  <Text
                    className="text-lg font-semibold"
                    style={{
                      color: selectedAvatar
                        ? "white"
                        : theme.colors.text.primary,
                    }}
                  >
                    Complete Setup
                  </Text>
                  {selectedAvatar && (
                    <Ionicons
                      name="arrow-forward-circle"
                      size={22}
                      color="white"
                    />
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Motivational Text */}
          <Text
            className="text-center text-sm mt-4 leading-5"
            style={{ color: theme.colors.text.tertiary }}
          >
            Your avatar will represent you in team challenges and habit tracking
          </Text>
        </View>
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
  );
}
