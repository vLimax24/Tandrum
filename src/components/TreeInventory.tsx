// TreeInventory.tsx
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import DecorationDetailModal from "./DecorationDetailModal";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList, // Add this
} from "@gorhom/bottom-sheet";

const treeImages: Record<string, any> = {
  leaf: require("../../src/assets/hemp-leaf.png"),
  orange: require("../../src/assets/orange.png"),
  // Add more images as needed for new types
  silverLeaf: require("../../src/assets/hemp-leaf.png"), // Using same image for now
  goldenLeaf: require("../../src/assets/hemp-leaf.png"), // Using same image for now
  apple: require("../../src/assets/orange.png"), // Using orange image as placeholder
  cherry: require("../../src/assets/orange.png"), // Using orange image as placeholder
};

const itemDefinitions = {
  // Leaf types
  leaf: {
    name: "Mystical Leaf", // This is correct - it's still type "leaf"
    description: "A shimmering leaf that enhances learning potential",
    ability: "Double XP Boost",
    abilityDescription: "Multiplies all XP gained by 2x while active",
    rarity: "common",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "🍃",
  },
  silverLeaf: {
    name: "Silver Leaf",
    description: "A pristine silver leaf that boosts focus and clarity",
    ability: "Focus Enhancement",
    abilityDescription:
      "Increases concentration and reduces distractions by 50%",
    rarity: "uncommon",
    color: "#6b7280",
    bgColor: "#f8fafc",
    borderColor: "#d1d5db",
    icon: "🥈",
  },
  goldenLeaf: {
    name: "Golden Leaf",
    description: "A radiant golden leaf infused with ancient wisdom",
    ability: "Wisdom Amplifier",
    abilityDescription: "Grants triple XP and unlocks hidden knowledge paths",
    rarity: "legendary",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    icon: "🏆",
  },
  // Fruit types
  fruit: {
    name: "Golden Orange", // This is correct - it's still type "fruit"
    description: "A radiant fruit that provides sustained energy",
    ability: "Energy Sustain",
    abilityDescription: "Maintains motivation levels for extended periods",
    rarity: "rare",
    color: "#ea580c",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: "🍊",
  },
  apple: {
    name: "Crimson Apple",
    description: "A vibrant red apple that sharpens mental acuity",
    ability: "Mental Sharpness",
    abilityDescription:
      "Increases problem-solving speed by 40% and memory retention",
    rarity: "uncommon",
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    icon: "🍎",
  },
  cherry: {
    name: "Ethereal Cherry",
    description: "A mystical cherry that brings luck and serendipity",
    ability: "Fortune's Favor",
    abilityDescription:
      "Increases rare item drops and unlocks bonus opportunities",
    rarity: "epic",
    color: "#be185d",
    bgColor: "#fdf2f8",
    borderColor: "#f9a8d4",
    icon: "🍒",
  },
};

interface TreeInventoryProps {
  treeData: {
    duoId: Id<"duoConnections">;
    stage: "sprout" | "smallTree" | "mediumTree" | "grownTree";
    leaves: number;
    fruits: number;
    // Add counts for new item types
    silverLeaves?: number;
    goldenLeaves?: number;
    apples?: number;
    cherries?: number;
    decorations?: Array<{
      type: "leaf" | "fruit" | "silverLeaf" | "goldenLeaf" | "apple" | "cherry";
      position: { x: number; y: number };
      buff?: { xpMultiplier: number };
    }>;
  };
  onInventoryUpdate?: () => void;
}

interface SlotPosition {
  x: number;
  y: number;
  id: string;
}

type ItemType =
  | "leaf"
  | "fruit"
  | "silverLeaf"
  | "goldenLeaf"
  | "apple"
  | "cherry";

