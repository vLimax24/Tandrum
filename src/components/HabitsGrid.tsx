import React, { useState } from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { HabitItem } from "./HabitItem";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";

interface HabitsGridProps {
  habits: any[];
  duo: any;
  amI_A: boolean;
  now: number;
  checkInHabit: (
    habitId: string,
    userIsA: boolean
  ) => Promise<
    { checkedIn: boolean; rewards: any; bothCompleted: boolean } | undefined
  >;
  deleteHabit: any;
  isSameDay: (timestamp1: number, timestamp2: number) => boolean;
  isSameWeek: (timestamp1: number, timestamp2: number) => boolean;
  onMenuPress: (event: any, habit: any) => void;
  emptyStateIcon: string;
  emptyStateMessage: string;
  onShowAlert: (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
    icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
    iconColor?: string
  ) => void;
}

export const HabitsGrid: React.FC<HabitsGridProps> = ({
  habits,
  amI_A,
  now,
  checkInHabit,
  isSameDay,
  isSameWeek,
  onMenuPress,
  emptyStateIcon,
  emptyStateMessage,
  onShowAlert,
}) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  if (habits.length === 0) {
    return (
      <View className="relative overflow-hidden rounded-3xl">
        <BlurView
          intensity={isDarkMode ? 20 : 40}
          className="absolute inset-0"
        />
        <View
          className="rounded-3xl p-8 items-center border"
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(0, 153, 102, 0.15)"
                : "rgba(0, 153, 102, 0.1)",
            }}
          >
            <Ionicons
              name={emptyStateIcon as any}
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <Text
            className="text-center text-base"
            style={{ color: theme.colors.text.secondary }}
          >
            {emptyStateMessage}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {habits.map((h) => {
        const lastA = h.last_checkin_at_userA ?? 0;
        const lastB = h.last_checkin_at_userB ?? 0;
        const isDaily = h.frequency === "daily";
        const doneA =
          lastA > 0 &&
          (isDaily ? isSameDay(lastA, now) : isSameWeek(lastA, now));
        const doneB =
          lastB > 0 &&
          (isDaily ? isSameDay(lastB, now) : isSameWeek(lastB, now));

        return (
          <View key={h._id} className="relative overflow-hidden rounded-3xl">
            <HabitItem
              habit={h}
              isDoneByMe={amI_A ? doneA : doneB}
              isDoneByPartner={amI_A ? doneB : doneA}
              onCheck={async () => {
                try {
                  const result = await checkInHabit(h._id, amI_A);
                } catch (error) {
                  console.error("Check-in error:", error);
                  setTimeout(() => {
                    onShowAlert(
                      "Error",
                      "Failed to update habit. Please try again.",
                      [{ text: "OK", style: "default" }],
                      "alert-circle",
                      "#ef4444"
                    );
                  }, 100);
                }
              }}
              onMenuPress={onMenuPress}
            />
          </View>
        );
      })}
    </View>
  );
};
