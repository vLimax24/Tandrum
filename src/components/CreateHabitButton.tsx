import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CreateHabitButtonProps {
  onPress: () => void;
}

export function CreateHabitButton({ onPress }: CreateHabitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 16,
        marginBottom: 32,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: "hidden",
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 16,
          padding: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View className="flex-row items-center justify-center">
          <View className="w-6 h-6 bg-white bg-opacity-20 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold text-lg">+</Text>
          </View>
          <Text className="text-white font-bold text-lg">Create New Habit</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
