import React, { useRef, useEffect } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

interface LoadingScreenProps {
  screen?: "home" | "tree" | "habits" | "default";
}

const LoadingState: React.FC<LoadingScreenProps> = ({ screen = "default" }) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const getLoadingText = () => {
    switch (screen) {
      case "home":
        return "Loading your Dashboard...";
      case "tree":
        return "Growing your Tree...";
      case "habits":
        return "Training your Habits...";
      default:
        return "Loading...";
    }
  };

  const getLoadingIconName = () => {
    switch (screen) {
      case "home":
        return "home";
      case "tree":
        return "leaf";
      case "habits":
        return "barbell";
      default:
        return "flash";
    }
  };

  // Master animation value (0 to 1)
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const getDotOpacity = (index: number) => {
    const offset = index / 3;
    return animation.interpolate({
      inputRange: [offset - 0.2, offset, offset + 0.2],
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });
  };

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-8">
        <BlurView
          intensity={60}
          tint={isDarkMode ? "dark" : "light"}
          className="p-8 items-center rounded-3xl overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: theme.colors.cardBorder,
            backgroundColor: theme.colors.glass,
          }}
        >
          {/* Animated Icon */}
          <View className="mb-6">
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              className="w-20 h-20 items-center justify-center"
              style={{ borderRadius: 24 }}
            >
              <View className="relative">
                <View
                  className="w-12 h-12 rounded-full border-4 border-white/30"
                  style={{
                    borderTopColor: "white",
                  }}
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Ionicons
                    name={getLoadingIconName()}
                    size={20}
                    color="white"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Text */}
          <Text
            className="text-xl font-semibold text-center mb-2"
            style={{
              color: theme.colors.text.primary,
              fontFamily: "font-mainRegular",
            }}
          >
            {getLoadingText()}
          </Text>
          <Text
            className="text-sm text-center opacity-75"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: "font-mainRegular",
            }}
          >
            Building habits together
          </Text>

          {/* Animated Dots */}
          <View className="flex-row gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary,
                  opacity: getDotOpacity(i),
                }}
              />
            ))}
          </View>
        </BlurView>
      </View>
    </LinearGradient>
  );
};

export default LoadingState;
