import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import DecorationDetailBottomSheet from "./DecorationDetailBottomSheet";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { getRarityColors } from "@/utils/rarities";
import { treeImages } from "@/utils/treeImages";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { AlertModal } from "@/components/AlertModal";

interface TreeInventoryProps {
  treeData: {
    duoId: Id<"duoConnections">;
    stage: "tree-1" | "tree-1.5" | "tree-2" | "tree-3" | "tree-4";
    leaves: number;
    fruits: number;
    inventory: Record<string, number>;
    decorations?: Array<{
      itemId: string;
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

const TreeInventory: React.FC<TreeInventoryProps> = ({
  treeData,
  onInventoryUpdate,
}) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const [activeTab, setActiveTab] = useState<"inventory" | "equipped">(
    "inventory"
  );
  const [showSlots, setShowSlots] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<{
    decoration: {
      itemId: string;
      position: { x: number; y: number };
      equipped_at: number;
    };
    index: number;
  } | null>(null);

  const decorationBottomSheetRef = useRef<BottomSheetModal>(null);
  // Fetch all tree items from database
  const allTreeItems = useQuery(api.treeItems.getAllTreeItems);

  const treeLabels = {
    "tree-1": "Sprout",
    "tree-2": "Small Tree",
    "tree-3": "Medium Tree",
    "tree-4": "Grown Tree",
  };

  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

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

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
    icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
    iconColor?: string
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        style={{ backgroundColor: isDarkMode ? "#000000" : "#64748b" }}
      />
    ),
    [isDarkMode]
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
        { x: baseX + 20, y: baseY + 70, id: "slot1" },
        { x: baseX + 170, y: baseY + 110, id: "slot2" },
        { x: baseX + 110, y: baseY + 75, id: "slot3" },
        { x: baseX - 40, y: baseY + 140, id: "slot4" },
        { x: baseX + 190, y: baseY + 190, id: "slot5" },
        { x: baseX - 50, y: baseY + 210, id: "slot6" },
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
        showAlert(
          "Slot Occupied",
          "This position is already taken!",
          [{ text: "OK", style: "default" }],
          "warning",
          "#f59e0b"
        );
        return;
      }

      if (currentDecorations >= maxAllowed) {
        showAlert(
          "Maximum Reached",
          `You can only place ${maxAllowed} decorations on this tree stage.`,
          [{ text: "OK", style: "default" }],
          "information-circle",
          "#3b82f6"
        );
        return;
      }

      const decorationPayload = {
        itemId: selectedItemId,
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
      showAlert(
        "Placement Error",
        err.message,
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
    }
  };

  const handleDecorationPress = (index: number) => {
    const decoration = treeData.decorations?.[index];
    if (!decoration) return;

    setSelectedDecoration({
      decoration,
      index,
    });

    // Open the decoration bottom sheet
    decorationBottomSheetRef.current?.present();
  };

  const handleRemoveDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      await removeTreeDecoration({
        duoId: treeData.duoId,
        decorationIndex: selectedDecoration.index,
      });

