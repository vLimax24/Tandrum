import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "../../../../convex/_generated/api";
import { getLevelData } from "@/utils/level";
import { StartDuoModal } from "@/components/StartDuoModel/index";
import { LinearGradient } from "expo-linear-gradient";
import LevelDisplay from "@/components/LevelDisplay";
import { router } from "expo-router";
import { useDuo } from "@/hooks/useDuo";

const images: Record<string, any> = {
  sprout: require("../../../assets/tree-1.png"),
  smallTree: require("../../../assets/tree-2.png"),
  mediumTree: require("../../../assets/tree-1.png"),
  grownTree: require("../../../assets/tree-1.png"),
  streak: require("../../../assets/fire-small.png"),
  showCaseLeaf: require("../../../assets/hemp-leaf.png"),
  arrow: require("../../../assets/arrow-up-blue.png"),
};

const Page = () => {
  const { user } = useUser();
  const clerkId = user?.id;

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  const isUserInConnection = useQuery(
    api.duoConnections.isUserInConnection,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const userConnections = useQuery(
    api.duoConnections.getConnectionsForUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const [modalVisible, setModalVisible] = useState(false);
  const incomingInvite = useQuery(
    api.duoInvites.getIncomingInvite,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const acceptInvite = useMutation(api.duoInvites.respondToInvite);

  const { setSelectedIndex } = useDuo();

  useEffect(() => {
    if (incomingInvite) {
      Alert.alert(
        "Duo Invite 📬",
        "Someone wants to team up with you!",
        [
          {
            text: "Reject",
            style: "destructive",
            onPress: () =>
              acceptInvite({ inviteId: incomingInvite._id, accept: false }),
          },
          {
            text: "Accept",
            onPress: () =>
              acceptInvite({ inviteId: incomingInvite._id, accept: true }),
          },
        ],
        { cancelable: false }
      );
    }
  }, [incomingInvite]);

  if (!convexUser || isUserInConnection === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <View
          className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        >
          <LinearGradient
            colors={["#34d399", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              alignSelf: "center",
            }}
          >
            <View className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </LinearGradient>
          <Text className="text-slate-700 text-lg font-medium text-center">
            Loading your dashboard...
          </Text>
        </View>
      </View>
    );
  }

  // Calculate summary stats
  const totalTrustScore =
    userConnections?.reduce((sum, conn) => sum + (conn.trust_score || 0), 0) ||
    0;
  const totalStreak =
    userConnections?.reduce((sum, conn) => sum + (conn.streak || 0), 0) || 0;
  const avgLevel = userConnections?.length
    ? Math.floor(
        userConnections.reduce(
          (sum, conn) => sum + getLevelData(conn.trust_score).level,
          0
        ) / userConnections.length
      )
    : 0;
  const activeDuos = userConnections?.length || 0;

  return (
    <LinearGradient
      colors={["#f8fafc", "#dbeafe"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
      className="pt-10"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" translucent />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Header Section */}
          <View className="px-6 pt-4 pb-8">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-slate-600 text-base font-medium">
                  Welcome back,
                </Text>
                <Text className="text-slate-900 text-3xl font-bold">
                  {user?.firstName || "Partner"}
                </Text>
              </View>
              <LinearGradient
                colors={["#34d399", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={images.showCaseLeaf}
                  style={{ width: 32, height: 32, tintColor: "white" }}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>

            <Text className="text-slate-500 text-base leading-relaxed mt-1">
              Your partnership ecosystem at a glance
            </Text>
          </View>

          {/* Dashboard Stats Cards */}
          <View className="px-6 mb-8">
            <View className="flex-row flex-wrap justify-between gap-4">
              {/* Active Duos */}
              <View className="flex-1 min-w-[45%]">
                <View
                  className="rounded-2xl p-6 border-2 border-blue-200/60"
                  style={{
                    backgroundColor: "rgba(239, 246, 255, 1)",
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center border border-blue-300/40"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                    >
                      <Text className="text-blue-600 text-xl font-bold">
                        👥
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1.5 rounded-full border border-blue-300/30"
                      style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                    >
                      <Text className="text-blue-700 text-xs font-bold tracking-wide">
                        ACTIVE
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-900 text-3xl font-black mb-1">
                    {activeDuos}
                  </Text>
                  <Text className="text-slate-600 text-sm font-semibold">
                    Active Duos
                  </Text>
                </View>
              </View>

              {/* Total Trust Score */}
              <View className="flex-1 min-w-[45%]">
                <View
                  className="rounded-2xl p-6 border-2 border-emerald-200/60"
                  style={{
                    backgroundColor: "rgba(236, 253, 245, 1)",
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center border border-emerald-300/40"
                      style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}
                    >
                      <Image
                        source={images.arrow}
                        style={{ width: 22, height: 22, tintColor: "#059669" }}
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      className="px-3 py-1.5 rounded-full border border-emerald-300/30"
                      style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                    >
                      <Text className="text-emerald-700 text-xs font-bold tracking-wide">
                        TRUST
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-900 text-3xl font-black mb-1">
                    {totalTrustScore}
                  </Text>
                  <Text className="text-slate-600 text-sm font-semibold">
                    Total XP
                  </Text>
                </View>
              </View>

              {/* Combined Streak */}
              <View className="flex-1 min-w-[45%]">
                <View
                  className="rounded-2xl p-6 border-2 border-orange-200/60"
                  style={{
                    backgroundColor: "rgba(255, 247, 237, 1)",
                    shadowColor: "#F97316",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4 gap-1">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center border border-orange-300/40"
                      style={{ backgroundColor: "rgba(249, 115, 22, 0.2)" }}
                    >
                      <Image
                        source={images.streak}
                        style={{ width: 22, height: 22 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      className="px-3 py-1.5 rounded-full border border-orange-300/30"
                      style={{ backgroundColor: "rgba(249, 115, 22, 0.15)" }}
                    >
                      <Text className="text-orange-700 text-xs font-bold tracking-wide">
                        STREAK
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-900 text-3xl font-black mb-1">
                    {totalStreak}
                  </Text>
                  <Text className="text-slate-600 text-sm font-semibold">
                    Combined Days
                  </Text>
                </View>
              </View>

              {/* Average Level */}
              <View className="flex-1 min-w-[45%]">
                <View
                  className="rounded-2xl p-6 border-2 border-purple-200/60"
                  style={{
                    backgroundColor: "rgba(250, 245, 255, 1)",
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center border border-purple-300/40"
                      style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }}
                    >
                      <Text className="text-purple-600 text-xl font-bold">
                        ⭐
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1.5 rounded-full border border-purple-300/30"
                      style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
                    >
                      <Text className="text-purple-700 text-xs font-bold tracking-wide">
                        LEVEL
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-900 text-3xl font-black mb-1">
                    {avgLevel}
                  </Text>
                  <Text className="text-slate-600 text-sm font-semibold">
                    Avg Level
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Active Partnerships Section */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 text-xl font-bold">
                Active Partnerships
              </Text>
              {userConnections && userConnections.length > 0 && (
                <View className="px-3 py-1 bg-emerald-100 rounded-full">
                  <Text className="text-emerald-700 text-sm font-semibold">
                    {userConnections.length} Active
                  </Text>
                </View>
              )}
            </View>

            {userConnections && userConnections.length > 0 ? (
              <View className="gap-4">
                {userConnections.map((conn, index) => {
                  return (
                    <TouchableOpacity
                      key={conn._id}
                      activeOpacity={0.7}
                      className="rounded-3xl overflow-hidden"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.1,
                        shadowRadius: 16,
                        elevation: 12,
                      }}
                      onPress={() => {
                        setSelectedIndex(index);
                        router.push(`/tree`);
                      }}
                    >
                      {/* Header Gradient */}
                      <LinearGradient
                        colors={["#10b981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 24, paddingVertical: 16 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View
                              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              <Text className="text-white text-xl font-bold">
                                {conn.partnerName?.charAt(0) || "?"}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-white text-lg font-bold">
                                {conn.partnerName}
                              </Text>
                              <Text className="text-white/80 text-sm font-medium">
                                Partnership #{index + 1}
                              </Text>
                            </View>
                          </View>
                          <View
                            className="w-16 h-16 rounded-2xl items-center justify-center"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Image
                              source={images[conn.treeState]}
                              style={{ width: 40, height: 40 }}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      </LinearGradient>

                      {/* Content */}
                      <View className="px-6 py-5 bg-white/80">
                        {/* Level Progress */}
                        <LevelDisplay duo={conn} showXpStats={false} />
                        {/* Stats Grid */}
                        <View className="flex-row justify-between">
                          <View className="flex-1 items-center py-3 px-2 min-h-[80px] justify-center">
                            <View className="flex-row items-center mb-1">
                              <Image
                                source={images.streak}
                                style={{
                                  width: 16,
                                  height: 16,
                                  marginRight: 6,
                                }}
                                resizeMode="contain"
                              />
                              <Text className="text-slate-900 font-bold text-lg">
                                {conn.streak}
                              </Text>
                            </View>
                            <Text className="text-slate-600 text-xs font-medium text-center">
                              Day Streak
                            </Text>
                          </View>

                          <View className="w-px bg-slate-200 mx-2 self-stretch" />

                          <View className="flex-1 items-center py-3 px-2 min-h-[80px] justify-center">
                            <View className="flex-row items-center mb-1">
                              <Image
                                source={images.arrow}
                                style={{
                                  width: 16,
                                  height: 16,
                                  marginRight: 6,
                                  tintColor: "#059669",
                                }}
                                resizeMode="contain"
                              />
                              <Text className="text-slate-900 font-bold text-lg">
                                {conn.trust_score}
                              </Text>
                            </View>
                            <Text className="text-slate-600 text-xs font-medium text-center">
                              XP
                            </Text>
                          </View>

                          <View className="w-px bg-slate-200 mx-2 self-stretch" />

                          <View className="flex-1 items-center py-3 px-2 min-h-[80px] justify-center">
                            <View className="flex-row items-center mb-1 flex-wrap justify-center">
                              <Image
                                source={images[conn.treeState]}
                                style={{
                                  width: 16,
                                  height: 16,
                                  marginRight: 6,
                                }}
                                resizeMode="contain"
                              />
                              <Text
                                className="text-slate-900 font-bold text-lg capitalize text-center"
                                numberOfLines={2}
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.8}
                              >
                                {conn.treeState
                                  .replace(/([A-Z])/g, " $1")
                                  .trim()}
                              </Text>
                            </View>
                            <Text className="text-slate-600 text-xs font-medium text-center">
                              Tree Stage
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View
                className="rounded-3xl border border-white/40 p-8 items-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-slate-400 text-3xl">🌱</Text>
                </View>
                <Text className="text-slate-900 text-xl font-bold text-center mb-2">
                  No Active Partnerships
                </Text>
                <Text className="text-slate-600 text-center text-base leading-relaxed">
                  Start your first duo partnership to begin building habits
                  together and growing your shared tree!
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="px-6 gap-3">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              style={{
                overflow: "hidden",
                borderRadius: 16,
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Text className="text-white font-bold text-lg">+</Text>
                </View>
                <Text className="text-white font-bold text-lg">
                  {isUserInConnection
                    ? "Start New Partnership"
                    : "Start First Partnership"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 bg-white rounded-2xl border border-white/40 px-4 py-4 items-center shadow"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => router.push("/tree")}
              >
                <Text className="text-slate-700 font-semibold text-base ">
                  View All Trees
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => router.push("/habits")}
              >
                <Text className="text-slate-700 font-semibold text-base">
                  My Habits
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <StartDuoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          userId={convexUser._id}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Page;
