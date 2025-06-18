import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { TandrumBottomSheet } from "@/components/TandrumBottomSheet";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { AlertModal } from "@/components/AlertModal";

interface NewDuoModalProps {
  visible: boolean;
  onClose: () => void;
  userId: Id<"users">;
}

export const NewDuoModal: React.FC<NewDuoModalProps> = ({
  visible,
  onClose,
  userId,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  // Adjust snap points based on keyboard visibility
  const snapPoints = useMemo(() => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      return ["85%"];
    }
    return ["76%"];
  }, [isKeyboardVisible, keyboardHeight]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
    icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
    iconColor?: string
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  // Get current user info to prevent self-invites
  const currentUser = useQuery(api.users.getUserById, { userId: userId });

  const searchResult = useQuery(
    api.users.getUserByUsername,
    searchUsername.trim().length >= 2
      ? { username: searchUsername.trim() }
      : "skip"
  );

  const sendInvite = useMutation(api.duoInvites.sendInvite);

  const handleSendInvite = async (
    partnerId: Id<"users">,
    partnerName: string
  ) => {
    // Prevent self-invite
    if (partnerId === userId) {
      showAlert(
        "Oops! 😅",
        "You can't invite yourself! Find a friend to be your accountability partner instead.",
        [{ text: "OK", style: "default" }],
        "person",
        "#f59e0b"
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendInvite({
        from: userId,
        to: partnerId,
      });

      showAlert(
        "Invite Sent! 🚀",
        `Your invite has been sent to ${partnerName}. Once they accept, you can start building habits together!`,
        [
          {
            text: "Great!",
            style: "default",
            onPress: () => {
              setSearchUsername("");
              Keyboard.dismiss();
              onClose();
            },
          },
        ],
        "checkmark-circle",
        "#10b981"
      );
    } catch (error) {
      console.error("NewDuoModal: Error sending invite:", error);
      showAlert(
        "Oops! 😅",
        "Something went wrong while sending the invite. Please try again.",
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setSearchUsername("");
    onClose();
  }, [onClose]);

  // Check if search result is the current user
  const isSearchResultCurrentUser = searchResult && searchResult.id === userId;

  const renderSearchResult = () => {
    if (searchUsername.trim().length < 2) {
      return (
        <View className="rounded-3xl overflow-hidden mt-4">
          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            className="p-6"
            style={{ backgroundColor: theme.colors.glass }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.colors.primary + "20" }}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                className="flex-1 text-base"
                style={{ color: theme.colors.text.secondary }}
              >
                Type at least 2 characters to search for partners
              </Text>
            </View>
          </BlurView>
        </View>
      );
    }

    if (!searchResult) {
      return (
        <View className="rounded-3xl overflow-hidden mt-4">
          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            className="p-6"
            style={{ backgroundColor: theme.colors.glass }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.colors.text.tertiary + "20" }}
              >
                <Ionicons
                  name="person-remove"
                  size={20}
                  color={theme.colors.text.tertiary}
                />
              </View>
              <Text
                className="flex-1 text-base"
                style={{ color: theme.colors.text.secondary }}
              >
                No user found with username "{searchUsername}"
              </Text>
            </View>
          </BlurView>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleSendInvite(searchResult.id, searchResult.name)}
        disabled={isLoading || isSearchResultCurrentUser}
        activeOpacity={0.8}
        className="mt-4"
      >
        <View className="rounded-3xl overflow-hidden">
          <BlurView
            intensity={30}
            tint={isDarkMode ? "dark" : "light"}
            style={{ backgroundColor: theme.colors.cardBackground }}
          >
            <LinearGradient
              colors={
                isSearchResultCurrentUser
                  ? [
                      theme.colors.text.tertiary + "10",
                      theme.colors.text.tertiary + "05",
                    ]
                  : [
                      theme.colors.primary + "10",
                      theme.colors.primaryLight + "05",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6"
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="w-14 h-14 rounded-3xl items-center justify-center"
                  style={{
                    backgroundColor: isSearchResultCurrentUser
                      ? theme.colors.text.tertiary + "20"
                      : theme.colors.primary + "20",
                  }}
                >
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color: isSearchResultCurrentUser
                        ? theme.colors.text.tertiary
                        : theme.colors.primary,
                    }}
                  >
                    {searchResult.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className="text-lg font-bold mb-1"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {searchResult.name}
                    {isSearchResultCurrentUser && " (You)"}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {isSearchResultCurrentUser
                      ? "You can't invite yourself"
                      : "Tap to send partnership invite"}
                  </Text>
                </View>

                <View
                  className="px-4 py-2 rounded-2xl"
                  style={{
                    backgroundColor: isSearchResultCurrentUser
                      ? theme.colors.text.tertiary + "20"
                      : theme.colors.primary + "20",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.colors.primary }}
                      >
                        Sending...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name={
                          isSearchResultCurrentUser ? "person" : "paper-plane"
                        }
                        size={16}
                        color={
                          isSearchResultCurrentUser
                            ? theme.colors.text.tertiary
                            : theme.colors.primary
                        }
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: isSearchResultCurrentUser
                            ? theme.colors.text.tertiary
                            : theme.colors.primary,
                        }}
                      >
                        {isSearchResultCurrentUser ? "You" : "Invite"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TandrumBottomSheet
      ref={bottomSheetModalRef}
      title="Find Your Partner"
      subtitle="Start building habits together"
      icon="people"
      snapPoints={snapPoints}
      onClose={handleClose}
      onDismiss={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{
          backgroundColor: theme.colors.background[1],
          paddingBottom: 100,
        }}
      >
        <View
          className="flex-1 px-6"
          style={{
            paddingTop: isKeyboardVisible ? 16 : 24,
            paddingBottom: isKeyboardVisible ? 8 : 24,
          }}
        >
          {/* Search Input */}
          <View className="mb-6">
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: theme.colors.text.primary }}
            >
              Search by Username
            </Text>

            <View className="rounded-3xl overflow-hidden">
              <BlurView
                intensity={30}
                tint={isDarkMode ? "dark" : "light"}
                style={{ backgroundColor: theme.colors.cardBackground }}
              >
                <View className="flex-row items-center p-4 gap-3">
                  <View
                    className="w-10 h-10 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: theme.colors.primary + "20" }}
                  >
                    <Ionicons
                      name="search"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <TextInput
                    value={searchUsername}
                    onChangeText={setSearchUsername}
                    placeholder="Enter username..."
                    autoCapitalize="none"
                    autoComplete="username"
                    className="flex-1 text-base"
                    style={{
                      color: theme.colors.text.primary,
                      fontSize: 16,
                    }}
                    placeholderTextColor={theme.colors.text.tertiary}
                  />
                  {searchUsername.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchUsername("")}
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: theme.colors.text.tertiary + "20",
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </BlurView>
            </View>

            {/* Search Results */}
            {renderSearchResult()}
          </View>

          {/* How It Works - Only show when keyboard is not visible */}
          {!isKeyboardVisible && (
            <View className="rounded-3xl overflow-hidden mb-6">
              <BlurView
                intensity={20}
                tint={isDarkMode ? "dark" : "light"}
                className="p-6"
                style={{ backgroundColor: theme.colors.glass }}
              >
                <View className="flex-row items-start gap-4">
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    className="w-10 h-10 items-center justify-center"
                    style={{ borderRadius: 16 }}
                  >
                    <Ionicons name="information" size={20} color="white" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold mb-2"
                      style={{ color: theme.colors.text.primary }}
                    >
                      How Partnership Works
                    </Text>
                    <Text
                      className="text-sm leading-relaxed"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Once you send an invite, they'll receive a notification.
                      When they accept, you'll both be able to track each
                      other's progress and celebrate wins together!
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 mt-auto">
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.8}
              className="overflow-hidden rounded-3xl"
            >
              <BlurView
                intensity={30}
                tint={isDarkMode ? "dark" : "light"}
                className="p-4"
                style={{ backgroundColor: theme.colors.cardBackground }}
              >
                <Text
                  className="text-center text-lg font-semibold"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Cancel
                </Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </TandrumBottomSheet>
  );
};
