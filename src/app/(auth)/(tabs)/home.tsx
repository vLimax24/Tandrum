import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Clipboard,
  Alert,
  TextInput,
} from "react-native";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "../../../../convex/_generated/api";
import QRCode from "react-native-qrcode-svg";

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

  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);

  const data = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );

  const inviteLink = `https://yourapp.com/invite/${convexUser?._id}`;

  const copyToClipboard = () => {
    Clipboard.setString(inviteLink);
    Alert.alert("Copied!", "Invite link copied to clipboard");
  };

  const sendInvite = (userId: string) => {
    console.log("Sending invite to user with ID:", userId);
    if (!userId) {
      Alert.alert("Error", "No user found to send an invite.");
      return;
    }
  };

  if (!convexUser || isUserInConnection === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-text text-xl font-semibold mb-4">
        Welcome, {user.firstName} 👋
      </Text>

      {isUserInConnection ? (
        <Text className="text-primary text-lg">You're already in a duo 🌱</Text>
      ) : (
        <>
          <Pressable
            className="bg-primary text-white py-3 px-6 rounded-md shadow-md"
            onPress={() => setModalVisible(true)}
          >
            <Text className="font-semibold text-center">Start a Duo</Text>
          </Pressable>

          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
              <View className="bg-primary p-6 rounded-lg w-80">
                <Text className="text-text text-lg font-semibold mb-4">
                  Invite a buddy 🤝
                </Text>

                <Text className="text-text text-md font-semibold mb-2">
                  Scan QR Code:
                </Text>
                <View className="mb-4">
                  <QRCode value={inviteLink} size={180} />
                </View>

                <Text className="text-text text-md font-semibold mb-2">
                  Or share link:
                </Text>
                <Text selectable className="text-accent text-sm mb-4">
                  {inviteLink}
                </Text>
                <Pressable
                  className="bg-secondary py-2 px-4 rounded-md"
                  onPress={copyToClipboard}
                >
                  <Text className="text-background font-semibold">
                    Copy Link
                  </Text>
                </Pressable>

                <TextInput
                  className="border-2 border-text py-2 px-4 rounded-md mt-4"
                  placeholder="Enter Username"
                  value={username}
                  onChangeText={setUsername}
                />
                {data ? (
                  <Text className="text-text mt-2">
                    Found user: {data.name} (ID: {data.id})
                  </Text>
                ) : !data ? (
                  <Text className="text-red-500 mt-2">User not found</Text>
                ) : null}

                {/* Invite Button */}
                {data && (
                  <Pressable
                    onPress={() => sendInvite(data.id)} // Send invite to the found user's Convex ID
                    className="bg-primary py-2 px-4 rounded-md mt-4"
                  >
                    <Text className="text-background font-semibold text-center">
                      Invite to Duo
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="mt-4 py-2 px-4 bg-accent rounded-md"
                >
                  <Text className="text-background font-semibold text-center">
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default Page;
