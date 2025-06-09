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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import DecorationDetailModal from "./DecorationDetailModal";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { getRarityColors } from "@/utils/rarities";

const treeImages: Record<string, any> = {
  leaf: require("@/assets/hemp-leaf.png"),
  orange: require("@/assets/orange.png"),
  silverLeaf: require("@/assets/hemp-leaf.png"), // Using same image for now
  goldenLeaf: require("@/assets/golden-leaf.png"),
  apple: require("@/assets/orange.png"), // Using orange image as placeholder
  cherry: require("@/assets/orange.png"), // Using orange image as placeholder
  // Add mapping by filename as well
  "hemp-leaf.png": require("@/assets/hemp-leaf.png"),
  "orange.png": require("@/assets/orange.png"),
  "golden-leaf.png": require("@/assets/golden-leaf.png"),
};

interface TreeInventoryProps {
  treeData: {
    duoId: Id<"duoConnections">;
    stage: "tree-1" | "tree-1.5" | "tree-2" | "tree-3" | "tree-4";
    leaves: number;
    fruits: number;
    inventory: Record<string, number>; // Dynamic inventory
    decorations?: Array<{
      itemId: ItemType; // Changed from string to ItemType
      position: { x: number; y: number };
      equipped_at: number;
    }>;
  };
  onInventoryUpdate?: () => void;
}
interface SlotPosition {
  x: number;
  y: number;
  id: string;
}

