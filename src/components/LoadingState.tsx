import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export function LoadingState() {
  return (
    <View className="flex-1 justify-center items-center bg-[#f8fafc]">
      <View className="bg-white rounded-3xl p-8 shadow-lg">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-[#374151] mt-4 text-lg font-medium text-center">
          Loading your habits...
        </Text>
      </View>
    </View>
  );
}
