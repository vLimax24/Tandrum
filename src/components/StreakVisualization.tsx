import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Doc } from "../../convex/_generated/dataModel";

// Enhanced Streak Display with Enterprise Glass Design
const getStreakColors = (streak) => {
  if (streak >= 30)
    return {
      primary: "#8B5CF6", // Purple for 30+ days
      secondary: "#A78BFA",
      background: "rgba(139, 92, 246, 0.08)",
      border: "rgba(139, 92, 246, 0.2)",
      glow: "#8B5CF6",
    };
  if (streak >= 14)
    return {
      primary: "#F59E0B", // Amber for 14+ days
      secondary: "#FBBF24",
      background: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.2)",
      glow: "#F59E0B",
    };
  if (streak >= 7)
    return {
      primary: "#06B6D4", // Cyan for 7+ days
      secondary: "#22D3EE",
      background: "rgba(6, 182, 212, 0.08)",
      border: "rgba(6, 182, 212, 0.2)",
      glow: "#06B6D4",
    };
  return {
    primary: "#10B981", // Green for < 7 days
    secondary: "#34D399",
    background: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.2)",
    glow: "#10B981",
  };
};

export const StreakVisualization: React.FC<{ duo: Doc<"duoConnections"> }> = ({
  duo,
}) => {
  const streakColors = getStreakColors(duo.streak || 0);
  const { width: screenWidth } = Dimensions.get("window");

  const calculateStreakDisplay = () => {
    const currentDate = new Date();
    const totalStreak = duo.streak || 0;

    const streakDisplay = [];
    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Calculate circle size based on screen width with more spacing
    const circleSize = Math.min((screenWidth - 120) / 7 - 8, 40);

    // Get current week's Monday
    const currentDay = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(
      currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      // Fixed logic: Check if this day is within the streak period
      // Count backwards from today based on current streak count
      const isStreakDay =
        totalStreak > 0 &&
        (() => {
          // Calculate days difference from today (positive = future, negative = past, 0 = today)
          const daysDiff = Math.floor(
            (dayDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // A day is a streak day if it's within the last 'totalStreak' days including today
          // So for streak = 2: today (0) and yesterday (-1) should be marked
          return daysDiff <= 0 && daysDiff > -totalStreak;
        })();

      const isToday = dayDate.toDateString() === currentDate.toDateString();

      streakDisplay.push(
        <View key={i} className="items-center" style={{ marginHorizontal: 4 }}>
          <View
            className={`rounded-full border-2 flex items-center justify-center relative ${
              isStreakDay
                ? "shadow-lg"
                : isToday
                  ? "bg-[#f0fdf4]"
                  : "border-[#e5e7eb] bg-[#f9fafb]"
            }`}
            style={{
              width: circleSize,
              height: circleSize,
              backgroundColor: isStreakDay ? streakColors.primary : undefined,
              borderColor: isStreakDay
                ? streakColors.primary
                : isToday
                  ? `${streakColors.primary}66` // 40% opacity
                  : "#e5e7eb",
              shadowColor: isStreakDay ? streakColors.primary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isStreakDay ? 0.3 : 0,
              shadowRadius: 4,
              elevation: isStreakDay ? 4 : 0,
            }}
          >
            <Text
              className={`text-xs font-bold ${
                isStreakDay
                  ? "text-white"
                  : isToday
                    ? "text-[#10b981]"
                    : "text-[#9ca3af]"
              }`}
              style={{
                color: isStreakDay
                  ? "white"
                  : isToday
                    ? streakColors.primary
                    : "#9ca3af",
              }}
            >
              {daysOfWeek[i]}
            </Text>
            {isToday && (
              <View
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: streakColors.primary }}
              />
            )}
          </View>
          <Text className="text-[#6b7280] text-xs mt-1 font-medium">
            {dayLabels[i]}
          </Text>
        </View>
      );
    }

    return streakDisplay;
  };

  return (
    <View className="mb-6 relative">
      {/* Glass container with backdrop blur effect */}
      <View
        className="rounded-3xl p-1 shadow-2xl"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
          shadowColor: streakColors.glow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Inner gradient border */}
        <LinearGradient
          colors={[streakColors.border, "rgba(255, 255, 255, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 1,
          }}
        >
          {/* Main content container */}
          <View
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: streakColors.background,
            }}
          >
            {/* Animated background orbs */}
            <View className="absolute inset-0">
              <View
                className="absolute rounded-full opacity-20"
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: streakColors.primary,
                  top: -60,
                  right: -60,
                  transform: [{ scale: 0.8 }],
                }}
              />
              <View
                className="absolute rounded-full opacity-10"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: streakColors.secondary,
                  bottom: -40,
                  left: -40,
                }}
              />
            </View>

            {/* Header Section */}
            <View className="flex-row justify-between items-start mb-8 relative z-10">
              <View className="flex-1" style={{ marginRight: 16 }}>
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: streakColors.primary }}
                  />
                  <Text className="text-[#111827] font-bold text-2xl tracking-tight">
                    Current Streak
                  </Text>
                </View>
                <Text
                  className="text-[#6b7280] text-base font-medium"
                  style={{ lineHeight: 20 }}
                >
                  {duo.streak || 0} consecutive days of shared success
                </Text>

                {/* Streak milestone indicator */}
                {(duo.streak || 0) > 0 && (
                  <View className="mt-3 flex-row">
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: streakColors.background,
                        borderWidth: 1,
                        borderColor: streakColors.border,
                        minWidth: 90,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: streakColors.primary }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {(duo.streak || 0) >= 30
                          ? "🏆 LEGEND"
                          : (duo.streak || 0) >= 14
                            ? "🔥 ON FIRE"
                            : (duo.streak || 0) >= 7
                              ? "⚡ UNSTOPPABLE"
                              : "🌱 GROWING"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Main streak counter */}
              <View className="relative">
                {/* Glow effect */}
                <View
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    backgroundColor: streakColors.primary,
                    opacity: 0.15,
                    transform: [{ scale: 1.1 }],
                    shadowColor: streakColors.glow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                />

                {/* Glass counter container */}
                <LinearGradient
                  colors={[
                    `${streakColors.primary}E6`, // 90% opacity
                    `${streakColors.secondary}CC`, // 80% opacity
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 24,
                    padding: 20,
                    minWidth: 80,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <Text className="text-white font-black text-3xl tracking-tight">
                    {duo.streak || 0}
                  </Text>
                  <Text className="text-white text-xs font-semibold opacity-90 mt-1">
                    DAYS
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Progress indicators */}
            <View className="relative z-10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#374151] font-semibold text-sm flex-1">
                  This Week's Journey
                </Text>
                <View className="flex-row items-center ml-2">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: streakColors.primary }}
                  />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: streakColors.primary }}
                  >
                    Active Days
                  </Text>
                </View>
              </View>

              {/* Week progress container with glass effect */}
              <View
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  marginTop: 8,
                }}
              >
                {/* Subtle gradient overlay */}
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.8)",
                    "rgba(255, 255, 255, 0.4)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 16,
                  }}
                />

                <View className="flex-row justify-between items-center relative z-10">
                  {calculateStreakDisplay()}
                </View>
              </View>

              {/* Next milestone indicator */}
              {(duo.streak || 0) < 30 && (
                <View className="mt-4 flex-row items-center justify-center">
                  <View
                    className="flex-row items-center px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Text className="text-[#6b7280] text-xs font-medium mr-2">
                      Next milestone:
                    </Text>
                    <Text
                      className="text-xs font-bold"
                      style={{ color: streakColors.primary }}
                    >
                      {(duo.streak || 0) < 7
                        ? "7 days"
                        : (duo.streak || 0) < 14
                          ? "14 days"
                          : "30 days"}
                    </Text>
                    <Text className="text-[#6b7280] text-xs font-medium ml-1">
                      (
                      {((duo.streak || 0) < 7
                        ? 7
                        : (duo.streak || 0) < 14
                          ? 14
                          : 30) - (duo.streak || 0)}{" "}
                      to go)
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
