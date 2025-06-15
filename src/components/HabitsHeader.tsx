import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface HabitsHeaderProps {
  daily?: any[];
  weekly?: any[];
  duo?: any;
  now?: number;
  timeToday?: number;
  timeWeek?: number;
}

export function HabitsHeader({
  daily = [],
  weekly = [],
  duo,
  now = Date.now(),
  timeToday = 0,
  timeWeek = 0,
}: HabitsHeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = createTheme(isDarkMode);

  // Helper function to calculate today's completed habits
  const getTodayCompletedCount = () => {
    if (!daily.length) return 0;

    // Get today's start and end timestamps
    const today = new Date(now);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1; // End of day

    return daily.filter((habit) => {
      // Check if either user completed the habit today using the timestamp fields
      const userACompletedToday =
        habit.last_checkin_at_userA &&
        habit.last_checkin_at_userA >= todayStart &&
        habit.last_checkin_at_userA <= todayEnd;

      const userBCompletedToday =
        habit.last_checkin_at_userB &&
        habit.last_checkin_at_userB >= todayStart &&
        habit.last_checkin_at_userB <= todayEnd;

      return userACompletedToday || userBCompletedToday;
    }).length;
  };
  return (
    <View className="relative overflow-hidden rounded-b-3xl">
      {/* Main gradient background */}
      <LinearGradient
        colors={
          isDarkMode
            ? ["#0f172a", "#1e293b", "#0f172a"]
            : ["#f8fafc", "#ffffff", "#f1f5f9"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Accent gradient overlay */}
      <LinearGradient
        colors={[
          `${theme.colors.primary}15`,
          `${theme.colors.primaryLight}08`,
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Glassmorphic content container */}
      <BlurView
        intensity={isDarkMode ? 20 : 30}
        tint={isDarkMode ? "dark" : "light"}
        className="px-6 pt-16 pb-8"
        style={{
          backgroundColor: theme.colors.glass,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          {/* Main title section */}
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-2">
              <Text
                className="text-3xl font-bold tracking-tight"
                style={{ color: theme.colors.text.primary }}
              >
                Habits
              </Text>
            </View>

            <Text
              className="text-base font-medium opacity-80"
              style={{ color: theme.colors.text.secondary }}
            >
              Build together, grow together
            </Text>
          </View>

          {/* Action buttons */}
          <View className="flex-row items-center gap-3">
            {/* Theme toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              className="w-12 h-12 rounded-2xl items-center justify-center border"
              style={{
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.cardBorder,
              }}
              activeOpacity={0.7}
            >
              <BlurView
                intensity={20}
                tint={isDarkMode ? "dark" : "light"}
                className="absolute inset-0 rounded-2xl"
              />
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={20}
                color={isDarkMode ? "#fbbf24" : theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress indicator */}
        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-1">
            <View
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: `${theme.colors.text.tertiary}20` }}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full rounded-full"
                style={{
                  width:
                    daily.length > 0
                      ? `${(getTodayCompletedCount() / daily.length) * 100}%`
                      : "0%",
                }}
              />
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              {getTodayCompletedCount()}/{daily.length} today
            </Text>
          </View>
        </View>

        {/* Team motivation badge */}
        <View className="mt-4">
          <View
            className="self-start px-4 py-2 rounded-2xl flex-row items-center gap-2"
            style={{
              backgroundColor: `${theme.colors.primary}15`,
              borderWidth: 1,
              borderColor: `${theme.colors.primary}30`,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-6 h-6 rounded-full border-2 items-center justify-center -mr-2 z-10"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.cardBackground,
                }}
              >
                <Text className="text-white text-xs font-bold">
                  {duo?.user1Name?.charAt(0).toUpperCase() || "A"}
                </Text>
              </View>
              <View
                className="w-6 h-6 rounded-full border-2 items-center justify-center"
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.cardBackground,
                }}
              >
                <Text className="text-white text-xs font-bold">
                  {duo?.user2Name?.charAt(0).toUpperCase() || "B"}
                </Text>
              </View>
            </View>

            <Text
              className="text-sm font-medium ml-2"
              style={{ color: theme.colors.primary }}
            >
              Streak: {duo?.streak || 0} days
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}
