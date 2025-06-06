import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Alert, Image } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "../../../../convex/_generated/api";
import { getLevelData } from "@/utils/level";
import { StartDuoModal } from "@/components/StartDuoModel/index";

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
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background py-16 px-5 gap-5">
      <Text className="text-text text-4xl font-semibold">Home</Text>

      <View className="gap-5">
        {userConnections?.map((conn) => {
          const levelData = getLevelData(conn.trust_score);

          return (
            <View
              className="w-full bg-primary gap-1 py-3 px-5 rounded-2xl"
              key={conn._id}
            >
              <Text className="text-md text-background font-semibold">
                Duo Partner: {conn.partnerName}
              </Text>
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <Image
                    source={images[conn.treeState]}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text className="text-background font-thin">
                    Level {levelData.level}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Image
                    source={images["streak"]}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                    className="bg-red-500"
                  />
                  <Text className="text-background font-thin">
                    {conn.streak} {conn.streak < 1 ? "days" : "day"}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Image
                    source={images["arrow"]}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text className="text-background font-thin">
                    {conn.trust_score} total trust points
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View className="h-px bg-[#E5E7EB] my-1" />

      {isUserInConnection ? (
        <>
          <Pressable
            className="bg-primary py-5 px-6 rounded-xl shadow-md"
            onPress={() => setModalVisible(true)}
          >
            <Text className="font-semibold text-center text-background">
              Start a new Duo
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            className="bg-primary py-3 px-6 rounded-md shadow-md"
            onPress={() => setModalVisible(true)}
          >
            <Text className="font-semibold text-center text-background">
              Start a Duo
            </Text>
          </Pressable>
        </>
      )}
      <StartDuoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userId={convexUser._id}
      />
    </View>
  );
};

export default Page;