const TreeInventory: React.FC<TreeInventoryProps> = ({
  treeData,
  onInventoryUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "equipped">(
    "inventory"
  );
  const [showSlots, setShowSlots] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<{
    decoration: {
      type: ItemType;
      position: { x: number; y: number };
      buff?: { xpMultiplier: number };
    };
    index: number;
  } | null>(null);

  // Bottom Sheet Modal refs and configuration
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // Set to single snap point at 90% for maximum height
  const snapPoints = useMemo(() => ["90%"], []);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // Custom backdrop component
  const renderBackdrop = useCallback(
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

  const updateTreeDecorations = useMutation(api.trees.updateTreeDecorations);
  const removeTreeDecoration = useMutation(api.trees.removeTreeDecoration);

  const screenWidth = Dimensions.get("window").width;
  const treeSize = 180;
  const treeCenter = screenWidth / 2;

  // Helper function to get item count
  const getItemCount = (type: ItemType): number => {
    switch (type) {
      case "leaf":
        return treeData.leaves;
      case "fruit":
        return treeData.fruits;
      case "silverLeaf":
        return treeData.silverLeaves || 0;
      case "goldenLeaf":
        return treeData.goldenLeaves || 0;
      case "apple":
        return treeData.apples || 0;
      case "cherry":
        return treeData.cherries || 0;
      default:
        return 0;
    }
  };

  // Helper function to get appropriate image source
  const getImageSource = (type: ItemType) => {
    switch (type) {
      case "leaf":
      case "silverLeaf":
      case "goldenLeaf":
        return treeImages.leaf;
      case "fruit":
        return treeImages.orange;
      case "apple":
        return treeImages.apple;
      case "cherry":
        return treeImages.cherry;
      default:
        return treeImages.leaf;
    }
  };

  // Returns all possible slot positions for the current stage
  const getSlotPositions = (): SlotPosition[] => {
    const baseX = treeCenter - treeSize / 2;
    const baseY = 20;

    if (treeData.stage === "mediumTree") {
      return [
        { x: baseX + 40, y: baseY + 60, id: "slot1" },
        { x: baseX + 120, y: baseY + 80, id: "slot2" },
      ];
    }

    if (treeData.stage === "grownTree") {
      return [
        { x: baseX + 50, y: baseY + 180, id: "slot1" },
        { x: baseX + 90, y: baseY + 220, id: "slot2" },
        { x: baseX + 90, y: baseY + 185, id: "slot3" },
        { x: baseX + 50, y: baseY + 250, id: "slot4" },
      ];
    }

    return [];
  };

  const canShowInventory =
    treeData.stage === "mediumTree" || treeData.stage === "grownTree";
  const maxAllowed =
    treeData.stage === "mediumTree"
      ? 2
      : treeData.stage === "grownTree"
        ? 4
        : 0;
  const currentDecorations = treeData.decorations?.length ?? 0;

  const handleItemSelect = (type: ItemType) => {
    if (getItemCount(type) === 0) {
      return;
    }
    setSelectedItem(type);
    setShowSlots(true);
    handleCloseBottomSheet();
  };

  const handleSlotSelect = async (slotId: string) => {
    if (!selectedItem) return;

    const slotPositions = getSlotPositions();
    const chosenSlot = slotPositions.find((s) => s.id === slotId);
    if (!chosenSlot) return;

    try {
      const existing = treeData.decorations || [];
      const overlap = existing.some(
        (dec) =>
          Math.abs(dec.position.x - chosenSlot.x) < 20 &&
          Math.abs(dec.position.y - chosenSlot.y) < 20
      );
      if (overlap) {
        Alert.alert("Slot Occupied", "This position is already taken!");
        return;
      }

      if (currentDecorations >= maxAllowed) {
        Alert.alert(
          "Maximum Reached",
          `You can only place ${maxAllowed} decorations on this tree stage.`
        );
        return;
      }

      const decorationPayload: {
        type: ItemType;
        position: { x: number; y: number };
        buff?: { xpMultiplier: number };
      } = {
        type: selectedItem,
        position: { x: chosenSlot.x, y: chosenSlot.y },
      };

      // Set buffs based on item type
      if (selectedItem === "leaf") {
        decorationPayload.buff = { xpMultiplier: 2 };
      } else if (selectedItem === "goldenLeaf") {
        decorationPayload.buff = { xpMultiplier: 3 };
      } else if (selectedItem === "silverLeaf") {
        decorationPayload.buff = { xpMultiplier: 1.5 };
      }

      await updateTreeDecorations({
        duoId: treeData.duoId,
        decoration: decorationPayload,
      });

      setShowSlots(false);
      setSelectedItem(null);
      onInventoryUpdate?.();
    } catch (err: any) {
      Alert.alert("Placement Error", err.message);
    }
  };

  const handleDecorationPress = (index: number) => {
    const decoration = treeData.decorations?.[index];
    if (!decoration) return;

    setSelectedDecoration({
      decoration,
      index,
    });
  };

  const handleRemoveDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      await removeTreeDecoration({
        duoId: treeData.duoId,
        decorationIndex: selectedDecoration.index,
      });
      setSelectedDecoration(null);
      onInventoryUpdate?.();
    } catch (err: any) {
      Alert.alert("Removal Error", err.message);
    }
  };

  const renderSlots = () => {
    if (!showSlots || !selectedItem) return null;

    const slotPositions = getSlotPositions();
    return (
      <View className="absolute top-0 left-0 right-0 bottom-0">
        {slotPositions.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            onPress={() => handleSlotSelect(slot.id)}
            style={{
              position: "absolute",
              left: slot.x - 20,
              top: slot.y - 20,
            }}
            className="w-10 h-10 bg-[rgba(59,130,246,0.9)] rounded-full justify-center items-center border-3 border-[#3b82f6] shadow-lg"
          >
            <Text className="text-white text-xl font-bold">+</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDecorations = () => {
    if (!treeData.decorations) return null;

    return (
      <View className="absolute top-0 left-0 right-0 bottom-0">
        {treeData.decorations.map((decoration, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDecorationPress(index)}
            style={{
              position: "absolute",
              left: decoration.position.x - 25,
              top: decoration.position.y - 25,
            }}
          >
            <View
              className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.9)] border-2 justify-center items-center shadow-lg"
              style={{
                borderColor: itemDefinitions[decoration.type].color,
              }}
            >
              <Image
                source={getImageSource(decoration.type)}
                className="w-8 h-8"
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderInventoryItem = (type: ItemType) => {
    const count = getItemCount(type);
    const itemDef = itemDefinitions[type];
    const isAvailable = count > 0;

    return (
      <TouchableOpacity
        onPress={() => handleItemSelect(type)}
        disabled={!isAvailable}
        className={`border-2 rounded-2xl p-4 mb-3 shadow-sm ${
          isAvailable
            ? "opacity-100"
            : "bg-[#f9fafb] border-[#e5e7eb] opacity-60"
        }`}
        style={
          isAvailable
            ? {
                backgroundColor: itemDef.bgColor,
                borderColor: itemDef.borderColor,
              }
            : undefined
        }
      >
        <View className="flex-row items-center mb-2">
          <View
            className={`w-15 h-15 rounded-full bg-white justify-center items-center mr-4 border-2`}
            style={{ borderColor: itemDef.borderColor }}
          >
            <Image source={getImageSource(type)} className="w-10 h-10" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-[#1f2937] mr-2">
                {itemDef.name}
              </Text>
              <Text className="text-base">{itemDef.icon}</Text>
            </View>
            <Text className="text-sm text-[#6b7280] mb-1">
              {itemDef.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-semibold"
                style={{ color: itemDef.color }}
              >
                Count: {count}
              </Text>
              {isAvailable && (
                <View
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: itemDef.color }}
                >
                  <Text className="text-white text-xs font-semibold">
                    EQUIP
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View
          className="bg-[rgba(255,255,255,0.8)] rounded-lg p-2 border-l-4"
          style={{ borderLeftColor: itemDef.color }}
        >
          <Text
            className="text-xs font-semibold mb-1"
            style={{ color: itemDef.color }}
          >
            ABILITY: {itemDef.ability}
          </Text>
          <Text className="text-xs text-[#6b7280]">
            {itemDef.abilityDescription}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFlatListItem = ({ item }: { item: any }) => {
    if (item.type === "section_header") {
      return (
        <View className="mb-4 mt-2">
          <View className="flex-row items-center mb-4">
            <Text className="text-xl font-bold text-[#1f2937]">
              {item.title}
            </Text>
            <View className="ml-2 bg-[#f3f4f6] px-2 py-1 rounded-full">
              <Text className="text-xs text-[#6b7280] font-medium">
                {item.count} available
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === "item") {
      return <View className="mb-3">{renderInventoryItem(item.itemType)}</View>;
    }

    return null;
  };

  const renderInventorySection = () => {
    const leafTypes: ItemType[] = ["leaf", "silverLeaf", "goldenLeaf"];
    const fruitTypes: ItemType[] = ["fruit", "apple", "cherry"];

    const totalLeaves = leafTypes.reduce(
      (sum, type) => sum + getItemCount(type),
      0
    );
    const totalFruits = fruitTypes.reduce(
      (sum, type) => sum + getItemCount(type),
      0
    );

    // Create flat data structure for FlatList
    const inventoryData = [
      {
        type: "section_header",
        title: "🍊 Fruits",
        count: totalFruits,
        id: "fruits_header",
      },
      ...fruitTypes.map((type) => ({
        type: "item",
        itemType: type,
        id: `fruit_${type}`,
      })),
      {
        type: "section_header",
        title: "🍃 Leaves",
        count: totalLeaves,
        id: "leaves_header",
      },
      ...leafTypes.map((type) => ({
        type: "item",
        itemType: type,
        id: `leaf_${type}`,
      })),
    ];

    return inventoryData;
  };

  const renderEquippedItems = () => {
    if (!treeData.decorations || treeData.decorations.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-5xl mb-4">🌲</Text>
          <Text className="text-lg font-semibold text-[#6b7280] text-center">
            No Items Equipped
          </Text>
          <Text className="text-sm text-[#9ca3af] text-center mt-2">
            Equip items from your inventory to enhance your tree's abilities
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        className="max-h-96"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {treeData.decorations.map((decoration, index) => {
          const itemDef = itemDefinitions[decoration.type];
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDecorationPress(index)}
              className="border-2 rounded-2xl p-4 mb-3 shadow-sm"
              style={{
                backgroundColor: itemDef.bgColor,
                borderColor: itemDef.borderColor,
              }}
            >
              <View className="flex-row items-center mb-2">
                <View
                  className={`w-12 h-12 rounded-full bg-white justify-center items-center mr-4 border-2`}
                  style={{ borderColor: itemDef.borderColor }}
                >
                  <Image
                    source={getImageSource(decoration.type)}
                    className="w-8 h-8"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-bold text-[#1f2937] mr-2">
                      {itemDef.name}
                    </Text>
                    <Text className="text-sm">{itemDef.icon}</Text>
                    <View className="bg-[#10b981] px-2 py-1 rounded-lg ml-2">
                      <Text className="text-white text-xs font-semibold">
                        ACTIVE
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#6b7280]">
                    Position: Slot {index + 1}
                  </Text>
                </View>
              </View>
              <View
                className="bg-[rgba(255,255,255,0.9)] rounded-lg p-3 border-l-4"
                style={{ borderLeftColor: itemDef.color }}
              >
                <Text
                  className="text-xs font-semibold mb-1"
                  style={{ color: itemDef.color }}
                >
                  ACTIVE ABILITY: {itemDef.ability}
                </Text>
                <Text className="text-xs text-[#6b7280] mb-2">
                  {itemDef.abilityDescription}
                </Text>
                {decoration.buff && (
                  <View className="flex-row items-center">
                    <Text className="text-xs text-[#059669] font-semibold">
                      ⚡ XP Multiplier: {decoration.buff.xpMultiplier}x
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  if (!canShowInventory) return null;

  return (
    <>
      {/* Enhanced Inventory Button */}
      <TouchableOpacity
        onPress={handleOpenBottomSheet}
        className="bg-[#3b82f6] rounded-2xl px-5 py-3 mb-4 flex-row items-center justify-center shadow-lg"
      >
        <Text className="text-white text-lg mr-2">🎒</Text>
        <Text className="text-white text-base font-semibold">
          Tree Management
        </Text>
        <View className="bg-[rgba(255,255,255,0.2)] rounded-xl px-2 py-1 ml-2">
          <Text className="text-white text-xs font-semibold">
            {currentDecorations}/{maxAllowed}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Render interactive slots and existing decorations */}
      {renderSlots()}
      {renderDecorations()}

      {/* Enhanced Cancel button */}
      {showSlots && (
        <TouchableOpacity
          onPress={() => {
            setShowSlots(false);
            setSelectedItem(null);
          }}
          className="bg-[#ef4444] rounded-xl px-5 py-3 mb-4 shadow-lg"
        >
          <Text className="text-white text-base font-semibold text-center">
            Cancel Placement
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
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
        {/* Header - Fixed outside of scrollable area */}
        <View className="flex-row justify-between items-center px-6 mb-5 pt-4">
          <View>
            <Text className="text-2xl font-bold text-[#1f2937]">
              Tree Management
            </Text>
            <Text className="text-sm text-[#6b7280] mt-1">
              {treeData.stage} • {currentDecorations}/{maxAllowed} slots used
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCloseBottomSheet}
            className="bg-[#f3f4f6] rounded-full w-10 h-10 justify-center items-center"
          >
            <Text className="text-[#6b7280] text-lg font-bold">×</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Tabs - Fixed outside of scrollable area */}
        <View className="flex-row mx-6 mb-5 bg-[#f8fafc] rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("inventory")}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === "inventory" ? "bg-[#3b82f6]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-base font-semibold ${
                activeTab === "inventory" ? "text-white" : "text-[#6b7280]"
              }`}
            >
              Inventory
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("equipped")}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === "equipped" ? "bg-[#3b82f6]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-base font-semibold ${
                activeTab === "equipped" ? "text-white" : "text-[#6b7280]"
              }`}
            >
              Equipped
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        {activeTab === "inventory" ? (
          <BottomSheetFlatList
            data={renderInventorySection()}
            renderItem={renderFlatListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <BottomSheetFlatList
            data={treeData.decorations || []}
            renderItem={({ item, index }) => {
              const itemDef = itemDefinitions[item.type];
              return (
                <TouchableOpacity
                  onPress={() => handleDecorationPress(index)}
                  className="border-2 rounded-2xl p-4 mb-3 shadow-sm mx-6"
                  style={{
                    backgroundColor: itemDef.bgColor,
                    borderColor: itemDef.borderColor,
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-12 h-12 rounded-full bg-white justify-center items-center mr-4 border-2`}
                      style={{ borderColor: itemDef.borderColor }}
                    >
                      <Image
                        source={getImageSource(item.type)}
                        className="w-8 h-8"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base font-bold text-[#1f2937] mr-2">
                          {itemDef.name}
                        </Text>
                        <Text className="text-sm">{itemDef.icon}</Text>
                        <View className="bg-[#10b981] px-2 py-1 rounded-lg ml-2">
                          <Text className="text-white text-xs font-semibold">
                            ACTIVE
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-[#6b7280]">
                        Position: Slot {index + 1}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="bg-[rgba(255,255,255,0.9)] rounded-lg p-3 border-l-4"
                    style={{ borderLeftColor: itemDef.color }}
                  >
                    <Text
                      className="text-xs font-semibold mb-1"
                      style={{ color: itemDef.color }}
                    >
                      ACTIVE ABILITY: {itemDef.ability}
                    </Text>
                    <Text className="text-xs text-[#6b7280] mb-2">
                      {itemDef.abilityDescription}
                    </Text>
                    {item.buff && (
                      <View className="flex-row items-center">
                        <Text className="text-xs text-[#059669] font-semibold">
                          ⚡ XP Multiplier: {item.buff.xpMultiplier}x
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center p-10 mx-6">
                <Text className="text-5xl mb-4">🌲</Text>
                <Text className="text-lg font-semibold text-[#6b7280] text-center">
                  No Items Equipped
                </Text>
                <Text className="text-sm text-[#9ca3af] text-center mt-2">
                  Equip items from your inventory to enhance your tree's
                  abilities
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => `equipped_${index}`}
            contentContainerStyle={{
              paddingBottom: 100,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Footer - Fixed at bottom */}
        <View className="px-6 py-4 border-t border-[#e5e7eb] bg-white">
          <Text className="text-xs text-[#9ca3af] text-center">
            {activeTab === "inventory"
              ? "Tap an item to equip it on your tree"
              : "Tap equipped items to view details or remove them"}
          </Text>
        </View>
      </BottomSheetModal>

      {/* Decoration Detail Modal */}
      <DecorationDetailModal
        visible={selectedDecoration !== null}
        onClose={() => setSelectedDecoration(null)}
        onRemove={handleRemoveDecoration}
        decoration={selectedDecoration?.decoration || null}
        itemDefinition={
          selectedDecoration?.decoration
            ? itemDefinitions[selectedDecoration.decoration.type]
            : null
        }
        treeImages={treeImages}
        slotIndex={selectedDecoration?.index || 0}
      />
    </>
  );
};

export default TreeInventory;
