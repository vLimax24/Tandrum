import React from "react";
import { View, Text } from "react-native";

interface SectionHeaderProps {
  title: string;
  resetTime: string;
  isDaily?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  resetTime,
  isDaily = true,
}) => (
  <View className="flex-row justify-between items-center mb-6">
    <View>
      <Text className="text-[#111827] font-bold text-2xl mb-1 font-mainRegular">
        {title}
      </Text>
      <Text className="text-[#6b7280] text-sm font-mainRegular">
        Reset in {resetTime}
      </Text>
    </View>
    <View
      style={{
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          backgroundColor: "#d1fae5",
          borderWidth: 1,
          borderColor: "#6ee7b7",
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <Text className="text-[#059669] text-xs font-bold font-mainRegular">
          YOU
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "#dbeafe",
          borderWidth: 1,
          borderColor: "#93c5fd",
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <Text className="text-[#1d4ed8] text-xs font-bold font-mainRegular">
          PARTNER
        </Text>
      </View>
    </View>
  </View>
);
