import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Id } from "convex/_generated/dataModel";
import { getTreeStageForLevel, getLevelData } from "@/utils/level";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import TreeInventory from "@/components/TreeInventory";
import { LinearGradient } from "expo-linear-gradient";
import { NoDuoScreen } from "@/components/NoDuoScreen";
import { ItemType } from "@/components/TreeInventory";

const treeImages: Record<string, any> = {
  "tree-1": require("../../../assets/tree-1.png"),
  "tree-2": require("../../../assets/tree-2.png"),
  "tree-3": require("../../../assets/tree-1.png"),
  "tree-4": require("../../../assets/tree-1.png"),
  orange: require("../../../assets/orange.png"),
  leaf: require("../../../assets/hemp-leaf.png"),
  calendar: require("../../../assets/calendar.png"),
};

export default function TreeSection() {
  const { user } = useUser();
  const updateTreeStage = useMutation(api.trees.updateTreeStage);

  // Add refresh trigger for inventory updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const clerkId = user?.id;
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : undefined
  );
  const userId = convexUser?._id;
  const connections = useQuery(
    api.duoConnections.getConnectionsForUser,
    userId ? { userId } : undefined
  );
  const { selectedIndex, setSelectedIndex } = useDuo();

  useEffect(() => {
    if (connections && selectedIndex >= connections.length) {
      setSelectedIndex(0);
    }
  }, [connections]);

  const selectedConnection = connections?.[selectedIndex];
  const treeData = useQuery(
    api.trees.getTreeForDuo,
    selectedConnection
      ? { duoId: selectedConnection._id as Id<"duoConnections"> }
      : "skip"
  );

  useEffect(() => {
    if (!treeData || !selectedConnection) return;
    const currentTrust = selectedConnection.trust_score ?? 0;
    const { level } = getLevelData(currentTrust);
    const expectedStage = getTreeStageForLevel(level);
    if (treeData.stage !== expectedStage) {
      updateTreeStage({ duoId: selectedConnection._id });
    }
  }, [treeData, selectedConnection, updateTreeStage]);

  const groupedGrowthLog = useMemo(() => {
    const grouped: Record<string, { idx: number; change: string }[]> = {};
    treeData?.growth_log.forEach((entry, i) => {
      const [date, { change }] = Object.entries(entry)[0];
      const dateStr = new Date(date).toLocaleDateString("de-DE");
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push({ idx: i, change });
    });
    return grouped;
  }, [treeData]);

  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (!treeData || treeData.growth_log.length === 0) return;
    const dates = treeData.growth_log.map((entry) => {
      const [date] = Object.entries(entry)[0];
      return new Date(date).toLocaleDateString("de-DE");
    });
    const uniqueDates = Array.from(new Set(dates));
    const latestDate = uniqueDates[uniqueDates.length - 1];
    const collapsedState: Record<string, boolean> = {};
    uniqueDates.forEach((date) => {
      collapsedState[date] = date === latestDate;
    });
    setCollapsedDates(collapsedState);
  }, [treeData]);

  const toggleCollapse = (dateStr: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  // Handler for inventory updates
  const handleInventoryUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Reset refresh trigger after a short delay
    setTimeout(() => setRefreshTrigger(0), 2000);
  };

  if (!convexUser)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text font-mainRegular">Loading user…</Text>
      </View>
    );
  if (!connections)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text font-mainRegular">Loading connections…</Text>
      </View>
    );
  if (connections.length === 0)
    return (
      <NoDuoScreen
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    );
  if (!treeData)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text font-mainRegular">Loading tree…</Text>
      </View>
    );

  return (
    <LinearGradient
      colors={["#f8fafc", "#dbeafe"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 py-16 px-5"
        style={{ zIndex: 1 }} // Add this to ensure content is behind bottom sheet
      >
        <Text className="text-text text-4xl font-semibold mb-2 font-mainRegular">
          Tree
        </Text>
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2 font-mainRegular">
            Select Duo
          </Text>
          <View className="bg-primary rounded-lg px-4 py-2 flex-row items-center">
            <Image
              source={treeImages["leaf"]}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <View
              style={{
                flex: 1,
                position: "relative",
                justifyContent: "center",
              }}
            >
              <RNPickerSelect
                onValueChange={setSelectedIndex}
                placeholder={{}}
                value={selectedIndex}
                items={connections.map((c, i) => ({
                  label: `Duo with ${c.partnerName}`,
                  value: i,
                }))}
                useNativeAndroidPickerStyle={false}
                style={{
                  inputIOS: {
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    paddingRight: 32,
                    paddingLeft: 8,
                    borderRadius: 8,
                    backgroundColor: "transparent",
                  },
                  inputAndroid: {
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "500",
                    paddingVertical: 10,
                    paddingRight: 32,
                    paddingLeft: 8,
                    borderRadius: 8,
                    backgroundColor: "transparent",
                  },
                  iconContainer: {
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    marginTop: -12,
                  },
                }}
                Icon={() => (
                  <Text style={{ color: "#fff", fontSize: 18 }}>▼</Text>
                )}
              />
            </View>
          </View>
        </View>

        {/* Tree Display with Inventory Integration */}
        <View className="items-center mb-6 relative">
          <Image
            source={treeImages[treeData.stage]}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
          {/* TreeInventory component will render slots and decorations over the tree */}
        </View>

        {/* Tree Inventory Component */}
        <TreeInventory
          treeData={{
            duoId: selectedConnection._id as Id<"duoConnections">,
            stage: treeData.stage,
            leaves: treeData.leaves,
            fruits: treeData.fruits,
            inventory: treeData.inventory || {},
            decorations: (treeData.decorations || []).map((decoration) => ({
              ...decoration,
              itemId: decoration.itemId as ItemType,
            })),
          }}
          onInventoryUpdate={handleInventoryUpdate}
        />

        <View
          className="flex-row justify-between py-4 px-5 rounded-lg mb-6 bg-primary"
          style={{ zIndex: 1 }}
        >
          <View className="flex flex-row items-center gap-2">
            <Image
              source={treeImages["leaf"]}
              style={{ width: 20, height: 20 }}
              className="pt-2"
            />
            <Text className="text-background font-mainRegular">
              Leaves: {treeData.leaves}
            </Text>
          </View>
          <View className="flex flex-row items-center">
            <Image
              source={treeImages["orange"]}
              style={{ width: 30, height: 30 }}
              className="pt-2"
            />
            <Text className="text-background font-mainRegular">
              Fruits: {treeData.fruits}
            </Text>
          </View>
          <View className="flex flex-row items-center">
            <Image
              source={treeImages["sprout"]}
              style={{ width: 30, height: 30 }}
              className="pt-2"
            />
            <Text className="text-background font-mainRegular">
              Decay: {treeData.decay}
            </Text>
          </View>
        </View>
        <View style={{ zIndex: 1 }}>
          <LevelDisplay duo={selectedConnection} />
        </View>

        {/* Growth Log - Add z-index */}
        <View className={`mb-20 mt-10`} style={{ zIndex: 1 }}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-1 font-mainRegular">
              Growth Activity
            </Text>
            <Text className="text-sm text-gray-500 font-mainRegular">
              Track your duo's progress and milestones
            </Text>
          </View>

          {treeData.growth_log.length > 0 ? (
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {Object.entries(groupedGrowthLog).map(
                ([dateStr, logs], index) => (
                  <View key={dateStr}>
                    {/* Date Header */}
                    <TouchableOpacity
                      onPress={() => toggleCollapse(dateStr)}
                      className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex-row items-center justify-between"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <Text className="text-base font-semibold text-gray-900 font-mainRegular">
                          {dateStr}
                        </Text>
                        <View className="ml-3 px-2 py-1 bg-gray-200 rounded-full">
                          <Text className="text-xs font-medium text-gray-600 font-mainRegular">
                            {logs.length}{" "}
                            {logs.length === 1 ? "activity" : "activities"}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-400 mr-2 font-mainRegular">
                          {collapsedDates[dateStr] ? "Show" : "Hide"}
                        </Text>
                        <View
                          className="w-6 h-6 rounded-full bg-white border border-gray-200 items-center justify-center"
                          style={{
                            transform: [
                              {
                                rotate: collapsedDates[dateStr]
                                  ? "0deg"
                                  : "180deg",
                              },
                            ],
                          }}
                        >
                          <Text className="text-gray-400 text-xs">▼</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Activity Items */}
                    {!collapsedDates[dateStr] && (
                      <View className="px-6 py-2">
                        {logs.map(({ idx, change }, logIndex) => (
                          <View
                            key={idx}
                            className={`py-4 flex-row items-start ${
                              logIndex !== logs.length - 1
                                ? "border-b border-gray-50"
                                : ""
                            }`}
                          >
                            {/* Timeline Indicator */}
                            <View className="mr-4 mt-1">
                              <View className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-200 items-center justify-center">
                                <Image
                                  source={treeImages["leaf"]}
                                  style={{ width: 14, height: 14 }}
                                  className="tint-green-600"
                                />
                              </View>
                            </View>

                            {/* Activity Content */}
                            <View className="flex-1">
                              <Text className="text-sm font-medium text-gray-900 leading-5 mb-1 font-mainRegular">
                                {change}
                              </Text>
                              <View className="flex-row items-center">
                                <View className="w-1 h-1 bg-gray-300 rounded-full mr-2" />
                                <Text className="text-xs text-gray-500 font-mainRegular">
                                  Activity #{idx + 1}
                                </Text>
                              </View>
                            </View>

                            {/* Status Indicator */}
                            <View className="ml-3">
                              <View className="px-2 py-1 bg-green-50 rounded-md">
                                <Text className="text-xs font-medium text-green-700 font-mainRegular">
                                  Complete
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )
              )}
            </View>
          ) : (
            // Empty State - Professional Design
            <View className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <View className="px-8 py-12 items-center">
                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl font-mainRegular">🌱</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2 font-mainRegular">
                  No Activity Yet
                </Text>
                <Text className="text-sm text-gray-500 text-center leading-5 max-w-xs font-mainRegular">
                  Your growth journey will appear here as you and your duo
                  interact and build trust together.
                </Text>
                <View className="mt-6 px-4 py-2 bg-gray-50 rounded-lg">
                  <Text className="text-xs font-medium text-gray-600 font-mainRegular">
                    Start engaging to see your first activity!
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
