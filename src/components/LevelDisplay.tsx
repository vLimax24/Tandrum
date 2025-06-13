import { View, Text, Animated, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { getLevelData } from "@/utils/level";
import { Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { treeImages } from "@/utils/treeImages";

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
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar with spring effect
    Animated.spring(progressAnimation, {
      toValue: progress,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for near completion
    if (progress > 0.95) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
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
    xpNeeded / effectiveBaseXpReward
  );

  if (compact) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnimation,
        }}
        className="rounded-xl overflow-hidden mb-4 border border-gray-200"
      >
        <View
          style={{
            backgroundColor: "rgba(248, 250, 252, 0.9)",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  width: 32,
                  height: 32,
                }}
                className="rounded-xl items-center justify-center mr-3"
              >
                <Text className="text-blue-700 font-bold text-sm font-mainRegular">
                  {level}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-sm font-mainRegular">
                  Level {level}
                </Text>
                <Text className="text-gray-600 text-xs font-mainRegular">
                  {Math.round(progress * 100)}% to Level {level + 1}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-gray-900 font-medium text-xs font-mainRegular">
                {xpIntoLevel.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-xs font-mainRegular">
                /{xpNeeded.toLocaleString()} XP
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              backgroundColor: "#F1F5F9",
              height: 8,
            }}
            className="rounded-full overflow-hidden"
          >
            <Animated.View
              style={{
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
              className="h-full rounded-full"
            >
              <LinearGradient
                colors={["#3B82F6", "#9333EA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, borderRadius: 4 }}
              />
            </Animated.View>
          </View>

          {/* Bonus indicators */}
          {(currentStreak > 0 ||
            (decorationMultiplier && decorationMultiplier > 1)) && (
            <View className="flex-row items-center justify-between mt-2">
              {currentStreak > 0 && (
                <View className="flex-row items-center">
                  <Text className="text-orange-600 text-xs font-medium font-mainRegular">
                    🔥 {currentStreak} day streak
                  </Text>
                </View>
              )}
              {decorationMultiplier && decorationMultiplier > 1 && (
                <View className="flex-row items-center">
                  <Text className="text-purple-600 text-xs font-medium font-mainRegular">
                    🎄 {decorationMultiplier}x XP
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnimation,
        transform: [{ scale: scaleAnimation }],
      }}
      className="rounded-3xl shadow-2xl overflow-hidden"
    >
      <BlurView intensity={30} tint="light">
        {/* Header Section with Glassmorphism */}
        <View
          style={{
            backgroundColor: "#F0F9FF",
            borderBottomWidth: 1,
            borderBottomColor: "#E0F2FE",
          }}
          className="px-6 py-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                }}
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              >
                <Text className="text-blue-700 font-bold text-xl font-mainRegular">
                  {level}
                </Text>
              </View>
              <View>
                <Text className="text-gray-900 font-bold text-xl font-mainRegular">
                  Level {level}
                </Text>
                <Text className="text-gray-700 text-base font-mainRegular">
                  Partnership Progress
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="px-6 py-6 bg-[#ffffff]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 font-semibold text-lg font-mainRegular">
              Progress to Level {level + 1}
            </Text>
            <Text className="text-gray-700 text-base font-medium font-mainRegular">
              {Math.round(progress * 100)}%
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#F1F5F9",
            }}
            className="h-4 rounded-full overflow-hidden mb-4"
          >
            <Animated.View
              style={{
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
              className="h-full rounded-full shadow-sm"
            >
              <LinearGradient
                colors={["#3B82F6", "#9333EA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, borderRadius: 8 }}
              />
            </Animated.View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 text-base font-mainRegular">
              {xpIntoLevel.toLocaleString()} XP earned
            </Text>
            <Text className="text-gray-700 text-base font-mainRegular">
              {xpNeeded.toLocaleString()} XP needed
            </Text>
          </View>
        </View>

        {/* Detailed Stats Section */}
        {showDetailedStats && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              backgroundColor: "#F0F9FF",
            }}
            className="px-6 py-6"
          >
            <Text className="text-gray-900 font-semibold text-lg mb-5 font-mainRegular">
              Level Statistics
            </Text>

            <View className="flex-row justify-between mb-5">
              {/* Current Level Stats */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  width: "48%",
                }}
                className="rounded-2xl p-4"
              >
                <View className="flex-row items-center mb-3">
                  <Image
                    source={treeImages["leaf"]}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  <Text className="text-gray-700 text-xs font-medium uppercase tracking-wide font-mainRegular">
                    Current XP
                  </Text>
                </View>
                <Text className="text-gray-900 font-bold text-xl font-mainRegular">
                  {duo.trust_score?.toLocaleString() || 0}
                </Text>
                <Text className="text-gray-600 text-sm mt-1 font-mainRegular">
                  Total earned
                </Text>
              </View>

              {/* Base Reward */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  width: "48%",
                }}
                className="rounded-2xl p-4"
              >
                <View className="flex-row items-center mb-3">
                  <Image
                    source={treeImages["orange"]}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  <Text className="text-gray-700 text-xs font-medium uppercase tracking-wide font-mainRegular">
                    Base Reward
                  </Text>
                </View>
                <Text className="text-gray-900 font-bold text-xl font-mainRegular">
                  {effectiveBaseXpReward.toLocaleString()}
                </Text>
                <Text className="text-gray-600 text-sm mt-1 font-mainRegular">
                  XP per completion
                </Text>
                {decorationMultiplier && decorationMultiplier > 1 && (
                  <Text className="text-purple-600 text-xs mt-1 font-medium font-mainRegular">
                    🎄 {decorationMultiplier}x multiplier
                  </Text>
                )}
              </View>
            </View>

            {decorationMultiplier && decorationMultiplier > 1 && (
              <View
                style={{
                  backgroundColor: "#F3E8FF",
                  borderWidth: 1,
                  borderColor: "#E9D5FF",
                }}
                className="rounded-2xl p-4 mb-5"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Text className="text-purple-800 font-semibold text-lg font-mainRegular">
                        🎄 Tree Decorations
                      </Text>
                    </View>
                    <Text className="text-purple-700 text-base font-mainRegular">
                      XP Multiplier: {decorationMultiplier}x
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#DDD6FE",
                      borderWidth: 1,
                      borderColor: "#C4B5FD",
                    }}
                    className="rounded-xl px-4 py-2"
                  >
                    <Text className="text-purple-800 font-bold text-base font-mainRegular">
                      +{Math.round((decorationMultiplier - 1) * 100)}% XP
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Completion Estimate */}
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderWidth: 1,
                borderColor: "#DBEAFE",
              }}
              className="rounded-2xl p-4"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-blue-900 font-semibold text-base mb-2 max-w-[78%] font-mainRegular">
                    Estimated Completions to Next Level
                  </Text>
                  <Text className="text-blue-700 text-sm font-mainRegular">
                    Based on current reward rate
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#DBEAFE",
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                  }}
                  className="rounded-xl px-5 py-3"
                >
                  <Text className="text-blue-900 font-bold text-xl font-mainRegular">
                    {estimatedCompletionsNeeded}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Achievement Notification */}
        {progress > 0.9 && (
          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderTopWidth: 1,
              borderTopColor: "#D1FAE5",
            }}
            className="px-6 py-4"
          >
            <View className="flex-row items-center">
              <View
                style={{
                  backgroundColor: "#D1FAE5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                }}
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              >
                <Text className="text-green-700 text-xl font-mainRegular">
                  🎉
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-green-900 font-semibold text-base font-mainRegular">
                  Almost there! Level {level + 1} is within reach
                </Text>
                <Text className="text-green-700 text-sm font-mainRegular">
                  Just {(xpNeeded - xpIntoLevel).toLocaleString()} more XP to
                  go!
                </Text>
              </View>
            </View>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

export default LevelDisplay;
