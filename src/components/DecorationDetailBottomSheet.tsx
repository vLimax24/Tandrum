// DecorationDetailBottomSheet.tsx
import React, { forwardRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

interface DecorationDetailBottomSheetProps {
  onClose: () => void;
  onRemove: () => void;
  decoration: {
    type: "leaf" | "fruit" | "silverLeaf" | "goldenLeaf" | "apple" | "cherry";
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
  } | null;
  treeImages: Record<string, any>;
  slotIndex: number;
}

const DecorationDetailBottomSheet = forwardRef<
  BottomSheetModal,
  DecorationDetailBottomSheetProps
>(
  (
    { onClose, onRemove, decoration, itemDefinition, treeImages, slotIndex },
    ref
  ) => {
    const snapPoints = useMemo(() => ["83%"], []);

    const renderBackdrop = React.useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    if (!decoration || !itemDefinition) return null;

    const getRarityConfig = (rarity: string) => {
      switch (rarity) {
        case "rare":
          return {
            gradient: "bg-gradient-to-r from-amber-500 to-amber-600",
            glow: "#f59e0b",
            badge: "bg-amber-500",
            text: "text-amber-800",
            light: "bg-amber-50",
          };
        case "epic":
          return {
            gradient: "bg-gradient-to-r from-purple-500 to-purple-600",
            glow: "#8b5cf6",
            badge: "bg-purple-500",
            text: "text-purple-800",
            light: "bg-purple-50",
          };
        case "legendary":
          return {
            gradient:
              "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600",
            glow: "#f59e0b",
            badge: "bg-gradient-to-r from-amber-500 to-red-600",
            text: "text-amber-800",
            light: "bg-gradient-to-r from-amber-50 to-red-50",
          };
        default:
          return {
            gradient: "bg-gradient-to-r from-emerald-500 to-emerald-600",
            glow: "#10b981",
            badge: "bg-emerald-500",
            text: "text-emerald-800",
            light: "bg-emerald-50",
          };
      }
    };

    const rarityConfig = getRarityConfig(itemDefinition.rarity);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: "#d1d5db",
          width: 40,
        }}
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <BottomSheetView className="flex-1">
          {/* Header with gradient background */}
          <View
            className={`${rarityConfig.gradient} px-6 pt-8 relative overflow-hidden`}
          >
            {/* Background pattern */}
            <View className="absolute inset-0 opacity-10">
              <View className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white opacity-20" />
              <View className="absolute bottom-2 left-2 w-16 h-16 rounded-full bg-white opacity-15" />
              <View className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-white opacity-10" />
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-[rgba(255,255,255,0.2)] rounded-full justify-center items-center"
            >
              <Text className="text-black text-lg font-bold">×</Text>
            </TouchableOpacity>

            {/* Item icon and basic info */}
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-white justify-center items-center mb-4 shadow-lg">
                <Image
                  source={
                    decoration.type === "leaf"
                      ? treeImages.leaf
                      : treeImages.orange
                  }
                  className="w-12 h-12"
                  resizeMode="contain"
                />
              </View>

              <View className="items-center justify-center">
                <View className="flex-row items-center mb-2">
                  <Text className="text-black text-xl font-bold mr-2">
                    {itemDefinition.name}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View
                    className={`${rarityConfig.badge} px-3 py-1 rounded-full`}
                  >
                    <Text className="text-white text-xs font-bold uppercase tracking-wide">
                      {itemDefinition.rarity}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Content Section - Scrollable */}
          <View className="flex-1 px-6 ">
            {/* Description */}
            <View className="mb-6">
              <Text className="text-gray-700 text-base leading-relaxed text-center">
                {itemDefinition.description}
              </Text>
            </View>

            {/* Active Ability Section */}
            <View className="bg-emerald-50 border border-emerald-500 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-emerald-500 rounded-full justify-center items-center mr-3">
                  <Text className="text-white text-sm">✨</Text>
                </View>
                <Text className="text-emerald-500 text-lg font-bold flex-1">
                  Active Ability
                </Text>
                <View className="bg-emerald-500 px-2 py-1 rounded-lg">
                  <Text className="text-white text-xs font-bold">ACTIVE</Text>
                </View>
              </View>

              <Text className="text-emerald-800 text-base font-semibold mb-2">
                {itemDefinition.ability}
              </Text>
              <Text className="text-gray-700 text-sm leading-relaxed">
                {itemDefinition.abilityDescription}
              </Text>

              {/* Buff display */}
              {decoration.buff && (
                <View className="mt-4 bg-emerald-100 rounded-xl p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-emerald-800 text-sm font-semibold">
                      Current Boost
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-emerald-600 text-lg font-bold mr-1">
                        {decoration.buff.xpMultiplier}x
                      </Text>
                      <Text className="text-emerald-800 text-sm">
                        XP Multiplier
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Stats or additional info */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-3">
                Equipment Details
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-gray-500 text-sm">Position</Text>
                  <Text className="text-gray-700 text-sm font-medium">
                    Slot {slotIndex + 1}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-gray-500 text-sm">Rarity</Text>
                  <Text
                    className={`text-sm font-medium capitalize ${rarityConfig.text}`}
                  >
                    {itemDefinition.rarity}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-gray-500 text-sm">Status</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <Text className="text-emerald-600 text-sm font-medium">
                      Equipped
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons - Fixed at bottom */}
          <View className="px-6 pb-6 pt-4 border-t border-gray-100">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl py-4 px-6"
              >
                <Text className="text-gray-700 text-base font-semibold text-center">
                  Keep Equipped
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRemove}
                className="flex-1 bg-red-600 rounded-2xl py-4 px-6 shadow-lg"
              >
                <Text className="text-white text-base font-semibold text-center">
                  Remove Item
                </Text>
              </TouchableOpacity>
            </View>

            {/* Warning text */}
            <Text className="text-gray-400 text-xs text-center mt-3">
              Removing this item will return it to your inventory
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

DecorationDetailBottomSheet.displayName = "DecorationDetailBottomSheet";

export default DecorationDetailBottomSheet;
