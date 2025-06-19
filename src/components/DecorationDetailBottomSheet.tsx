// DecorationDetailBottomSheet.tsx
import React, { forwardRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { images } from "@/utils/images";

interface DecorationDetailBottomSheetProps {
  onClose: () => void;
  onRemove: () => void;
  decoration: {
    type: string;
    position: { x: number; y: number };
    buff?: { xpMultiplier: number };
  } | null;
  itemDefinition: {
    name: string;
    description: string;
    ability: string;
    abilityDescription: string;
    rarity: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    buffs: Record<string, number>;
  } | null;
  slotIndex: number;
}

const DecorationDetailBottomSheet = forwardRef<
  BottomSheetModal,
  DecorationDetailBottomSheetProps
>(({ onClose, onRemove, decoration, itemDefinition, slotIndex }, ref) => {
  const snapPoints = useMemo(() => ["50%"], []);
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  if (!decoration || !itemDefinition) return null;

  const getRarityConfig = (rarity: string) => {
    const baseConfig = {
      rare: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        background: isDarkMode
          ? "rgba(251, 191, 36, 0.1)"
          : "rgba(254, 243, 199, 0.8)",
        border: isDarkMode
          ? "rgba(251, 191, 36, 0.3)"
          : "rgba(251, 191, 36, 0.2)",
        text: isDarkMode ? "#fbbf24" : "#92400e",
        badge: isDarkMode ? "rgba(251, 191, 36, 0.2)" : "#f59e0b",
      },
      epic: {
        primary: "#8b5cf6",
        secondary: "#a78bfa",
        background: isDarkMode
          ? "rgba(167, 139, 250, 0.1)"
          : "rgba(245, 243, 255, 0.8)",
        border: isDarkMode
          ? "rgba(167, 139, 250, 0.3)"
          : "rgba(139, 92, 246, 0.2)",
        text: isDarkMode ? "#a78bfa" : "#6b21a8",
        badge: isDarkMode ? "rgba(167, 139, 250, 0.2)" : "#8b5cf6",
      },
      legendary: {
        primary: "#ef4444",
        secondary: "#f87171",
        background: isDarkMode
          ? "rgba(248, 113, 113, 0.1)"
          : "rgba(254, 226, 226, 0.8)",
        border: isDarkMode
          ? "rgba(248, 113, 113, 0.3)"
          : "rgba(239, 68, 68, 0.2)",
        text: isDarkMode ? "#f87171" : "#991b1b",
        badge: isDarkMode ? "rgba(248, 113, 113, 0.2)" : "#ef4444",
      },
      common: {
        primary: theme.colors.primary,
        secondary: theme.colors.primaryLight,
        background: isDarkMode
          ? "rgba(0, 204, 136, 0.1)"
          : "rgba(220, 252, 231, 0.8)",
        border: isDarkMode
          ? "rgba(0, 204, 136, 0.3)"
          : "rgba(0, 153, 102, 0.2)",
        text: isDarkMode ? theme.colors.primaryLight : "#065f46",
        badge: isDarkMode ? "rgba(0, 204, 136, 0.2)" : theme.colors.primary,
      },
    };

    return baseConfig[rarity as keyof typeof baseConfig] || baseConfig.common;
  };

  const rarityConfig = getRarityConfig(itemDefinition.rarity);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleComponent={null}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.text.tertiary,
        width: 48,
        height: 4,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.background[1],
      }}
    >
      <BlurView
        intensity={isDarkMode ? 60 : 80}
        tint={isDarkMode ? "dark" : "light"}
        className="flex-1 rounded-t-3xl overflow-hidden"
      >
        <BottomSheetView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Enhanced Header */}
            <View className="relative overflow-hidden mb-5">
              <BlurView
                intensity={20}
                tint={isDarkMode ? "dark" : "light"}
                className="px-6 pt-8 pb-6"
                style={{ backgroundColor: rarityConfig.background }}
              >
                {/* Decorative elements */}
                <View className="absolute inset-0 opacity-5">
                  <View
                    className="absolute top-4 right-8 w-24 h-24 rounded-full"
                    style={{ backgroundColor: rarityConfig.primary }}
                  />
                  <View
                    className="absolute bottom-2 left-6 w-20 h-20 rounded-full"
                    style={{ backgroundColor: rarityConfig.secondary }}
                  />
                  <View
                    className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full"
                    style={{ backgroundColor: rarityConfig.primary }}
                  />
                </View>

                {/* Close button */}
                <TouchableOpacity
                  onPress={onClose}
                  className="absolute top-4 right-4 z-10"
                >
                  <BlurView
                    intensity={40}
                    tint={isDarkMode ? "dark" : "light"}
                    className="w-10 h-10 rounded-2xl justify-center items-center overflow-hidden"
                    style={{ backgroundColor: theme.colors.glass }}
                  >
                    <Text
                      className="text-xl font-bold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      ×
                    </Text>
                  </BlurView>
                </TouchableOpacity>

                {/* Item showcase */}
                <View className="items-center">
                  <View className="relative mb-6">
                    <BlurView
                      intensity={30}
                      tint={isDarkMode ? "dark" : "light"}
                      className="w-24 h-24 rounded-3xl justify-center items-center"
                      style={{
                        backgroundColor: theme.colors.cardBackground,
                        borderWidth: 2,
                        borderColor: rarityConfig.border,
                      }}
                    >
                      <Image
                        source={images[decoration.type]}
                        className="w-14 h-14"
                        resizeMode="contain"
                      />
                    </BlurView>

                    {/* Rarity indicator */}
                    <View
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full justify-center items-center"
                      style={{ backgroundColor: rarityConfig.primary }}
                    >
                      <Text className="text-white text-xs font-bold">✦</Text>
                    </View>
                  </View>

                  {/* Item title and rarity */}
                  <View className="items-center gap-3">
                    <Text
                      className="text-2xl font-bold text-center font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {itemDefinition.name}
                    </Text>

                    <BlurView
                      intensity={20}
                      tint={isDarkMode ? "dark" : "light"}
                      className="px-4 py-2 rounded-2xl"
                      style={{ backgroundColor: rarityConfig.badge }}
                    >
                      <Text
                        className="text-sm font-bold uppercase tracking-wider font-mainRegular"
                        style={{
                          color: isDarkMode ? rarityConfig.text : "white",
                        }}
                      >
                        {itemDefinition.rarity}
                      </Text>
                    </BlurView>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Content area */}
            <View className="flex-1 px-6 gap-6 mb-5">
              {/* Active Ability Card */}
              <BlurView
                intensity={30}
                tint={isDarkMode ? "dark" : "light"}
                className="rounded-3xl p-5 overflow-hidden"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <View className="flex-row items-center gap-3 mb-4">
                  <View
                    className="w-10 h-10 rounded-2xl justify-center items-center"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Text className="text-white text-lg">✨</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold font-mainRegular"
                      style={{ color: theme.colors.primary }}
                    >
                      Active Ability
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-xl"
                    style={{ backgroundColor: `${theme.colors.primary}20` }}
                  >
                    <Text
                      className="text-xs font-bold font-mainRegular"
                      style={{ color: theme.colors.primary }}
                    >
                      ACTIVE
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-base font-semibold mb-2 font-mainRegular"
                  style={{ color: theme.colors.text.primary }}
                >
                  {itemDefinition.ability}
                </Text>
                <Text
                  className="text-sm leading-relaxed font-mainRegular"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {itemDefinition.abilityDescription}
                </Text>

                {/* Buff display */}
                {decoration.buff && (
                  <BlurView
                    intensity={20}
                    tint={isDarkMode ? "dark" : "light"}
                    className="mt-4 rounded-2xl p-4"
                    style={{ backgroundColor: `${theme.colors.primary}10` }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-sm font-semibold font-mainRegular"
                        style={{ color: theme.colors.primary }}
                      >
                        Current Boost
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-xl font-bold font-mainRegular"
                          style={{ color: theme.colors.primary }}
                        >
                          {itemDefinition.buffs.xpMultiplier}x
                        </Text>
                        <Text
                          className="text-sm font-mainRegular"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          XP Multiplier
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                )}
              </BlurView>

              {/* Equipment Details */}
              <BlurView
                intensity={30}
                tint={isDarkMode ? "dark" : "light"}
                className="rounded-3xl p-5 overflow-hidden"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <Text
                  className="text-sm font-semibold mb-4 font-mainRegular"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Equipment Details
                </Text>
                <View className="gap-3">
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      Position
                    </Text>
                    <Text
                      className="text-sm font-medium font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Slot {slotIndex + 1}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      Rarity
                    </Text>
                    <Text
                      className="text-sm font-medium capitalize font-mainRegular"
                      style={{ color: rarityConfig.text }}
                    >
                      {itemDefinition.rarity}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      Status
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <Text
                        className="text-sm font-medium font-mainRegular"
                        style={{ color: theme.colors.primary }}
                      >
                        Equipped
                      </Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>

            <View
              className="px-6 pb-8 pt-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.cardBorder,
              }}
            >
              <View className="flex-row gap-4">
                <TouchableOpacity onPress={onClose} className="flex-1">
                  <BlurView
                    intensity={30}
                    tint={isDarkMode ? "dark" : "light"}
                    className="rounded-2xl py-4 px-6"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      borderWidth: 1,
                      borderColor: theme.colors.cardBorder,
                    }}
                  >
                    <Text
                      className="text-base font-semibold text-center font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Keep Equipped
                    </Text>
                  </BlurView>
                </TouchableOpacity>

                <TouchableOpacity onPress={onRemove} className="flex-1">
                  <View
                    className="rounded-2xl py-4 px-6"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    <Text className="text-white text-base font-semibold text-center font-mainRegular">
                      Remove Item
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text
                className="text-xs text-center mt-4 font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                Removing this item will return it to your inventory
              </Text>
            </View>
          </ScrollView>
        </BottomSheetView>
      </BlurView>
    </BottomSheetModal>
  );
});

DecorationDetailBottomSheet.displayName = "DecorationDetailBottomSheet";

export default DecorationDetailBottomSheet;
