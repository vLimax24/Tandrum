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
  Image,
  FlatList,
  Keyboard,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

const treeImages: Record<string, any> = {
  leaf: require("../assets/hemp-leaf.png"),
  sprout: require("../assets/tree-1.png"),
};

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Adjust snap points based on keyboard visibility
  const snapPoints = useMemo(() => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      // When keyboard is open, make the sheet taller to accommodate
      return ["80%"];
    }
    return ["65%"];
  }, [isKeyboardVisible, keyboardHeight]);

  const [searchUsername, setSearchUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // Dismiss keyboard when sheet closes
        Keyboard.dismiss();
        onClose();
      }
    },
    [onClose]
  );

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        onPress={() => {
          Keyboard.dismiss();
          bottomSheetModalRef.current?.dismiss();
        }}
      />
    ),
    []
  );

  const handleSendInvite = async (
    partnerId: Id<"users">,
    partnerName: string
  ) => {
    // Prevent self-invite
    if (partnerId === userId) {
      Alert.alert(
        "Oops! 😅",
        "You can't invite yourself! Find a friend to be your accountability partner instead."
      );
      return;
    }

    setIsLoading(true);
    try {
      await sendInvite({
        from: userId,
        to: partnerId,
      });

      Alert.alert(
        "Invite Sent! 🚀",
        `Your invite has been sent to ${partnerName}. Once they accept, you can start building habits together!`,
        [
          {
            text: "Great!",
            onPress: () => {
              setSearchUsername("");
              Keyboard.dismiss();
              bottomSheetModalRef.current?.dismiss();
            },
          },
        ]
      );
    } catch (error) {
      console.error("NewDuoModal: Error sending invite:", error);
      Alert.alert(
        "Oops! 😅",
        "Something went wrong while sending the invite. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseBottomSheet = () => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  // Check if search result is the current user
  const isSearchResultCurrentUser = searchResult && searchResult.id === userId;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: "rgba(248, 250, 252, 0.98)",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#cbd5e1",
        width: 48,
        height: 4,
      }}
      onDismiss={() => {
        Keyboard.dismiss();
        onClose();
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: isKeyboardVisible ? 0 : 8,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Header - Reduce size when keyboard is visible */}
          <View
            className={`items-center ${isKeyboardVisible ? "mb-4" : "mb-8"}`}
          >
            <LinearGradient
              colors={["#34d399", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: isKeyboardVisible ? 60 : 80,
                height: isKeyboardVisible ? 60 : 80,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: isKeyboardVisible ? 12 : 16,
              }}
            >
              <Image
                source={treeImages.leaf}
                style={{
                  width: isKeyboardVisible ? 30 : 40,
                  height: isKeyboardVisible ? 30 : 40,
                  tintColor: "white",
                }}
                resizeMode="contain"
              />
            </LinearGradient>

            <Text
              className={`text-slate-900 ${isKeyboardVisible ? "text-xl" : "text-2xl"} font-bold text-center mb-2`}
            >
              Start New Partnership
            </Text>
            {!isKeyboardVisible && (
              <Text className="text-slate-600 text-base text-center leading-relaxed px-4">
                Search for a partner by username and start building habits
                together! 🌱
              </Text>
            )}
          </View>

          {/* Username Search */}
          <View className="mb-6">
            <Text className="text-slate-700 text-lg font-semibold mb-3">
              Search Partner
            </Text>
            <View
              className="bg-white rounded-2xl px-4 py-4 border-2 border-slate-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <TextInput
                value={searchUsername}
                onChangeText={(text) => {
                  setSearchUsername(text);
                }}
                placeholder="Enter username..."
                autoCapitalize="none"
                autoComplete="username"
                className="text-slate-900 text-base"
                style={{ fontSize: 16, color: "#1e293b" }}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Search Results */}
            {searchUsername.trim().length >= 2 && (
              <View className="mt-4">
                {searchResult ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleSendInvite(searchResult.id, searchResult.name)
                    }
                    disabled={isLoading || isSearchResultCurrentUser}
                    activeOpacity={0.7}
                    className="bg-white rounded-2xl p-4 border border-slate-200 flex-row items-center justify-between"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                      opacity: isLoading || isSearchResultCurrentUser ? 0.5 : 1,
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                        style={{
                          backgroundColor: isSearchResultCurrentUser
                            ? "rgba(148, 163, 184, 0.1)"
                            : "rgba(16, 185, 129, 0.1)",
                        }}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            isSearchResultCurrentUser
                              ? "text-slate-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {searchResult.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-900 text-lg font-semibold">
                          {searchResult.name}
                          {isSearchResultCurrentUser && " (You)"}
                        </Text>
                        <Text className="text-slate-500 text-sm">
                          {isSearchResultCurrentUser
                            ? "You can't invite yourself"
                            : "Tap to send invite"}
                        </Text>
                      </View>
                    </View>
                    <View
                      className="px-4 py-2 rounded-xl"
                      style={{
                        backgroundColor: isSearchResultCurrentUser
                          ? "rgba(148, 163, 184, 0.1)"
                          : "rgba(16, 185, 129, 0.1)",
                      }}
                    >
                      <Text
                        className={`font-semibold text-sm ${
                          isSearchResultCurrentUser
                            ? "text-slate-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {isLoading
                          ? "Sending..."
                          : isSearchResultCurrentUser
                            ? "You"
                            : "Invite"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : searchUsername.trim().length >= 2 ? (
                  <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <Text className="text-slate-600 text-center">
                      No user found with username "{searchUsername}"
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {searchUsername.trim().length > 0 &&
              searchUsername.trim().length < 2 && (
                <View className="mt-4 bg-blue-50 rounded-2xl p-3 border border-blue-200">
                  <Text className="text-blue-700 text-sm text-center">
                    Type at least 2 characters to search
                  </Text>
                </View>
              )}
          </View>

          {/* Info Box - Hide when keyboard is visible to save space */}
          {!isKeyboardVisible && (
            <View
              className="bg-blue-50 rounded-2xl p-4 mb-8 border border-blue-200"
              style={{
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-start">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                >
                  <Text className="text-blue-600 text-sm font-bold">ℹ️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-blue-900 text-sm font-semibold mb-1">
                    How it works
                  </Text>
                  <Text className="text-blue-700 text-sm leading-relaxed">
                    Search for a partner by their username. Once you find them,
                    tap to send an invite. They'll be notified and can accept to
                    start your partnership!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 pb-8">
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              activeOpacity={0.7}
              className="bg-white rounded-2xl border border-slate-200 px-6 py-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-slate-700 font-semibold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
