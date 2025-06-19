import { View, Text, Animated, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { getLevelData } from "@/utils/level";
import { Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { images } from "@/utils/images";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";

interface LevelDisplayProps {
  duo: Doc<"duoConnections">;
  showDetailedStats?: boolean;
  compact?: boolean;
}

export const LevelDisplay = ({
  duo,
  showDetailedStats = true,
  compact = false,
}: LevelDisplayProps) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const {
    level,
    xpIntoLevel,
    xpNeeded,
    progressPercent: progress,
    totalXpForCurrentLevel,
    totalXpForNextLevel,
    baseXpReward,
  } = getLevelData(duo.trust_score);

  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation with native driver
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Continuous glow animation with native driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Enhanced pulse for near completion with native driver
    if (progress > 0.9) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.03,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset scale when not near completion
      scaleAnimation.setValue(1);
    }
  }, [progress]);

  const currentStreak = duo.streak || 0;

  const decorationMultiplier = useQuery(api.trees.getXpMultiplier, {
    duoId: duo._id,
  });

  const effectiveBaseXpReward = Math.round(
    baseXpReward * (decorationMultiplier || 1)
  );

  const estimatedCompletionsNeeded = Math.ceil(
    (xpNeeded - xpIntoLevel) / effectiveBaseXpReward
  );

  if (compact) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnimation,
          transform: [{ scale: scaleAnimation }],
        }}
        className="rounded-2xl overflow-hidden mb-6"
      >
        <BlurView
          intensity={isDarkMode ? 20 : 15}
          tint={isDarkMode ? "dark" : "light"}
          style={{ borderRadius: 16 }}
        >
          <View
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
            }}
            className="rounded-2xl p-5"
          >
            {/* Header Row */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1 gap-4">
                <View
                  style={{
                    backgroundColor: `${theme.colors.primary}15`,
                    borderWidth: 1.5,
                    borderColor: `${theme.colors.primary}30`,
                  }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <Text
                    style={{ color: theme.colors.primary }}
                    className="font-bold text-lg font-mainRegular"
                  >
                    {level}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    style={{ color: theme.colors.text.primary }}
                    className="font-bold text-lg font-mainRegular"
                  >
                    Level {level}
                  </Text>
                  <Text
                    style={{ color: theme.colors.text.secondary }}
                    className="text-sm font-mainRegular mt-1"
                  >
                    {Math.round(progress * 100)}% to Level {level + 1}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text
                  style={{ color: theme.colors.text.primary }}
                  className="font-bold text-base font-mainRegular"
                >
                  {xpIntoLevel.toLocaleString()}
                </Text>
                <Text
                  style={{ color: theme.colors.text.tertiary }}
                  className="text-sm font-mainRegular"
                >
                  /{xpNeeded.toLocaleString()} XP
                </Text>
              </View>
            </View>

            {/* Enhanced Progress Bar */}
            <View className="mb-4">
              <View
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(71, 85, 105, 0.3)"
                    : "rgba(241, 245, 249, 0.8)",
                  height: 10,
                }}
                className="rounded-full overflow-hidden"
              >
                <Animated.View
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    height: 10,
                    opacity: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }}
                  className="rounded-full"
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, borderRadius: 5 }}
                  />
                </Animated.View>
              </View>
            </View>

            {/* Bonus Indicators */}
            {(currentStreak > 0 ||
              (decorationMultiplier && decorationMultiplier > 1)) && (
              <View className="flex-row items-center justify-between gap-4">
                {currentStreak > 0 && (
                  <View
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(251, 146, 60, 0.15)"
                        : "rgba(251, 146, 60, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(251, 146, 60, 0.3)",
                    }}
                    className="flex-row items-center px-3 py-2 rounded-xl gap-2"
                  >
                    <Text className="text-orange-500 text-sm font-mainRegular">
                      🔥
                    </Text>
                    <Text
                      style={{ color: isDarkMode ? "#fb923c" : "#ea580c" }}
                      className="text-sm font-semibold font-mainRegular"
                    >
                      {currentStreak} day streak
                    </Text>
                  </View>
                )}
                {decorationMultiplier && decorationMultiplier > 1 && (
                  <View
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(168, 85, 247, 0.15)"
                        : "rgba(168, 85, 247, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(168, 85, 247, 0.3)",
                    }}
                    className="flex-row items-center px-3 py-2 rounded-xl gap-2"
                  >
                    <Text className="text-purple-500 text-sm font-mainRegular">
                      🎄
                    </Text>
                    <Text
                      style={{ color: isDarkMode ? "#a855f7" : "#7c3aed" }}
                      className="text-sm font-semibold font-mainRegular"
                    >
                      {Math.floor(decorationMultiplier)}x XP
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnimation,
        transform: [{ scale: scaleAnimation }],
      }}
      className="rounded-3xl overflow-hidden mb-6"
    >
      <BlurView
        intensity={isDarkMode ? 25 : 20}
        tint={isDarkMode ? "dark" : "light"}
        style={{ borderRadius: 24 }}
      >
        <View
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
          }}
          className="rounded-3xl"
        >
          {/* Header Section */}
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View
                  style={{
                    backgroundColor: `${theme.colors.primary}15`,
                    borderWidth: 2,
                    borderColor: `${theme.colors.primary}30`,
                  }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <Text
                    style={{ color: theme.colors.primary }}
                    className="font-bold text-lg font-mainRegular"
                  >
                    {level}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{ color: theme.colors.text.primary }}
                    className="font-bold text-lg font-mainRegular"
                  >
                    Level {level}
                  </Text>
                  <Text
                    style={{ color: theme.colors.text.secondary }}
                    className="text-sm font-mainRegular mt-1"
                  >
                    Partnership Journey
                  </Text>
                </View>
              </View>
              {progress > 0.9 && (
                <Animated.View
                  style={{
                    opacity: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  }}
                  className="w-10 h-10 rounded-xl items-center justify-center"
                >
                  <Text className="text-2xl font-mainRegular">🚀</Text>
                </Animated.View>
              )}
            </View>
          </View>

          {/* Progress Section */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.cardBorder,
            }}
            className="px-5 py-4"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ color: theme.colors.text.primary }}
                className="font-bold text-lg font-mainRegular"
              >
                Progress to Level {level + 1}
              </Text>
              <View
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.primary}30`,
                }}
                className="px-3 py-1 rounded-lg"
              >
                <Text
                  style={{ color: theme.colors.primary }}
                  className="font-bold text-base font-mainRegular"
                >
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            </View>

            {/* Enhanced Progress Bar */}
            <View
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(71, 85, 105, 0.3)"
                  : "rgba(241, 245, 249, 0.8)",
                height: 12,
              }}
              className="rounded-full overflow-hidden mb-4"
            >
              <Animated.View
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: 12,
                  opacity: glowAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }}
                className="rounded-full"
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 6 }}
                />
              </Animated.View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text
                style={{ color: theme.colors.text.secondary }}
                className="text-sm font-mainRegular"
              >
                {xpIntoLevel.toLocaleString()} XP earned
              </Text>
              <Text
                style={{ color: theme.colors.text.secondary }}
                className="text-sm font-mainRegular"
              >
                {xpNeeded.toLocaleString()} XP needed
              </Text>
            </View>
          </View>

          {/* Detailed Stats Section */}
          {showDetailedStats && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.cardBorder,
              }}
              className="px-5 py-4"
            >
              <Text
                style={{ color: theme.colors.text.primary }}
                className="font-bold text-lg mb-4 font-mainRegular"
              >
                Level Statistics
              </Text>

              <View className="gap-3 mb-4">
                {/* Stats Cards Row */}
                <View className="flex-row justify-between gap-3">
                  {/* Current Level Stats */}
                  <View
                    style={{
                      backgroundColor: theme.colors.glass,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      width: "48%",
                    }}
                    className="rounded-xl p-3"
                  >
                    <View className="flex-row items-center mb-2 gap-2">
                      <Image
                        source={images["leaf"]}
                        style={{ width: 16, height: 16 }}
                      />
                      <Text
                        style={{ color: theme.colors.text.tertiary }}
                        className="text-xs font-semibold uppercase tracking-wider font-mainRegular"
                      >
                        Total XP
                      </Text>
                    </View>
                    <Text
                      style={{ color: theme.colors.text.primary }}
                      className="font-bold text-lg font-mainRegular"
                    >
                      {duo.trust_score?.toLocaleString() || 0}
                    </Text>
                    <Text
                      style={{ color: theme.colors.text.secondary }}
                      className="text-xs mt-1 font-mainRegular"
                    >
                      All time earned
                    </Text>
                  </View>

                  {/* Base Reward */}
                  <View
                    style={{
                      backgroundColor: theme.colors.glass,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                      width: "48%",
                    }}
                    className="rounded-xl p-3"
                  >
                    <View className="flex-row items-center mb-2 gap-2">
                      <Image
                        source={images["orange"]}
                        style={{ width: 16, height: 16 }}
                      />
                      <Text
                        style={{ color: theme.colors.text.tertiary }}
                        className="text-xs font-semibold uppercase tracking-wider font-mainRegular"
                      >
                        Reward
                      </Text>
                    </View>
                    <Text
                      style={{ color: theme.colors.text.primary }}
                      className="font-bold text-lg font-mainRegular"
                    >
                      {effectiveBaseXpReward.toLocaleString()}
                    </Text>
                    <Text
                      style={{ color: theme.colors.text.secondary }}
                      className="text-xs mt-1 font-mainRegular"
                    >
                      XP per completion
                    </Text>
                    {decorationMultiplier && decorationMultiplier > 1 && (
                      <View className="flex-row items-center mt-1 gap-1">
                        <Text className="text-purple-500 text-xs font-mainRegular">
                          🎄
                        </Text>
                        <Text
                          style={{ color: isDarkMode ? "#a855f7" : "#7c3aed" }}
                          className="text-xs font-semibold font-mainRegular"
                        >
                          {Math.floor(decorationMultiplier)}x multiplier
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Tree Decorations Bonus */}
              {decorationMultiplier && decorationMultiplier > 1 && (
                <View
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(168, 85, 247, 0.1)"
                      : "rgba(243, 232, 255, 0.8)",
                    borderWidth: 1,
                    borderColor: "rgba(168, 85, 247, 0.3)",
                  }}
                  className="rounded-xl p-4 mb-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2 gap-2">
                        <Text className="text-purple-500 text-lg font-mainRegular">
                          🎄
                        </Text>
                        <Text
                          style={{ color: isDarkMode ? "#a855f7" : "#7c3aed" }}
                          className="font-bold text-base font-mainRegular"
                        >
                          Tree Decorations
                        </Text>
                      </View>
                      <Text
                        style={{ color: isDarkMode ? "#c4b5fd" : "#8b5cf6" }}
                        className="text-sm font-mainRegular"
                      >
                        XP Multiplier: {Math.floor(decorationMultiplier)}x
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: isDarkMode
                          ? "rgba(168, 85, 247, 0.2)"
                          : "rgba(196, 181, 253, 0.8)",
                        borderWidth: 1,
                        borderColor: "rgba(168, 85, 247, 0.4)",
                      }}
                      className="rounded-lg px-3 py-2"
                    >
                      <Text
                        style={{ color: isDarkMode ? "#a855f7" : "#7c3aed" }}
                        className="font-bold text-base font-mainRegular"
                      >
                        +{Math.round((decorationMultiplier - 1) * 100)}% XP
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Completion Estimate */}
              <View
                style={{
                  backgroundColor: `${theme.colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.primary}30`,
                }}
                className="rounded-xl p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      style={{ color: theme.colors.primary }}
                      className="font-bold text-base mb-1 font-mainRegular"
                    >
                      Completions to Next Level
                    </Text>
                    <Text
                      style={{ color: theme.colors.text.secondary }}
                      className="text-xs font-mainRegular"
                    >
                      Based on current reward rate
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: `${theme.colors.primary}20`,
                      borderWidth: 1.5,
                      borderColor: `${theme.colors.primary}40`,
                    }}
                    className="rounded-xl px-4 py-2"
                  >
                    <Text
                      style={{ color: theme.colors.primary }}
                      className="font-bold text-lg font-mainRegular text-center"
                    >
                      {estimatedCompletionsNeeded}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Achievement Notification */}
          {progress > 0.95 && (
            <View
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(236, 253, 245, 0.9)",
                borderTopWidth: 1,
                borderTopColor: "rgba(34, 197, 94, 0.3)",
              }}
              className="px-5 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Animated.View
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(209, 250, 229, 0.8)",
                    borderWidth: 1,
                    borderColor: "rgba(34, 197, 94, 0.4)",
                    transform: [
                      {
                        scale: glowAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.05],
                        }),
                      },
                    ],
                  }}
                  className="w-10 h-10 rounded-xl items-center justify-center"
                >
                  <Ionicons
                    name="sparkles"
                    size={15}
                    color={theme.colors.primaryLight}
                  />
                </Animated.View>
                <View className="flex-1">
                  <Text
                    style={{ color: isDarkMode ? "#22c55e" : "#15803d" }}
                    className="font-bold text-base font-mainRegular"
                  >
                    Almost there! Level {level + 1} awaits
                  </Text>
                  <Text
                    style={{ color: isDarkMode ? "#4ade80" : "#16a34a" }}
                    className="text-sm font-mainRegular mt-1"
                  >
                    Just {(xpNeeded - xpIntoLevel).toLocaleString()} more XP to
                    go!
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default LevelDisplay;
