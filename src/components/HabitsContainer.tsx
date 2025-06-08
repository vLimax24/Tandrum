import React from "react";
import { View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { HabitsGrid } from "@/components/HabitsGrid";

interface HabitsContainerProps {
  daily: any[];
  weekly: any[];
  duo: any;
  amI_A: boolean;
  now: number;
  timeToday: string;
  timeWeek: string;
  checkInHabit: any;
  deleteHabit: any;
  onMenuPress: (event: any, habit: any) => void;
}

export function HabitsContainer({
  daily,
  weekly,
  duo,
  amI_A,
  now,
  timeToday,
  timeWeek,
  checkInHabit,
  deleteHabit,
  onMenuPress,
}: HabitsContainerProps) {
  const isSameDay = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSameWeek = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    const startOfWeek1 = new Date(date1);
    startOfWeek1.setDate(date1.getDate() - date1.getDay());
    startOfWeek1.setHours(0, 0, 0, 0);

    const startOfWeek2 = new Date(date2);
    startOfWeek2.setDate(date2.getDate() - date2.getDay());
    startOfWeek2.setHours(0, 0, 0, 0);

    return startOfWeek1.getTime() === startOfWeek2.getTime();
  };

  return (
    <>
      {/* Daily Habits Section */}
      <View>
        <SectionHeader
          title="Daily Habits"
          resetTime={timeToday}
          isDaily={true}
        />
        <HabitsGrid
          habits={daily}
          duo={duo}
          amI_A={amI_A}
          now={now}
          checkInHabit={checkInHabit}
          deleteHabit={deleteHabit}
          isSameDay={isSameDay}
          isSameWeek={isSameWeek}
          onMenuPress={onMenuPress}
          emptyStateIcon="📅"
          emptyStateMessage="No daily habits yet. Create one to get started!"
        />
      </View>

      {/* Weekly Habits Section */}
      <View className="mb-6">
        <SectionHeader
          title="Weekly Habits"
          resetTime={timeWeek}
          isDaily={false}
        />
        <HabitsGrid
          habits={weekly}
          duo={duo}
          amI_A={amI_A}
          now={now}
          checkInHabit={checkInHabit}
          deleteHabit={deleteHabit}
          isSameDay={isSameDay}
          isSameWeek={isSameWeek}
          onMenuPress={onMenuPress}
          emptyStateIcon="📊"
          emptyStateMessage="No weekly habits yet. Create one to get started!"
        />
      </View>
    </>
  );
}
