import React from "react";
import { View, Text, Alert } from "react-native";
import { HabitItem } from "./HabitItem";

interface HabitsGridProps {
  habits: any[];
  duo: any;
  amI_A: boolean;
  now: number;
  checkInHabit: any;
  deleteHabit: any;
  isSameDay: (timestamp1: number, timestamp2: number) => boolean;
  isSameWeek: (timestamp1: number, timestamp2: number) => boolean;
  onMenuPress: (event: any, habit: any) => void;
  emptyStateIcon: string;
  emptyStateMessage: string;
}

export const HabitsGrid: React.FC<HabitsGridProps> = ({
  habits,
  duo,
  amI_A,
  now,
  checkInHabit,
  deleteHabit,
  isSameDay,
  isSameWeek,
  onMenuPress,
  emptyStateIcon,
  emptyStateMessage,
}) => {
  const handleDeleteHabit = (habitId: string, habitTitle: string) => {
    setTimeout(() => {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habitTitle}"? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteHabit({ habitId });
              } catch (error) {
                setTimeout(() => {
                  Alert.alert(
                    "Error",
                    "Failed to delete habit. Please try again."
                  );
                }, 100);
              }
            },
          },
        ]
      );
    }, 100);
  };

  if (habits.length === 0) {
    return (
      <View className="bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl p-8 text-center">
        <View className="w-16 h-16 bg-[#f3f4f6] rounded-full items-center justify-center mx-auto mb-4">
          <Text className="text-[#9ca3af] text-2xl">{emptyStateIcon}</Text>
        </View>
        <Text className="text-[#6b7280] text-center text-base">
          {emptyStateMessage}
        </Text>
      </View>
    );
  }

  return (
    <>
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
          <HabitItem
            key={h._id}
            habit={h}
            isDoneByMe={amI_A ? doneA : doneB}
            isDoneByPartner={amI_A ? doneB : doneA}
            onCheck={async () => {
              try {
                await checkInHabit({
                  habitId: h._id,
                  userIsA: amI_A,
                });
              } catch (error) {
                console.error("Check-in error:", error);
                setTimeout(() => {
                  Alert.alert(
                    "Error",
                    "Failed to update habit. Please try again."
                  );
                }, 100);
              }
            }}
            onMenuPress={onMenuPress}
          />
        );
      })}
    </>
  );
};