      // Close the bottom sheet and clear selection
      decorationBottomSheetRef.current?.dismiss();
      setSelectedDecoration(null);
      onInventoryUpdate?.();
    } catch (err: any) {
      showAlert(
        "Removal Error",
        err.message,
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
    }
  };

  const handleCloseDecorationBottomSheet = () => {
    decorationBottomSheetRef.current?.dismiss();
    setSelectedDecoration(null);
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
            className="w-10 h-10 rounded-full justify-center items-center border-2"
            style={{
              backgroundColor: `${theme.colors.primary}CC`,
              borderColor: theme.colors.primary,
              position: "absolute",
              left: slot.x - 20,
              top: slot.y - 20,
            }}
          >
            <Text className="text-white text-xl font-bold font-mainRegular">
              +
            </Text>
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
              <BlurView
                intensity={80}
                tint={isDarkMode ? "dark" : "light"}
                className="w-16 h-16 rounded-full border-2 justify-center items-center overflow-hidden"
                style={{
                  borderColor: item.color,
                }}
              >
                <Image
                  source={getImageSource(decoration.itemId)}
                  className="w-12 h-12"
                />
              </BlurView>
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
        className="rounded-2xl p-4 mb-3 border overflow-hidden"
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: isAvailable ? item.borderColor : theme.colors.cardBorder,
          opacity: isAvailable ? 1 : 0.5,
        }}
      >
        <View className="flex-row items-center gap-4 mb-3">
          <View
            className="w-14 h-14 rounded-full justify-center items-center border-2"
            style={{
              backgroundColor: theme.colors.glass,
              borderColor: item.borderColor,
            }}
          >
            <Image source={getImageSource(itemId)} className="w-10 h-10" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                className="text-lg font-bold font-mainRegular"
                style={{ color: theme.colors.text.primary }}
              >
                {item.name}
              </Text>
              <Text className="text-base font-mainRegular">{item.icon}</Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: rarityColors.light,
                }}
              >
                <Text
                  className="text-xs font-medium font-mainRegular"
                  style={{ color: rarityColors.primary }}
                >
                  {item.rarity.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text
              className="text-sm mb-2 font-mainRegular"
              style={{ color: theme.colors.text.secondary }}
            >
              {item.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-semibold font-mainRegular"
                style={{ color: item.color }}
              >
                Count: {count}
              </Text>
              {isAvailable && (
                <View
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Text className="text-white text-xs font-semibold font-mainRegular">
                    EQUIP
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <BlurView
          intensity={40}
          tint={isDarkMode ? "dark" : "light"}
          className="rounded-xl p-3 border-l-4 overflow-hidden"
          style={{ borderLeftColor: item.color }}
        >
          <Text
            className="text-xs font-semibold mb-1 font-mainRegular"
            style={{ color: item.color }}
          >
            ABILITY: {item.ability}
          </Text>
          <Text
            className="text-xs font-mainRegular"
            style={{ color: theme.colors.text.secondary }}
          >
            {item.abilityDescription}
          </Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderFlatListItem = ({ item }: { item: any }) => {
    if (item.type === "section_header") {
      return (
        <View className="mb-4 mt-2">
          <View className="flex-row items-center gap-3 mb-4">
            <Text
              className="text-xl font-bold font-mainRegular"
              style={{ color: theme.colors.text.primary }}
            >
              {item.title}
            </Text>
            <BlurView
              intensity={60}
              tint={isDarkMode ? "dark" : "light"}
              className="px-3 py-1 rounded-full overflow-hidden"
            >
              <Text
                className="text-xs font-medium font-mainRegular"
                style={{ color: theme.colors.text.secondary }}
              >
                {item.count} available
              </Text>
            </BlurView>
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

    // Filter items to only show those that exist in the user's inventory (unlocked items)
    const unlockedItems = allTreeItems.filter((item) =>
      treeData.inventory.hasOwnProperty(item.itemId)
    );

    const leafItems = unlockedItems.filter((item) => item.category === "leaf");
    const fruitItems = unlockedItems.filter(
      (item) => item.category === "fruit"
    );

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
        className="rounded-2xl p-4 flex-row items-center justify-center w-full overflow-hidden"
        style={{ backgroundColor: theme.colors.cardBackground }}
      >
        <BlurView
          intensity={80}
          tint={isDarkMode ? "dark" : "light"}
          className="absolute inset-0"
        />
        <Text className="text-lg mr-3 font-mainRegular">🎒</Text>
        <Text
          className="text-base font-semibold font-mainRegular"
          style={{ color: theme.colors.text.primary }}
        >
          Tree Inventory
        </Text>
        <View
          className="rounded-xl px-3 py-1 ml-3"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <Text className="text-white text-xs font-semibold font-mainRegular">
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
          className="rounded-2xl p-4 mb-4 overflow-hidden w-full"
          style={{ backgroundColor: "#ef4444" }}
        >
          <Text className="text-white text-base font-semibold text-center font-mainRegular">
            ✕ Cancel Placement
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
          backgroundColor: theme.colors.text.tertiary,
          width: 40,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.background[1],
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        {/* Header - Fixed outside of scrollable area */}
        <View className="flex-row justify-between items-center px-6 mb-5 pt-4 pb-4">
          <View>
            <Text
              className="text-2xl font-bold font-mainRegular"
              style={{ color: theme.colors.text.primary }}
            >
              Tree Management
            </Text>
            <Text
              className="text-sm mt-1 font-mainRegular"
              style={{ color: theme.colors.text.secondary }}
            >
              {treeLabels[treeData.stage]} • {currentDecorations}/{maxAllowed}{" "}
              slots used
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCloseBottomSheet}
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: theme.colors.glass }}
          >
            <Text
              className="text-lg font-bold font-mainRegular"
              style={{ color: theme.colors.text.secondary }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Tabs - Fixed outside of scrollable area */}
        <View
          className="flex-row mx-6 mb-5 rounded-2xl p-1 overflow-hidden"
          style={{ backgroundColor: theme.colors.glass }}
        >
          <BlurView
            intensity={60}
            tint={isDarkMode ? "dark" : "light"}
            className="absolute inset-0"
          />
          <TouchableOpacity
            onPress={() => setActiveTab("inventory")}
            className="flex-1 py-3 px-4 rounded-xl overflow-hidden"
            style={{
              backgroundColor:
                activeTab === "inventory"
                  ? theme.colors.primary
                  : "transparent",
            }}
          >
            <Text
              className="text-center text-base font-semibold font-mainRegular"
              style={{
                color:
                  activeTab === "inventory"
                    ? "#ffffff"
                    : theme.colors.text.secondary,
              }}
            >
              Inventory
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("equipped")}
            className="flex-1 py-3 px-4 rounded-xl overflow-hidden"
            style={{
              backgroundColor:
                activeTab === "equipped" ? theme.colors.primary : "transparent",
            }}
          >
            <Text
              className="text-center text-base font-semibold font-mainRegular"
              style={{
                color:
                  activeTab === "equipped"
                    ? "#ffffff"
                    : theme.colors.text.secondary,
              }}
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
              paddingBottom: 120,
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
                  className="rounded-2xl p-4 mb-3 mx-6 border overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: itemData.borderColor,
                  }}
                >
                  <View className="flex-row items-center gap-4 mb-3">
                    <View
                      className="w-12 h-12 rounded-full justify-center items-center border-2"
                      style={{
                        backgroundColor: theme.colors.glass,
                        borderColor: itemData.borderColor,
                      }}
                    >
                      <Image
                        source={getImageSource(item.itemId)}
                        className="w-8 h-8"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text
                          className="text-base font-bold font-mainRegular"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {itemData.name}
                        </Text>
                        <Text className="text-sm font-mainRegular">
                          {itemData.icon}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-lg"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          <Text className="text-white text-xs font-semibold font-mainRegular">
                            ⚡ ACTIVE
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="text-xs font-mainRegular"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Position: Slot {index + 1}
                      </Text>
                    </View>
                  </View>
                  <BlurView
                    intensity={40}
                    tint={isDarkMode ? "dark" : "light"}
                    className="rounded-xl p-3 border-l-4 overflow-hidden"
                    style={{ borderLeftColor: itemData.color }}
                  >
                    <Text
                      className="text-xs font-semibold mb-1 font-mainRegular"
                      style={{ color: itemData.color }}
                    >
                      ACTIVE ABILITY: {itemData.ability}
                    </Text>
                    <Text
                      className="text-xs mb-2 font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {itemData.abilityDescription}
                    </Text>
                    {itemData.buffs && (
                      <View className="flex-row items-center">
                        <Text
                          className="text-xs font-semibold font-mainRegular"
                          style={{ color: theme.colors.primary }}
                        >
                          ⚡ Buffs: {itemData.buffs.xpMultiplier}x Multiplier{" "}
                          {itemData.buffs.dailyBonus && [
                            ", +",
                            itemData.buffs.dailyBonus,
                            "Bonus Daily XP",
                          ]}
                        </Text>
                      </View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center p-10 mx-6">
                <View
                  className="w-20 h-20 rounded-full justify-center items-center mb-4"
                  style={{ backgroundColor: theme.colors.glass }}
                >
                  <Text className="text-4xl font-mainRegular">🌲</Text>
                </View>
                <Text
                  className="text-lg font-semibold text-center font-mainRegular"
                  style={{ color: theme.colors.text.primary }}
                >
                  No Items Equipped
                </Text>
                <Text
                  className="text-sm text-center mt-2 font-mainRegular"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Equip items from your inventory to enhance your tree's
                  abilities and unlock new growth potential
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => `equipped_${index}`}
            contentContainerStyle={{
              paddingBottom: 120,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Footer - Fixed at bottom */}
        <BlurView
          intensity={80}
          tint={isDarkMode ? "dark" : "light"}
          className="px-6 py-4 border-t"
          style={{ borderTopColor: theme.colors.cardBorder }}
        >
          <Text
            className="text-xs text-center font-mainRegular"
            style={{ color: theme.colors.text.tertiary }}
          >
            {activeTab === "inventory"
              ? "💡 Tap an item to equip it on your tree and boost your growth"
              : "🔧 Tap equipped items to view details or remove them"}
          </Text>
        </BlurView>
      </BottomSheetModal>

      {/* Decoration Detail Modal */}
      <DecorationDetailBottomSheet
        ref={decorationBottomSheetRef}
        onClose={handleCloseDecorationBottomSheet}
        onRemove={handleRemoveDecoration}
        decoration={
          selectedDecoration?.decoration
            ? {
                type: selectedDecoration.decoration.itemId,
                position: selectedDecoration.decoration.position,
                buff: itemsById[selectedDecoration.decoration.itemId]?.buffs
                  ? {
                      xpMultiplier:
                        itemsById[selectedDecoration.decoration.itemId].buffs
                          .xpMultiplier,
                    }
                  : undefined,
              }
            : null
        }
        itemDefinition={
          selectedDecoration?.decoration
            ? itemsById[selectedDecoration.decoration.itemId]
            : null
        }
        slotIndex={selectedDecoration?.index || 0}
      />
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
};

export default TreeInventory;
