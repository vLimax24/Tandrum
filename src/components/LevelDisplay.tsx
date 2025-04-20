import { View, Text } from "react-native";
import React from "react";
import { getLevelData } from "@/utils/level";
import { Doc } from "convex/_generated/dataModel";

export const LevelDisplay = ({ duo }: { duo: Doc<"duoConnections"> }) => {
  const {
    level,
    xpIntoLevel,
    xpNeeded,
    progressPercent: progress,
  } = getLevelData(duo.trust_score);
  return (
    <View className="mb-4">
      {/* Top: Level Numbers */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-text text-sm">Level {level}</Text>
        <Text className="text-text text-sm">Level {level + 1}</Text>
      </View>

      {/* XP Progress Bar */}
      <View className="h-4 bg-gray-300 rounded-full overflow-hidden">
        <View
          style={{ width: `${Math.min(100, progress * 100)}%` }}
          className="h-full bg-primary"
        />
      </View>

      {/* Bottom: XP Info */}
      <Text className="text-xs text-gray-400 mt-1">
        {xpIntoLevel} / {xpNeeded} XP bis zum nächsten Level
      </Text>
    </View>
  );
};

export default LevelDisplay;
