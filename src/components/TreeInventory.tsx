// TreeInventory.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

const treeImages: Record<string, any> = {
  leaf: require("../../src/assets/ShowcaseLeaf.png"),
  orange: require("../../src/assets/orange.png"),
};

// Enhanced item definitions with abilities and descriptions
const itemDefinitions = {
  leaf: {
    name: "Mystical Leaf",
    description: "A shimmering leaf that enhances learning potential",
    ability: "Double XP Boost",
    abilityDescription: "Multiplies all XP gained by 2x while active",
    rarity: "common",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "🍃",
  },
  fruit: {
    name: "Golden Orange",
    description: "A radiant fruit that provides sustained energy",
    ability: "Energy Sustain",
    abilityDescription: "Maintains motivation levels for extended periods",
    rarity: "rare",
    color: "#ea580c",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: "🍊",
  },
};

interface TreeInventoryProps {
  treeData: {
    duoId: Id<"duoConnections">;
    stage: "sprout" | "smallTree" | "mediumTree" | "grownTree";
    leaves: number;
    fruits: number;
    decorations?: Array<{
      type: "leaf" | "fruit";
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

const TreeInventory: React.FC<TreeInventoryProps> = ({
  treeData,
  onInventoryUpdate,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "equipped">(
    "inventory"
  );
  const [showSlots, setShowSlots] = useState(false);
  const [selectedItem, setSelectedItem] = useState<"leaf" | "fruit" | null>(
    null
  );
  const [selectedDecoration, setSelectedDecoration] = useState<number | null>(
    null
  );

  const updateTreeDecorations = useMutation(api.trees.updateTreeDecorations);
  const removeTreeDecoration = useMutation(api.trees.removeTreeDecoration);

  const screenWidth = Dimensions.get("window").width;
  const treeSize = 180;
  const treeCenter = screenWidth / 2;

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

  const handleItemSelect = (type: "leaf" | "fruit") => {
    if (
      (type === "leaf" && treeData.leaves === 0) ||
      (type === "fruit" && treeData.fruits === 0)
    ) {
      return;
    }
    setSelectedItem(type);
    setShowSlots(true);
    setShowInventory(false);
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
        type: "leaf" | "fruit";
        position: { x: number; y: number };
        buff?: { xpMultiplier: number };
      } = {
        type: selectedItem,
        position: { x: chosenSlot.x, y: chosenSlot.y },
      };

      if (selectedItem === "leaf") {
        decorationPayload.buff = { xpMultiplier: 2 };
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

    const itemDef = itemDefinitions[decoration.type];

    Alert.alert(
      `${itemDef.name} ${itemDef.icon}`,
      `${itemDef.description}\n\nActive Ability: ${itemDef.ability}\n${itemDef.abilityDescription}\n\nWould you like to remove this decoration?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTreeDecoration({
                duoId: treeData.duoId,
                decorationIndex: index,
              });
              onInventoryUpdate?.();
            } catch (err: any) {
              Alert.alert("Removal Error", err.message);
            }
          },
        },
      ]
    );
  };

  const renderSlots = () => {
    if (!showSlots || !selectedItem) return null;

    const slotPositions = getSlotPositions();
    return (
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {slotPositions.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            onPress={() => handleSlotSelect(slot.id)}
            style={{
              position: "absolute",
              left: slot.x - 20,
              top: slot.y - 20,
              width: 40,
              height: 40,
              backgroundColor: "rgba(59, 130, 246, 0.9)",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 3,
              borderColor: "#3b82f6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
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
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
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
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderWidth: 2,
                borderColor: itemDefinitions[decoration.type].color,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Image
                source={
                  decoration.type === "leaf"
                    ? treeImages.leaf
                    : treeImages.orange
                }
                style={{ width: 30, height: 30 }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderInventoryItem = (type: "leaf" | "fruit") => {
    const count = type === "leaf" ? treeData.leaves : treeData.fruits;
    const itemDef = itemDefinitions[type];
    const isAvailable = count > 0;

    return (
      <TouchableOpacity
        onPress={() => handleItemSelect(type)}
        disabled={!isAvailable}
        style={{
          backgroundColor: isAvailable ? itemDef.bgColor : "#f9fafb",
          borderColor: isAvailable ? itemDef.borderColor : "#e5e7eb",
          borderWidth: 2,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          opacity: isAvailable ? 1 : 0.6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
              borderWidth: 2,
              borderColor: itemDef.borderColor,
            }}
          >
            <Image
              source={type === "leaf" ? treeImages.leaf : treeImages.orange}
              style={{ width: 40, height: 40 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginRight: 8,
                }}
              >
                {itemDef.name}
              </Text>
              <Text style={{ fontSize: 16 }}>{itemDef.icon}</Text>
            </View>
            <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
              {itemDef.description}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: itemDef.color,
                }}
              >
                Count: {count}
              </Text>
              {isAvailable && (
                <View
                  style={{
                    backgroundColor: itemDef.color,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "600" }}
                  >
                    EQUIP
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 8,
            padding: 8,
            borderLeftWidth: 4,
            borderLeftColor: itemDef.color,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: itemDef.color,
              marginBottom: 2,
            }}
          >
            ABILITY: {itemDef.ability}
          </Text>
          <Text style={{ fontSize: 11, color: "#6b7280" }}>
            {itemDef.abilityDescription}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEquippedItems = () => {
    if (!treeData.decorations || treeData.decorations.length === 0) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌲</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            No Items Equipped
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9ca3af",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Equip items from your inventory to enhance your tree's abilities
          </Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {treeData.decorations.map((decoration, index) => {
          const itemDef = itemDefinitions[decoration.type];
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDecorationPress(index)}
              style={{
                backgroundColor: itemDef.bgColor,
                borderColor: itemDef.borderColor,
                borderWidth: 2,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                    borderWidth: 2,
                    borderColor: itemDef.borderColor,
                  }}
                >
                  <Image
                    source={
                      decoration.type === "leaf"
                        ? treeImages.leaf
                        : treeImages.orange
                    }
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginRight: 8,
                      }}
                    >
                      {itemDef.name}
                    </Text>
                    <Text style={{ fontSize: 14 }}>{itemDef.icon}</Text>
                    <View
                      style={{
                        backgroundColor: "#10b981",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontWeight: "600",
                        }}
                      >
                        ACTIVE
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    Position: Slot {index + 1}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 8,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: itemDef.color,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: itemDef.color,
                    marginBottom: 4,
                  }}
                >
                  ACTIVE ABILITY: {itemDef.ability}
                </Text>
                <Text
                  style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}
                >
                  {itemDef.abilityDescription}
                </Text>
                {decoration.buff && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#059669",
                        fontWeight: "600",
                      }}
                    >
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
        onPress={() => setShowInventory(true)}
        style={{
          backgroundColor: "#3b82f6",
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 12,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, marginRight: 8 }}>🎒</Text>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Tree Management
        </Text>
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
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
          style={{
            backgroundColor: "#ef4444",
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Cancel Placement
          </Text>
        </TouchableOpacity>
      )}

      {/* Enhanced Inventory Modal */}
      <Modal
        visible={showInventory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInventory(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View
            style={{
              flex: 1,
              marginTop: 60,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 24,
                marginBottom: 20,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}
                >
                  Tree Management
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
                  {treeData.stage} • {currentDecorations}/{maxAllowed} slots
                  used
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowInventory(false)}
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#6b7280", fontSize: 18, fontWeight: "bold" }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced Tabs */}
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 24,
                marginBottom: 20,
                backgroundColor: "#f8fafc",
                borderRadius: 12,
                padding: 4,
              }}
            >
              <TouchableOpacity
                onPress={() => setActiveTab("inventory")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor:
                    activeTab === "inventory" ? "#3b82f6" : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    color: activeTab === "inventory" ? "white" : "#6b7280",
                  }}
                >
                  Inventory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("equipped")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor:
                    activeTab === "equipped" ? "#3b82f6" : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    color: activeTab === "equipped" ? "white" : "#6b7280",
                  }}
                >
                  Equipped
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
              {activeTab === "inventory" ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {renderInventoryItem("leaf")}
                  {renderInventoryItem("fruit")}
                </ScrollView>
              ) : (
                renderEquippedItems()
              )}
            </View>

            {/* Footer */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}
              >
                {activeTab === "inventory"
                  ? "Tap an item to equip it on your tree"
                  : "Tap equipped items to view details or remove them"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TreeInventory;