export type ItemType =
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<{
    decoration: {
      itemId: ItemType;
      position: { x: number; y: number };
      equipped_at: number;
    };
    index: number;
  } | null>(null);

  // Fetch all tree items from database
  const allTreeItems = useQuery(api.treeItems.getAllTreeItems);

  // Create lookup map for quick access
  const itemsById = useMemo(() => {
    if (!allTreeItems) return {};
    return allTreeItems.reduce(
      (acc, item) => {
        acc[item.itemId] = item;
        return acc;
      },
      {} as Record<string, any>
    );
  }, [allTreeItems]);

  // Bottom Sheet Modal refs and configuration
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // Set to single snap point at 90% for maximum height
  const snapPoints = useMemo(() => ["90%"], []);

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

  // Helper function to get item count from dynamic inventory
  const getItemCount = (itemId: string): number => {
    return treeData.inventory[itemId] || 0;
  };

  // Helper function to get appropriate image source
  const getImageSource = (itemId: string) => {
    const item = itemsById[itemId];
    if (!item) return treeImages.leaf; // fallback

    // First try to map by itemId directly
    if (treeImages[itemId]) {
      return treeImages[itemId];
    }

    // Then try to map by imageAsset filename
    if (item.imageAsset && treeImages[item.imageAsset]) {
      return treeImages[item.imageAsset];
    }

    // Legacy mapping for backwards compatibility
    if (item.imageAsset === "orange.png") return treeImages.orange;
    if (item.imageAsset === "hemp-leaf.png") return treeImages.leaf;
    if (item.imageAsset === "golden-leaf.png") return treeImages.goldenLeaf;

    // Category-based fallback
    if (item.category === "fruit") return treeImages.orange;
    if (item.category === "leaf") return treeImages.leaf;

    return treeImages.leaf; // final fallback
  };

  // Returns all possible slot positions for the current stage
  const getSlotPositions = (): SlotPosition[] => {
    const baseX = treeCenter - treeSize / 2;
    const baseY = 20;

    if (treeData.stage === "tree-2") {
      return [
        { x: baseX + 40, y: baseY + 60, id: "slot1" },
        { x: baseX + 120, y: baseY + 80, id: "slot2" },
      ];
    }

    if (treeData.stage === "tree-3") {
      return [
        { x: baseX + 50, y: baseY + 180, id: "slot1" },
        { x: baseX + 90, y: baseY + 220, id: "slot2" },
        { x: baseX + 90, y: baseY + 185, id: "slot3" },
        { x: baseX + 50, y: baseY + 250, id: "slot4" },
      ];
    }

    if (treeData.stage === "tree-4") {
      return [
        { x: baseX + 50, y: baseY + 180, id: "slot1" },
        { x: baseX + 90, y: baseY + 220, id: "slot2" },
        { x: baseX + 90, y: baseY + 185, id: "slot3" },
        { x: baseX + 50, y: baseY + 250, id: "slot4" },
        { x: baseX + 80, y: baseY + 250, id: "slot5" },
        { x: baseX + 70, y: baseY + 300, id: "slot6" },
      ];
    }

    return [];
  };

  const canShowInventory =
    treeData.stage === "tree-2" ||
    treeData.stage === "tree-3" ||
    treeData.stage === "tree-4";
  const maxAllowed =
    treeData.stage === "tree-2"
      ? 2
      : treeData.stage === "tree-3"
        ? 4
        : treeData.stage === "tree-4"
          ? 6
          : 0;
  const currentDecorations = treeData.decorations?.length ?? 0;

  const handleItemSelect = (itemId: string) => {
    if (getItemCount(itemId) === 0) {
      return;
    }
    setSelectedItemId(itemId);
    setShowSlots(true);
    handleCloseBottomSheet();
  };

  const handleSlotSelect = async (slotId: string) => {
    if (!selectedItemId) return;

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

      const decorationPayload = {
        itemId: selectedItemId as ItemType,
        position: { x: chosenSlot.x, y: chosenSlot.y },
      };

      await updateTreeDecorations({
        duoId: treeData.duoId,
        decoration: decorationPayload,
      });

      setShowSlots(false);
      setSelectedItemId(null);
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
    if (!showSlots || !selectedItemId) return null;

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
        {treeData.decorations.map((decoration, index) => {
          const item = itemsById[decoration.itemId];
          if (!item) return null;

          return (
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
                  borderColor: item.color,
                }}
              >
                <Image
                  source={getImageSource(decoration.itemId)}
                  className="w-8 h-8"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderInventoryItem = (itemId: string) => {
    const count = getItemCount(itemId);
    const item = itemsById[itemId];
    if (!item) return null;

    const isAvailable = count > 0;
    const rarityColors = getRarityColors(item.rarity);

    return (
      <TouchableOpacity
        onPress={() => handleItemSelect(itemId)}
        disabled={!isAvailable}
        className={`border-2 rounded-2xl p-4 mb-3 shadow-sm ${
          isAvailable
            ? "opacity-100"
            : "bg-[#f9fafb] border-[#e5e7eb] opacity-60"
        }`}
        style={
          isAvailable
            ? {
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
              }
            : undefined
        }
      >
        <View className="flex-row items-center mb-2">
          <View
            className={`w-15 h-15 rounded-full bg-white justify-center items-center mr-4 border-2`}
            style={{ borderColor: item.borderColor }}
          >
            <Image source={getImageSource(itemId)} className="w-10 h-10" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-[#1f2937] mr-2">
                {item.name}
              </Text>
              <Text className="text-base">{item.icon}</Text>
              {/* Simple rarity text */}
              <Text
                className="text-xs font-medium ml-2 px-2 py-0.5 rounded"
                style={{
                  color: rarityColors.primary,
                  backgroundColor: rarityColors.light,
                }}
              >
                {item.rarity.toUpperCase()}
              </Text>
            </View>
            <Text className="text-sm text-[#6b7280] mb-1">
              {item.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-semibold"
                style={{ color: item.color }}
              >
                Count: {count}
              </Text>
              {isAvailable && (
                <View
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: item.color }}
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
          style={{ borderLeftColor: item.color }}
        >
          <Text
            className="text-xs font-semibold mb-1"
            style={{ color: item.color }}
          >
            ABILITY: {item.ability}
          </Text>
          <Text className="text-xs text-[#6b7280]">
            {item.abilityDescription}
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
      return <View className="mb-3">{renderInventoryItem(item.itemId)}</View>;
    }

    return null;
  };

  const renderInventorySection = () => {
    if (!allTreeItems) return [];

    const leafItems = allTreeItems.filter((item) => item.category === "leaf");
    const fruitItems = allTreeItems.filter((item) => item.category === "fruit");

    const totalLeaves = leafItems.reduce(
      (sum, item) => sum + getItemCount(item.itemId),
      0
    );
    const totalFruits = fruitItems.reduce(
      (sum, item) => sum + getItemCount(item.itemId),
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
      ...fruitItems.map((item) => ({
        type: "item",
        itemId: item.itemId,
        id: `fruit_${item.itemId}`,
      })),
      {
        type: "section_header",
        title: "🍃 Leaves",
        count: totalLeaves,
        id: "leaves_header",
      },
      ...leafItems.map((item) => ({
        type: "item",
        itemId: item.itemId,
        id: `leaf_${item.itemId}`,
      })),
    ];

    return inventoryData;
  };

  if (!canShowInventory) return null;

  return (
    <>
      {/* Enhanced Inventory Button */}
      <TouchableOpacity
        onPress={handleOpenBottomSheet}
        className="bg-[#3b82f6] rounded-xl px-5 py-3 mb-4 flex-row items-center justify-center shadow-lg"
      >
        <Text className="text-white text-lg mr-2">🎒</Text>
        <Text className="text-white text-base font-semibold">Inventory</Text>
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
            setSelectedItemId(null);
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
              const itemData = itemsById[item.itemId];
              if (!itemData) return null;

              return (
                <TouchableOpacity
                  onPress={() => handleDecorationPress(index)}
                  className="border-2 rounded-2xl p-4 mb-3 shadow-sm mx-6"
                  style={{
                    backgroundColor: itemData.bgColor,
                    borderColor: itemData.borderColor,
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-12 h-12 rounded-full bg-white justify-center items-center mr-4 border-2`}
                      style={{ borderColor: itemData.borderColor }}
                    >
                      <Image
                        source={getImageSource(item.itemId)}
                        className="w-8 h-8"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base font-bold text-[#1f2937] mr-2">
                          {itemData.name}
                        </Text>
                        <Text className="text-sm">{itemData.icon}</Text>
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
                    style={{ borderLeftColor: itemData.color }}
                  >
                    <Text
                      className="text-xs font-semibold mb-1"
                      style={{ color: itemData.color }}
                    >
                      ACTIVE ABILITY: {itemData.ability}
                    </Text>
                    <Text className="text-xs text-[#6b7280] mb-2">
                      {itemData.abilityDescription}
                    </Text>
                    {itemData.buffs && (
                      <View className="flex-row items-center">
                        <Text className="text-xs text-[#059669] font-semibold">
                          ⚡ Buffs: {JSON.stringify(itemData.buffs)}
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
        decoration={
          selectedDecoration?.decoration
            ? {
                type: selectedDecoration.decoration.itemId, // Map itemId to type
                position: selectedDecoration.decoration.position,
                buff: selectedDecoration.decoration.itemId.includes("Leaf")
                  ? { xpMultiplier: 1.5 }
                  : undefined,
              }
            : null
        }
        itemDefinition={
          selectedDecoration?.decoration
            ? itemsById[selectedDecoration.decoration.itemId]
            : null
        }
        treeImages={treeImages}
        slotIndex={selectedDecoration?.index || 0}
      />
    </>
  );
};

export default TreeInventory;
