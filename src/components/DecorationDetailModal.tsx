// DecorationDetailModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
} from "react-native";

interface DecorationDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onRemove: () => void;
  decoration: {
    type: "leaf" | "fruit";
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

const DecorationDetailModal: React.FC<DecorationDetailModalProps> = ({
  visible,
  onClose,
  onRemove,
  decoration,
  itemDefinition,
  treeImages,
  slotIndex,
}) => {
  if (!decoration || !itemDefinition) return null;

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "rare":
        return {
          gradient: "from-[#f59e0b] to-[#d97706]",
          glow: "#f59e0b",
          badge: "bg-[#f59e0b]",
          text: "text-[#92400e]",
        };
      case "epic":
        return {
          gradient: "from-[#8b5cf6] to-[#7c3aed]",
          glow: "#8b5cf6",
          badge: "bg-[#8b5cf6]",
          text: "text-[#5b21b6]",
        };
      case "legendary":
        return {
          gradient: "from-[#f59e0b] via-[#f97316] to-[#dc2626]",
          glow: "#f59e0b",
          badge: "bg-gradient-to-r from-[#f59e0b] to-[#dc2626]",
          text: "text-[#92400e]",
        };
      default:
        return {
          gradient: "from-[#10b981] to-[#059669]",
          glow: "#10b981",
          badge: "bg-[#10b981]",
          text: "text-[#065f46]",
        };
    }
  };

  const rarityConfig = getRarityConfig(itemDefinition.rarity);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[rgba(0,0,0,0.6)] justify-center items-center px-4">
        {/* Main Modal Container */}
        <View className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
          {/* Header with gradient background */}
          <View
            className={`bg-gradient-to-r ${rarityConfig.gradient} rounded-t-3xl px-6 py-8 relative overflow-hidden`}
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
              <View
                className="w-20 h-20 rounded-full bg-white justify-center items-center mb-4 shadow-lg"
                style={{
                  shadowColor: rarityConfig.glow,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Image
                  source={
                    decoration.type === "leaf"
                      ? treeImages.leaf
                      : treeImages.orange
                  }
                  className="w-12 h-12"
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

          {/* Content Section */}
          <View className="px-6 py-6">
            {/* Description */}
            <View className="mb-6">
              <Text className="text-[#374151] text-base leading-relaxed text-center">
                {itemDefinition.description}
              </Text>
            </View>

            {/* Active Ability Section */}
            <View className="bg-[rgba(16,185,129,0.05)] border border-[#10b981] rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-[#10b981] rounded-full justify-center items-center mr-3">
                  <Text className="text-white text-sm font-bold">✨</Text>
                </View>
                <Text className="text-[#10b981] text-lg font-bold flex-1">
                  Active Ability
                </Text>
                <View className="bg-[#10b981] px-2 py-1 rounded-lg">
                  <Text className="text-white text-xs font-bold">ACTIVE</Text>
                </View>
              </View>

              <Text className="text-[#065f46] text-base font-semibold mb-2">
                {itemDefinition.ability}
              </Text>
              <Text className="text-[#374151] text-sm leading-relaxed">
                {itemDefinition.abilityDescription}
              </Text>

              {/* Buff display */}
              {decoration.buff && (
                <View className="mt-4 bg-[rgba(16,185,129,0.1)] rounded-xl p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[#065f46] text-sm font-semibold">
                      Current Boost
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#10b981] text-lg font-bold mr-1">
                        {decoration.buff.xpMultiplier}x
                      </Text>
                      <Text className="text-[#065f46] text-sm">
                        XP Multiplier
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Stats or additional info */}
            <View className="bg-[#f8fafc] rounded-2xl p-4 mb-6">
              <Text className="text-[#374151] text-sm font-semibold mb-3">
                Equipment Details
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#6b7280] text-sm">Position</Text>
                  <Text className="text-[#374151] text-sm font-medium">
                    Slot {slotIndex + 1}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#6b7280] text-sm">Rarity</Text>
                  <Text
                    className={`text-sm font-medium capitalize ${rarityConfig.text}`}
                  >
                    {itemDefinition.rarity}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[#6b7280] text-sm">Status</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-[#10b981] rounded-full mr-2" />
                    <Text className="text-[#10b981] text-sm font-medium">
                      Equipped
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-6">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-[#f3f4f6] border border-[#d1d5db] rounded-2xl py-4 px-6"
              >
                <Text className="text-[#374151] text-base font-semibold text-center">
                  Keep Equipped
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRemove}
                className="flex-1 bg-[#dc2626] rounded-2xl py-4 px-6 shadow-lg"
                style={{
                  shadowColor: "#dc2626",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-white text-base font-semibold text-center">
                  Remove Item
                </Text>
              </TouchableOpacity>
            </View>

            {/* Warning text */}
            <Text className="text-[#9ca3af] text-xs text-center mt-3">
              Removing this item will return it to your inventory
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DecorationDetailModal;
