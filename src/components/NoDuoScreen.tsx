import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { NewDuoModal } from "@/components/NewDuoModal";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { images } from "@/utils/images";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";

interface NoDuoScreenProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const NoDuoScreen: React.FC<NoDuoScreenProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const clerkId = user?.id;
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  const handleStartPartnership = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-8">
        {/* Floating glass card container */}
        <BlurView
          intensity={isDarkMode ? 60 : 80}
          tint={isDarkMode ? "dark" : "light"}
          className="rounded-3xl overflow-hidden w-full max-w-sm"
          style={{
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
          }}
        >
          <View className="p-8 items-center">
            {/* Icon container with glassmorphism */}
            <View className="relative mb-8">
              <BlurView
                intensity={40}
                tint={isDarkMode ? "dark" : "light"}
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(0, 153, 102, 0.15)"
                    : "rgba(0, 153, 102, 0.1)",
                }}
              >
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(0, 153, 102, 0.25)"
                      : "rgba(0, 153, 102, 0.15)",
                  }}
                >
                  <Image
                    source={images.leaf}
                    className="w-8 h-8"
                    style={{
                      tintColor: theme.colors.primary,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </BlurView>

              {/* Subtle glow effect */}
              <View
                className="absolute inset-0 w-24 h-24 rounded-full opacity-20"
                style={{
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: 1.1 }],
                }}
              />
            </View>

            {/* Content */}
            <View className="items-center gap-4 mb-8">
              <Text
                className="text-3xl font-bold text-center font-mainRegular"
                style={{ color: theme.colors.text.primary }}
              >
                Begin Together
              </Text>

              <Text
                className="text-base text-center leading-6 font-mainRegular"
                style={{ color: theme.colors.text.secondary }}
              >
                Create your first partnership and start building habits that
                matter. Watch your shared journey flourish! 🌱
              </Text>
            </View>

            {/* CTA Button with glassmorphism */}
            <TouchableOpacity
              onPress={handleStartPartnership}
              activeOpacity={0.8}
              className="overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-5 px-8 items-center justify-center flex-row"
              >
                <View className="w-6 h-6 bg-white/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="add" size={16} color="white" />
                </View>
                <Text
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily: "font-mainRegular",
                  }}
                >
                  Start New Partnership
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="white"
                  className="ml-3"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Secondary content - floating below */}
        <View className="mt-8 px-4">
          <BlurView
            intensity={40}
            tint={isDarkMode ? "dark" : "light"}
            className="rounded-2xl px-6 py-4"
            style={{
              backgroundColor: theme.colors.glass,
              borderColor: theme.colors.cardBorder,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center justify-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <Text
                className="text-sm font-medium font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                Building habits is better together
              </Text>
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </View>
          </BlurView>
        </View>

        {/* Modal */}
        {convexUser && (
          <NewDuoModal
            visible={modalVisible}
            onClose={handleModalClose}
            userId={convexUser._id}
          />
        )}
      </View>
    </LinearGradient>
  );
};
