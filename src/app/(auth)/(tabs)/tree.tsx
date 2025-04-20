import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Id } from "convex/_generated/dataModel";
import { getTreeStageForLevel, getLevelData } from "@/utils/level";

const treeImages: Record<string, any> = {
  sprout: require("../../../assets/Sprout.png"),
  smallTree: require("../../../assets/Baum-Klein.png"),
  mediumTree: require("../../../assets/Sprout.png"),
  grownTree: require("../../../assets/Sprout.png"),
};

export default function TreeSection() {
  const { user } = useUser();
  const updateTreeStage = useMutation(api.trees.updateTreeStage);

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

  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Check if the tree stage matches the level, update if not
  useEffect(() => {
    if (!treeData || !selectedConnection) return;

    const currentTrust = selectedConnection.trust_score ?? 0;
    const { level } = getLevelData(currentTrust);
    const expectedStage = getTreeStageForLevel(level);

    if (treeData.stage !== expectedStage) {
      updateTreeStage({ duoId: selectedConnection._id });
    }
  }, [treeData, selectedConnection, updateTreeStage]);

  // Conditional UI rendering
  if (!convexUser) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading user…</Text>
      </View>
    );
  }

  if (!connections) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading connections…</Text>
      </View>
    );
  }

  if (connections.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">You have no duos yet 🌱</Text>
      </View>
    );
  }

  if (!treeData) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading tree…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-semibold text-text mb-4 text-center">
        Your Duo Tree 🌳
      </Text>

      {/* Duo selector */}
      <RNPickerSelect
        onValueChange={(val) => setSelectedIndex(val)}
        value={selectedIndex}
        items={connections.map((c, i) => ({
          label: `Duo with ${c.partnerName}`,
          value: i,
        }))}
        style={{
          inputIOS: {
            backgroundColor: "#444",
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          },
          inputAndroid: {
            backgroundColor: "#444",
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          },
        }}
      />

      {/* Tree image */}
      <View className="items-center mb-6">
        <Image
          source={treeImages[treeData.stage]}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </View>

      {/* Stats */}
      <View className="flex-row justify-between bg-white p-4 rounded-lg mb-6 shadow">
        <Text className="text-text">🌿 Leaves: {treeData.leaves}</Text>
        <Text className="text-text">🍎 Fruits: {treeData.fruits}</Text>
        <Text className="text-text">💀 Decay: {treeData.decay}</Text>
      </View>

      {/* Growth log */}
      <Text className="text-lg font-semibold text-text mb-2">Growth Log:</Text>
      {treeData.growth_log.length > 0 ? (
        treeData.growth_log.map((entry, idx) => {
          const [date, { change }] = Object.entries(entry)[0];
          return (
            <View
              key={idx}
              className="bg-white p-3 rounded-lg mb-2 shadow flex-row items-center"
            >
              <Text className="text-text mr-2">📅</Text>
              <View>
                <Text className="text-sm font-medium text-text">{date}</Text>
                <Text className="text-sm text-gray-600">{change}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View className="bg-white p-4 rounded-lg shadow items-center">
          <Text className="text-text">No growth yet 🌱</Text>
        </View>
      )}
    </ScrollView>
  );
}
