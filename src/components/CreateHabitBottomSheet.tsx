import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { TandrumBottomSheet } from "./TandrumBottomSheet";
import { AlertModal } from "./AlertModal";

interface CreateHabitBottomSheetProps {
  onCreate: any;
  duo: any;
  existingHabits: any[];
}

const CreateHabitBottomSheet = React.forwardRef<
  BottomSheetModal,
  CreateHabitBottomSheetProps
>(({ onCreate, duo, existingHabits = [] }, ref) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
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

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  };

  const validateHabitTitle = (title: string): string => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return "Habit title is required";
    }
    if (trimmedTitle.length < 3) {
      return "Habit title must be at least 3 characters long";
    }
    if (trimmedTitle.length > 50) {
      return "Habit title must be less than 50 characters";
    }
    if (
      existingHabits?.some(
        (h) => h.title.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      return "A habit with this title already exists";
    }
    return "";
  };

  const handleTitleChange = (text: string) => {
    setNewTitle(text);
    if (validationError) {
      const error = validateHabitTitle(text);
      setValidationError(error);
    }
  };

  const handleCreateHabit = async () => {
    const error = validateHabitTitle(newTitle);
    if (error) {
      setValidationError(error);
      return;
    }

    if (!duo) {
      showAlert(
        "Error",
        "No duo selected. Please try again.",
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        title: newTitle.trim(),
        frequency: newFreq,
        duoId: duo._id,
      });
      handleClose();
    } catch (error) {
      showAlert(
        "Error",
        "Failed to create habit. Please try again.",
        [{ text: "OK", style: "default" }],
        "alert-circle",
        "#ef4444"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = useCallback(() => {
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }
    setTimeout(() => {
      setNewTitle("");
      setNewFreq("daily");
      setValidationError("");
      setIsCreating(false);
    }, 300);
  }, [ref]);

  const handleDismiss = useCallback(() => {
    setValidationError("");
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <>
      <TandrumBottomSheet
        ref={ref}
        title="Create New Habit"
        subtitle="Build habits together"
        icon="people"
        onClose={handleClose}
        onDismiss={handleDismiss}
        snapPoints={["83%"]}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingBottom: 100,
            backgroundColor: theme.colors.background[1],
          }}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 px-6 py-8 gap-8">
              {/* Title Input Section */}
              <View className="gap-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className="items-center justify-center rounded-xl"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: theme.colors.primary + "15",
                    }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    className="font-semibold text-lg flex-1"
                    style={{ color: theme.colors.text.primary }}
                  >
                    What habit would you like to build?
                  </Text>
                </View>

                <View className="relative">
                  <View
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      borderWidth: 2,
                      borderColor: validationError
                        ? "#ef4444"
                        : newTitle.trim() && !validationError
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                    }}
                  >
                    <BottomSheetTextInput
                      placeholder="e.g., Read for 30 minutes"
                      value={newTitle}
                      onChangeText={handleTitleChange}
                      returnKeyType="done"
                      maxLength={50}
                      multiline={false}
                      textAlignVertical="center"
                      style={{
                        fontWeight: "500",
                        color: theme.colors.text.primary,
                        fontSize: 16,
                        paddingLeft: 20,
                        paddingRight: 56,
                        paddingTop: 18,
                        paddingBottom: 18,
                        height: 56,
                      }}
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                    <View
                      className="absolute right-4 top-1/2 items-center justify-center"
                      style={{
                        transform: [{ translateY: -12 }],
                        width: 24,
                        height: 24,
                      }}
                    >
                      {validationError ? (
                        <Ionicons
                          name="alert-circle"
                          size={24}
                          color="#ef4444"
                        />
                      ) : newTitle.trim() && newTitle.trim().length >= 3 ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      ) : null}
                    </View>
                  </View>

                  {validationError ? (
                    <View className="flex-row items-center gap-2 mt-3">
                      <Ionicons name="alert-circle" size={16} color="#ef4444" />
                      <Text className="text-red-500 text-sm font-medium">
                        {validationError}
                      </Text>
                    </View>
                  ) : newTitle.trim() &&
                    newTitle.trim().length >= 3 &&
                    !validationError ? (
                    <View className="flex-row items-center gap-2 mt-3">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text
                        className="text-sm font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        Perfect! ({newTitle.length}/50 characters)
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className="text-sm mt-3"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      {newTitle.length}/50 characters
                    </Text>
                  )}
                </View>
              </View>

              {/* Frequency Selector */}
              <View className="gap-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className="items-center justify-center rounded-xl"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: theme.colors.primary + "15",
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    className="font-semibold text-lg flex-1"
                    style={{ color: theme.colors.text.primary }}
                  >
                    How often?
                  </Text>
                </View>

                {/* Frequency Selection Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setNewFreq("daily")}
                    className="flex-1 p-4 rounded-2xl"
                    style={{
                      backgroundColor:
                        newFreq === "daily"
                          ? theme.colors.primary + "15"
                          : theme.colors.cardBackground,
                      borderWidth: 2,
                      borderColor:
                        newFreq === "daily"
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons
                        name="sunny"
                        size={18}
                        color={
                          newFreq === "daily"
                            ? theme.colors.primary
                            : theme.colors.text.tertiary
                        }
                      />
                      <Text
                        className="font-semibold text-base"
                        style={{
                          color:
                            newFreq === "daily"
                              ? theme.colors.primary
                              : theme.colors.text.secondary,
                        }}
                      >
                        Daily
                      </Text>
                      {newFreq === "daily" && (
                        <View className="ml-auto">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-sm"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      Build momentum with consistent daily practice
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setNewFreq("weekly")}
                    className="flex-1 p-4 rounded-2xl"
                    style={{
                      backgroundColor:
                        newFreq === "weekly"
                          ? theme.colors.primary + "15"
                          : theme.colors.cardBackground,
                      borderWidth: 2,
                      borderColor:
                        newFreq === "weekly"
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={
                          newFreq === "weekly"
                            ? theme.colors.primary
                            : theme.colors.text.tertiary
                        }
                      />
                      <Text
                        className="font-semibold text-base"
                        style={{
                          color:
                            newFreq === "weekly"
                              ? theme.colors.primary
                              : theme.colors.text.secondary,
                        }}
                      >
                        Weekly
                      </Text>
                      {newFreq === "weekly" && (
                        <View className="ml-auto">
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-sm"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      Perfect for bigger goals that need more time
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-4 mt-auto">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 items-center justify-center py-4 rounded-2xl"
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    borderWidth: 2,
                    borderColor: theme.colors.cardBorder,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="close"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                    <Text
                      className="font-semibold text-base"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateHabit}
                  disabled={!!validationError || !newTitle.trim() || isCreating}
                  className="flex-1 items-center justify-center py-4 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor:
                      !!validationError || !newTitle.trim() || isCreating
                        ? theme.colors.primary
                        : theme.colors.cardBorder,
                    opacity:
                      !!validationError || !newTitle.trim() || isCreating
                        ? 1
                        : 0.6,
                  }}
                >
                  <LinearGradient
                    colors={
                      !!validationError || !newTitle.trim() || isCreating
                        ? [
                            theme.colors.cardBackground,
                            theme.colors.cardBackground,
                          ]
                        : [theme.colors.primary, theme.colors.primaryLight]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute inset-0"
                  />

                  {isCreating ? (
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold text-base">
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <Ionicons
                        name="rocket"
                        size={20}
                        color={
                          !!validationError || !newTitle.trim()
                            ? theme.colors.text.tertiary
                            : "white"
                        }
                      />
                      <Text
                        className="font-semibold text-base"
                        style={{
                          color:
                            !!validationError || !newTitle.trim()
                              ? theme.colors.text.tertiary
                              : "white",
                        }}
                      >
                        Start Building
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TandrumBottomSheet>
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={closeAlert}
      />
    </>
  );
});

CreateHabitBottomSheet.displayName = "CreateHabitBottomSheet";

export { CreateHabitBottomSheet };
