import React from "react";
import { View, Text } from "react-native";

interface StreakVisualizationProps {
  streak: number;
  streakDate?: number;
}

export const StreakVisualization: React.FC<StreakVisualizationProps> = ({
  streak,
  streakDate,
}) => {
  const getDaysOfWeek = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const isToday = date.toDateString() === today.toDateString();
      const isInStreak =
        streak > 0 &&
        streakDate &&
        date >= new Date(streakDate) &&
        date <= today &&
        Math.floor((date.getTime() - streakDate) / (1000 * 60 * 60 * 24)) <
          streak;

      return {
        day,
        date,
        isToday,
        isInStreak,
      };
    });
  };

  const weekDays = getDaysOfWeek();

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-gray-900 font-semibold text-lg">
            Current Streak
          </Text>
          <Text className="text-gray-500 text-sm">
            {streak} consecutive day{streak !== 1 ? "s" : ""}
          </Text>
        </View>
        <View className="bg-gradient-to-r from-accent to-primary rounded-full px-4 py-2">
          <Text className="text-white font-bold text-xl">{streak}</Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {weekDays.map((dayInfo, index) => (
          <View
            key={index}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
              dayInfo.isInStreak
                ? "bg-accent border-accent shadow-md"
                : dayInfo.isToday
                  ? "border-accent border-opacity-50 bg-accent bg-opacity-10"
                  : "border-gray-200 bg-gray-50"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                dayInfo.isInStreak
                  ? "text-white"
                  : dayInfo.isToday
                    ? "text-accent"
                    : "text-gray-400"
              }`}
            >
              {dayInfo.day}
            </Text>
            {dayInfo.isToday && (
              <View className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full" />
            )}
          </View>
        ))}
      </View>

      {streak === 0 && (
        <Text className="text-center text-gray-400 text-sm mt-3">
          Complete habits together to start your streak! 🌱
        </Text>
      )}
    </View>
  );
};
