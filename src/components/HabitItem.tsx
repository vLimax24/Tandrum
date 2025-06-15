import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

interface HabitItemProps {
  habit: any;
  isDoneByMe: boolean;
  isDoneByPartner: boolean;
  onCheck: () => void;
  onMenuPress: (event: any, habit: any) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  isDoneByMe,
  isDoneByPartner,
  onCheck,
  onMenuPress,
}) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const getFrequencyBadgeColors = () => {
    if (habit.frequency === "daily") {
      return {
        background: isDarkMode
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(34, 197, 94, 0.1)",
        border: isDarkMode
          ? "rgba(34, 197, 94, 0.3)"
          : "rgba(34, 197, 94, 0.2)",
        text: isDarkMode ? "#4ade80" : "#16a34a",
      };
    }
    return {
      background: isDarkMode
        ? "rgba(168, 85, 247, 0.15)"
        : "rgba(168, 85, 247, 0.1)",
      border: isDarkMode
        ? "rgba(168, 85, 247, 0.3)"
        : "rgba(168, 85, 247, 0.2)",
      text: isDarkMode ? "#c084fc" : "#9333ea",
    };
  };

  const frequencyColors = getFrequencyBadgeColors();
  const bothCompleted = isDoneByMe && isDoneByPartner;

  return (
    <View className="mb-6 rounded-3xl overflow-hidden">
      {/* Glass morphism card */}
      <BlurView
        intensity={isDarkMode ? 40 : 20}
        tint={isDarkMode ? "dark" : "light"}
        className="rounded-3xl overflow-hidden"
      >
        <View
          className="p-6 rounded-3xl"
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
          }}
        >
          {/* Header Section */}
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-1 gap-3">
              <Text
                className="text-xl font-bold leading-tight"
                style={{ color: theme.colors.text.primary }}
              >
                {habit.title}
              </Text>

              {/* Frequency Badge */}
              <View
                className="self-start rounded-full px-4 py-2"
                style={{
                  backgroundColor: frequencyColors.background,
                  borderWidth: 1,
                  borderColor: frequencyColors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: frequencyColors.text }}
                >
                  {habit.frequency}
                </Text>
              </View>
            </View>

            {/* Menu Button */}
            <TouchableOpacity
              className="rounded-2xl p-3 ml-4"
              onPress={(event) => onMenuPress(event, habit)}
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(148, 163, 184, 0.1)"
                  : "rgba(148, 163, 184, 0.08)",
              }}
            >
              <View className="flex-col items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: theme.colors.text.secondary }}
                  />
                ))}
              </View>
            </TouchableOpacity>
          </View>

          {/* Completion Status Section */}
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(15, 23, 42, 0.4)"
                : "rgba(248, 250, 252, 0.8)",
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
            }}
          >
            {/* User Completion Section */}
            <View className="flex-row items-end justify-between mb-6">
              {/* You Section */}
              <View className="flex-1 items-center gap-4">
                {/* You Badge */}
                <View
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(0, 153, 102, 0.2)"
                      : "rgba(0, 153, 102, 0.1)",
                    borderWidth: 1,
                    borderColor: isDarkMode
                      ? "rgba(0, 153, 102, 0.4)"
                      : "rgba(0, 153, 102, 0.2)",
                  }}
                >
                  <Text
                    className="text-xs font-bold tracking-wide"
                    style={{ color: theme.colors.primary }}
                  >
                    YOU
                  </Text>
                </View>

                {/* You Checkbox */}
                <TouchableOpacity
                  className="rounded-full items-center justify-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderWidth: 3,
                    borderColor: isDoneByMe
                      ? theme.colors.primary
                      : theme.colors.cardBorder,
                    backgroundColor: isDoneByMe
                      ? theme.colors.primary
                      : "transparent",
                  }}
                  onPress={isDoneByMe ? undefined : onCheck}
                  disabled={isDoneByMe}
                  activeOpacity={isDoneByMe ? 1 : 0.7}
                >
                  {isDoneByMe ? (
                    <Text className="text-white font-bold text-2xl">✓</Text>
                  ) : (
                    <View
                      className="rounded-full border-2"
                      style={{
                        width: 28,
                        height: 28,
                        borderColor: theme.colors.text.tertiary,
                      }}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Connection Line */}
              <View className="flex-1 items-center pb-8">
                <View
                  className="rounded-full"
                  style={{
                    width: 48,
                    height: 3,
                    backgroundColor: bothCompleted
                      ? theme.colors.primary
                      : theme.colors.cardBorder,
                  }}
                />
              </View>

              {/* Partner Section */}
              <View className="flex-1 items-center gap-4">
                {/* Partner Badge */}
                <View
                  className="rounded-full px-3 py-2"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.1)",
                    borderWidth: 1,
                    borderColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.4)"
                      : "rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <Text
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color: isDarkMode ? "#60a5fa" : "#2563eb",
                    }}
                  >
                    PARTNER
                  </Text>
                </View>

                {/* Partner Checkbox */}
                <View
                  className="rounded-full items-center justify-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderWidth: 3,
                    borderColor: isDoneByPartner
                      ? isDarkMode
                        ? "#60a5fa"
                        : "#2563eb"
                      : theme.colors.cardBorder,
                    backgroundColor: isDoneByPartner
                      ? isDarkMode
                        ? "#60a5fa"
                        : "#2563eb"
                      : "transparent",
                  }}
                >
                  {isDoneByPartner ? (
                    <Text className="text-white font-bold text-2xl">✓</Text>
                  ) : (
                    <View
                      className="rounded-full border-2"
                      style={{
                        width: 28,
                        height: 28,
                        borderColor: theme.colors.text.tertiary,
                      }}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Progress Status */}
            {(isDoneByMe || isDoneByPartner) && (
              <View
                className="pt-6 border-t"
                style={{ borderTopColor: theme.colors.cardBorder }}
              >
                <View className="items-center">
                  <View
                    className="rounded-full px-6 py-3 flex-row items-center gap-2"
                    style={{
                      backgroundColor: bothCompleted
                        ? isDarkMode
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(34, 197, 94, 0.1)"
                        : isDarkMode
                          ? "rgba(251, 191, 36, 0.2)"
                          : "rgba(251, 191, 36, 0.1)",
                      borderWidth: 1,
                      borderColor: bothCompleted
                        ? isDarkMode
                          ? "rgba(34, 197, 94, 0.4)"
                          : "rgba(34, 197, 94, 0.2)"
                        : isDarkMode
                          ? "rgba(251, 191, 36, 0.4)"
                          : "rgba(251, 191, 36, 0.2)",
                    }}
                  >
                    <Text className="text-base">
                      {bothCompleted ? "🎉" : "⏳"}
                    </Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: bothCompleted
                          ? isDarkMode
                            ? "#4ade80"
                            : "#16a34a"
                          : isDarkMode
                            ? "#fbbf24"
                            : "#d97706",
                      }}
                    >
                      {bothCompleted
                        ? "Both completed!"
                        : "Waiting for partner..."}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
};
