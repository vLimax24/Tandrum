import { useState } from "react";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export const useStartDuo = (userId: Id<"users">, onClose: () => void) => {
  const [username, setUsername] = useState("");

  const inviteLink = `https://yourapp.com/invite/${userId}`;
  const userMatch = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );
  const sendInvite = useMutation(api.duoInvites.sendInvite);

  const copyToClipboard = () => {
    Clipboard.setString(inviteLink);
    Alert.alert("Copied!", "Invite link copied to clipboard");
  };

  const handleSendInvite = async (toUserId: Id<"users">) => {
    try {
      await sendInvite({ from: userId, to: toUserId });
      Alert.alert("Invite Sent", "Your invite has been sent!");
      onClose();
    } catch (err) {
      console.error("Error sending invite:", err);
      Alert.alert("Error", "Failed to send invite");
    }
  };

  return {
    username,
    setUsername,
    userMatch,
    inviteLink,
    copyToClipboard,
    handleSendInvite,
  };
};
