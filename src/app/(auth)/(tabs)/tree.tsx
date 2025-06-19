import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Id } from "convex/_generated/dataModel";
import { getTreeStageForLevel, getLevelData } from "@/utils/level";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import TreeInventory from "@/components/TreeInventory";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { NoDuoScreen } from "@/components/NoDuoScreen";
import { ItemType } from "@/components/TreeInventory";
import { treeImages } from "@/utils/images";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { DuoSelector } from "@/components/DuoSelector";
import LoadingState from "@/components/LoadingState";

export default function TreeSection() {
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);
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
      <LinearGradient
        colors={theme.colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center"
      >
        <BlurView
          intensity={20}
          tint={isDarkMode ? "dark" : "light"}
          className="rounded-3xl px-8 py-12 items-center"
          style={{
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
          }}
        >
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-4">
            <Text className="text-2xl">🌱</Text>
          </View>
          <Text
            className="text-lg font-semibold text-center"
            style={{ color: theme.colors.text.primary }}
          >
            Loading your profile...
          </Text>
        </BlurView>
      </LinearGradient>
    );

  if (!connections)
    return (
      <LinearGradient
        colors={theme.colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center"
      >
        <BlurView
          intensity={20}
          tint={isDarkMode ? "dark" : "light"}
          className="rounded-3xl px-8 py-12 items-center"
          style={{
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
          }}
        >
          <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-4">
            <Text className="text-2xl">🤝</Text>
          </View>
          <Text
            className="text-lg font-semibold text-center"
            style={{ color: theme.colors.text.primary }}
          >
            Loading connections...
          </Text>
        </BlurView>
      </LinearGradient>
    );

  if (connections.length === 0)
    return (
      <NoDuoScreen
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    );

  if (!treeData) return <LoadingState screen="tree" />;

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 1 }}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 50 }}
      >
        {/* Header Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-2">
            <Text
              className="text-3xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              Growth Tree
            </Text>
          </View>
          <Text
            className="text-base leading-6"
            style={{ color: theme.colors.text.secondary }}
          >
            Watch your duo's trust grow into a beautiful tree through daily
            habits and accountability
          </Text>
        </View>

        {/* Duo Selection Card */}
        <DuoSelector
          connections={connections}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />

        {/* Tree Display Section */}
        <BlurView
          intensity={20}
          tint={isDarkMode ? "dark" : "light"}
          className="rounded-3xl mb-8 overflow-hidden"
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
            borderWidth: 1,
          }}
        >
          <View className="p-4 items-center">
            <View className="w-80 h-80 rounded-3xl bg-gradient-to-br from-green-50 to-blue-50 items-center justify-center mb-6 overflow-hidden">
              <Image
                source={treeImages[treeData.stage]}
                style={{ width: 280, height: 280 }}
                resizeMode="contain"
              />
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
          </View>
        </BlurView>

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-8">
          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              borderWidth: 1,
            }}
          >
            <View className="p-4 items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.primary}30`,
                }}
              >
                <Ionicons
                  size={20}
                  name="leaf"
                  color={theme.colors.primaryLight}
                />
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.text.primary }}
              >
                {treeData.leaves}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                Leaves
              </Text>
            </View>
          </BlurView>

          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              borderWidth: 1,
            }}
          >
            <View className="p-4 items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.primary}30`,
                }}
              >
                <Ionicons
                  size={20}
                  name="egg"
                  color={theme.colors.primaryLight}
                />
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.text.primary }}
              >
                {treeData.fruits}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: theme.colors.text.secondary }}
              >
                Fruits
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Level Display */}
        <View className="mb-8" style={{ zIndex: 1 }}>
          <LevelDisplay duo={selectedConnection} />
        </View>

        {/* Growth Activity Section */}
        <View className="mb-8" style={{ zIndex: 1 }}>
          <View className="mb-6">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center">
                <Ionicons
                  color={theme.colors.primaryLight}
                  size={18}
                  name="bar-chart"
                />
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.colors.text.primary }}
              >
                Growth Activity
              </Text>
            </View>
            <Text
              className="text-base"
              style={{ color: theme.colors.text.secondary }}
            >
              Track your duo's progress and celebrate milestones together
            </Text>
          </View>

          {treeData.growth_log.length > 0 ? (
            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
                borderWidth: 1,
              }}
            >
              {Object.entries(groupedGrowthLog).map(
                ([dateStr, logs], index) => (
                  <View key={dateStr}>
                    {/* Date Header */}
                    <TouchableOpacity
                      onPress={() => toggleCollapse(dateStr)}
                      className="p-6 flex-row items-center justify-between"
                      activeOpacity={0.7}
                      style={{
                        backgroundColor:
                          index === 0 ? theme.colors.glass : "transparent",
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.cardBorder,
                      }}
                    >
                      <View className="flex-row items-center gap-4">
                        <View className="w-3 h-3 rounded-full bg-primary" />
                        <View>
                          <Text
                            className="text-lg font-semibold"
                            style={{ color: theme.colors.text.primary }}
                          >
                            {dateStr}
                          </Text>
                          <Text
                            className="text-sm"
                            style={{ color: theme.colors.text.tertiary }}
                          >
                            {logs.length}{" "}
                            {logs.length === 1 ? "activity" : "activities"}
                          </Text>
                        </View>
                      </View>

                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: theme.colors.glass,
                          borderColor: theme.colors.cardBorder,
                          borderWidth: 1,
                          transform: [
                            {
                              rotate: collapsedDates[dateStr]
                                ? "0deg"
                                : "180deg",
                            },
                          ],
                        }}
                      >
                        <Text
                          className="text-xl"
                          style={{ color: theme.colors.text.tertiary }}
                        >
                          ▾
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Activity Items */}
                    {!collapsedDates[dateStr] && (
                      <View className="px-6 pb-6">
                        {logs.map(({ idx, change }, logIndex) => (
                          <View
                            key={idx}
                            className="flex-row items-start gap-4 py-4"
                            style={{
                              borderBottomWidth:
                                logIndex !== logs.length - 1 ? 1 : 0,
                              borderBottomColor: theme.colors.cardBorder,
                            }}
                          >
                            {/* Timeline Indicator */}
                            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center">
                              <Image
                                source={treeImages["leaf"]}
                                style={{
                                  width: 16,
                                  height: 16,
                                  tintColor: "#22c55e",
                                }}
                              />
                            </View>

                            {/* Activity Content */}
                            <View className="flex-1 gap-2">
                              <Text
                                className="text-base font-medium leading-6"
                                style={{ color: theme.colors.text.primary }}
                              >
                                {change}
                              </Text>
                              <Text
                                className="text-sm"
                                style={{ color: theme.colors.text.tertiary }}
                              >
                                Activity #{idx + 1}
                              </Text>
                            </View>

                            {/* Status Badge */}
                            <View
                              className="px-3 py-1 rounded-full"
                              style={{ backgroundColor: "#dcfce7" }}
                            >
                              <Text className="text-xs font-semibold text-green-700">
                                ✓ Complete
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )
              )}
            </BlurView>
          ) : (
            // Empty State
            <BlurView
              intensity={20}
              tint={isDarkMode ? "dark" : "light"}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
                borderWidth: 1,
              }}
            >
              <View className="p-12 items-center">
                <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
                  <Ionicons
                    name="leaf"
                    size={40}
                    color={theme.colors.primaryLight}
                  />
                </View>
                <Text
                  className="text-xl font-bold mb-3 text-center"
                  style={{ color: theme.colors.text.primary }}
                >
                  Your Growth Journey Starts Here
                </Text>
                <Text
                  className="text-base text-center leading-6 max-w-sm mb-6"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Begin building habits together with your duo partner. Every
                  small step counts toward growing your trust tree.
                </Text>
                <View
                  className="px-6 py-3 rounded-full"
                  style={{ backgroundColor: theme.colors.glass }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    🚀 Start your first habit today!
                  </Text>
                </View>
              </View>
            </BlurView>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
