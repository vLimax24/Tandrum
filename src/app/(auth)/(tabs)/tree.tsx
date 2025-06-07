import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
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

const treeImages: Record<string, any> = {
  sprout: require("../../../assets/tree-1.png"),
  smallTree: require("../../../assets/tree-2.png"),
  mediumTree: require("../../../assets/tree-1.png"),
  grownTree: require("../../../assets/tree-1.png"),
  orange: require("../../../assets/orange.png"),
  leaf: require("../../../assets/hemp-leaf.png"),
  calendar: require("../../../assets/calendar.png"),
};

export default function TreeSection() {
  const { user } = useUser();
  const updateTreeStage = useMutation(api.trees.updateTreeStage);

  // Add refresh trigger for inventory updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      : undefined
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
        <Text className="text-text">Loading user…</Text>
      </View>
    );
  if (!connections)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading connections…</Text>
      </View>
    );
  if (connections.length === 0)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">You have no duos yet 🌱</Text>
      </View>
    );
  if (!treeData)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading tree…</Text>
      </View>
    );

  return (
    <LinearGradient
      colors={["#f8fafc", "#dbeafe"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 py-16 px-5">
        <Text className="text-text text-4xl font-semibold mb-2">Tree</Text>
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
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
            decorations: treeData.decorations || [],
          }}
          onInventoryUpdate={handleInventoryUpdate}
        />

        <View className="flex-row justify-between py-4 px-5 rounded-lg mb-6 bg-primary">
          <View className="flex flex-row items-center gap-2">
            <Image
              source={treeImages["leaf"]}
              style={{ width: 20, height: 20 }}
              className="pt-2"
            />
            <Text className="text-background">Leaves: {treeData.leaves}</Text>
          </View>
          <View className="flex flex-row items-center">
            <Image
              source={treeImages["orange"]}
              style={{ width: 30, height: 30 }}
              className="pt-2"
            />
            <Text className="text-background">Fruits: {treeData.fruits}</Text>
          </View>
          <View className="flex flex-row items-center">
            <Image
              source={treeImages["sprout"]}
              style={{ width: 30, height: 30 }}
              className="pt-2"
            />
            <Text className="text-background">Decay: {treeData.decay}</Text>
          </View>
        </View>
        <LevelDisplay duo={selectedConnection} />
        <View className="mb-16">
          <Text className="text-2xl font-semibold text-text mb-2">
            Growth Log:
          </Text>
          {treeData.growth_log.length > 0 ? (
            Object.entries(groupedGrowthLog).map(([dateStr, logs]) => (
              <View key={dateStr} className="mb-4">
                <TouchableOpacity
                  onPress={() => toggleCollapse(dateStr)}
                  className="flex-row items-center mb-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-md font-bold text-text mr-2">
                    {dateStr}
                  </Text>
                  <Text className="text-lg">
                    {collapsedDates[dateStr] ? "▼" : "▲"}
                  </Text>
                </TouchableOpacity>
                {!collapsedDates[dateStr] &&
                  logs.map(({ idx, change }) => (
                    <View
                      key={idx}
                      className="bg-[#f9f9f9] p-3 rounded-lg mb-2 flex-row items-center w-full"
                    >
                      <Image
                        source={treeImages["calendar"]}
                        style={{ width: 20, height: 20 }}
                        className="mr-3"
                      />
                      <View>
                        <Text className="text-sm text-gray-600">{change}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            ))
          ) : (
            <View className="bg-white p-4 rounded-lg shadow items-center">
              <Text className="text-text">No growth yet 🌱</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
