import React from "react";
import { View, Text } from "react-native";

export function HabitsHeader() {
  return (
    <View className="px-6 pt-16 pb-8 bg-gradient-to-r from-[#10b981] to-[#059669]">
      <Text className="text-black text-4xl font-bold mb-2 font-mainRegular">
        Habits
      </Text>
    </View>
  );
}
