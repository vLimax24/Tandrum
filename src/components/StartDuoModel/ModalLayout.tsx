import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { Id } from "convex/_generated/dataModel";

type Props = {
  visible: boolean;
  onClose: () => void;
  username: string;
  setUsername: (v: string) => void;
  inviteLink: string;
  userMatch: { id: Id<"users">; name: string } | null | undefined;
  copyToClipboard: () => void;
  handleSendInvite: (id: Id<"users">) => void;
};

export const ModalLayout = ({
  visible,
  onClose,
  username,
  setUsername,
  inviteLink,
  userMatch,
  copyToClipboard,
  handleSendInvite,
}: Props) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <TouchableWithoutFeedback>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="w-11/12 max-w-md rounded-2xl p-6 shadow-2xl relative"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Close Button */}
            <Pressable onPress={onClose} className="absolute top-4 right-4">
              <X size={24} color="#000000" />
            </Pressable>

            {/* Title */}
            <Text
              className="text-xl font-semibold text-center mb-6"
              style={{ color: "#000000" }}
            >
              Invite a Buddy
            </Text>

            {/* QR Code */}
            <View className="mb-6">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: "#1f2937" }}
              >
                Scan QR Code
              </Text>
              <View className="items-center">
                <QRCode value={inviteLink} size={160} />
              </View>
            </View>

            {/* Share Link */}
            <View className="mb-6">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: "#1f2937" }}
              >
                Or share link
              </Text>
              <View
                className="flex-row items-center px-3 py-2 rounded-md"
                style={{ backgroundColor: "#f3f4f6" }}
              >
                <Text
                  selectable
                  className="text-xs flex-1"
                  style={{ color: "#2563eb" }}
                >
                  {inviteLink}
                </Text>
                <Pressable
                  onPress={copyToClipboard}
                  className="ml-2 px-3 py-1 rounded-md"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: "#ffffff" }}
                  >
                    Copy
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Username Search */}
            <View className="mb-6">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: "#1f2937" }}
              >
                Or search by username
              </Text>
              <TextInput
                placeholder="Enter username"
                placeholderTextColor="#888888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                className="px-4 py-2 rounded-md text-base"
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  color: "#000000",
                }}
              />

              {username.length > 0 && (
                <>
                  {userMatch ? (
                    <View className="mt-2">
                      <Text style={{ color: "#15803d" }}>
                        Found: {userMatch.name}
                      </Text>
                      <Pressable
                        onPress={() => {
                          handleSendInvite(userMatch.id);
                          setUsername("");
                        }}
                        className="py-2 px-4 rounded-md mt-2"
                        style={{ backgroundColor: "#16a34a" }}
                      >
                        <Text
                          className="text-center font-semibold"
                          style={{ color: "#ffffff" }}
                        >
                          Invite to Duo
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text className="mt-2" style={{ color: "#ef4444" }}>
                      User not found
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Close */}
            <Pressable
              onPress={onClose}
              className="rounded-md py-2 mt-2"
              style={{ backgroundColor: "#e5e7eb" }}
            >
              <Text
                className="text-center font-medium"
                style={{ color: "#1f2937" }}
              >
                Close
              </Text>
            </Pressable>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);
