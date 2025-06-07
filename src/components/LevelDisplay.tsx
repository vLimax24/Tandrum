import { View, Text, Animated, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { getLevelData } from "@/utils/level";
import { Doc } from "convex/_generated/dataModel";

// Use the same tree images from your TreeSection
const treeImages: Record<string, any> = {
  leaf: require("../assets/hemp-leaf.png"),
  orange: require("../assets/orange.png"),
  sprout: require("../assets/tree-1.png"),
};

interface LevelDisplayProps {
  duo: Doc<"duoConnections">;
  showXpStats?: boolean;
}

export const LevelDisplay = ({
  duo,
  showXpStats = true,
}: LevelDisplayProps) => {
  const {
    level,
    xpIntoLevel,
    xpNeeded,
    progressPercent: progress,
  } = getLevelData(duo.trust_score);

  // Animation ref for progress bar
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View className="mb-6">
      {/* Level Header - matching your TreeSection style */}
      <Text className="text-2xl font-semibold text-text mb-4">
        Level Progress
      </Text>

      {/* Level Info Card - matching your primary colored cards */}
      <View className="bg-primary rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Image
              source={treeImages["leaf"]}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <Text className="text-background text-lg font-semibold">
              Level {level}
            </Text>
          </View>
          <Text className="text-background text-sm">
            Next: Level {level + 1}
          </Text>
        </View>

        {/* Progress Bar - matching your design language */}
        <View className="mb-3">
          <View className="h-3 bg-background/20 rounded-full overflow-hidden">
            <Animated.View
              style={{
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
              className="h-full bg-background rounded-full"
            />
          </View>
        </View>

        <Text className="text-background text-sm text-center">
          {xpIntoLevel} / {xpNeeded} XP bis zum nächsten Level (
          {Math.round(progress * 100)}%)
        </Text>
      </View>

      {/* XP Statistics - matching your stats card style - conditionally rendered */}
      {showXpStats && (
        <View className="bg-white p-4 rounded-lg shadow mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 items-center">
              <Image
                source={treeImages["leaf"]}
                style={{ width: 20, height: 20, marginBottom: 4 }}
              />
              <Text className="text-xs text-gray-600 mb-1">Current XP</Text>
              <Text className="text-sm font-semibold text-text">
                {xpIntoLevel.toLocaleString()}
              </Text>
            </View>

            <View className="w-px h-12 bg-gray-200" />

            <View className="flex-1 items-center">
              <Image
                source={treeImages["orange"]}
                style={{ width: 20, height: 20, marginBottom: 4 }}
              />
              <Text className="text-xs text-gray-600 mb-1">Target XP</Text>
              <Text className="text-sm font-semibold text-text">
                {xpNeeded.toLocaleString()}
              </Text>
            </View>

            <View className="w-px h-12 bg-gray-200" />

            <View className="flex-1 items-center">
              <Image
                source={treeImages["sprout"]}
                style={{ width: 20, height: 20, marginBottom: 4 }}
              />
              <Text className="text-xs text-gray-600 mb-1">Remaining</Text>
              <Text className="text-sm font-semibold text-text">
                {(xpNeeded - xpIntoLevel).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Achievement notification - matching your growth log style */}
      {progress > 0.8 && (
        <View className="bg-[#f9f9f9] p-3 rounded-lg flex-row items-center">
          <Image
            source={treeImages["leaf"]}
            style={{ width: 20, height: 20, marginRight: 12 }}
          />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-text">
              🎉 Fast geschafft!
            </Text>
            <Text className="text-xs text-gray-600">
              Nur noch {(xpNeeded - xpIntoLevel).toLocaleString()} XP bis Level{" "}
              {level + 1}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default LevelDisplay;
