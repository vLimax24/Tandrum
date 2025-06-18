import React, {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { TandrumBottomSheet } from "./TandrumBottomSheet";

interface HabitEditBottomSheetProps {
  onSave: (data: {
    title: string;
    frequency: "daily" | "weekly";
  }) => Promise<void>;
  habit: {
    _id: string;
    title: string;
    frequency: "daily" | "weekly";
  } | null;
  existingHabits: Array<{ _id: string; title: string }>;
}

const HabitEditBottomSheet = forwardRef<
  BottomSheetModal,
  HabitEditBottomSheetProps
>(({ onSave, habit, existingHabits }, ref) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));

  // Add this ref to track previous frequency
  const previousFrequencyRef = useRef<"daily" | "weekly" | null>(null);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setFrequency(habit.frequency);
      setValidationError("");
      previousFrequencyRef.current = habit.frequency; // Store initial frequency
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [habit]);

  const snapPoints = useMemo(() => {
    const hasFrequencyChanged = habit && frequency !== habit.frequency;
    return hasFrequencyChanged ? ["85%", "97%"] : ["85%"];
  }, [habit, frequency]);

  // Update the useEffect to handle frequency changes and auto-expand/collapse
  useEffect(() => {
    if (habit && previousFrequencyRef.current) {
      const hasFrequencyChanged = frequency !== habit.frequency;
      const wasFrequencyChanged =
        previousFrequencyRef.current !== habit.frequency;

      // Handle transitions between states
      if (hasFrequencyChanged && !wasFrequencyChanged) {
        // Transitioning from no change to change - expand to 95%
        setTimeout(() => {
          (ref as any)?.current?.snapToIndex(1); // 95% is index 1 when warning shows
        }, 50);
      } else if (!hasFrequencyChanged && wasFrequencyChanged) {
        // Transitioning from change back to no change - collapse to 85% first
        // Snap to 85% while we still have both snap points available
        (ref as any)?.current?.snapToIndex(0); // 85% is index 0
        // The snap points will change after this effect runs
      }
    }
    previousFrequencyRef.current = frequency;
  }, [frequency, habit, ref]);

  const validateHabitTitle = useCallback(
    (inputTitle: string): string => {
      const trimmedTitle = inputTitle.trim();
      if (!trimmedTitle) {
        return "Habit title is required";
      }
      if (trimmedTitle.length < 3) {
        return "Habit title must be at least 3 characters long";
      }
      if (trimmedTitle.length > 50) {
        return "Habit title must be less than 50 characters";
      }
      const duplicateExists = existingHabits.some(
        (h) =>
          h._id !== habit?._id &&
          h.title.toLowerCase() === trimmedTitle.toLowerCase()
      );
      if (duplicateExists) {
        return "A habit with this title already exists";
      }
      return "";
    },
    [existingHabits, habit]
  );

  const handleTitleChange = useCallback(
    (text: string) => {
      setTitle(text);
      if (validationError) {
        const error = validateHabitTitle(text);
        setValidationError(error);
      }
    },
    [validationError, validateHabitTitle]
  );

  const handleSave = useCallback(async () => {
    const error = validateHabitTitle(title);
    if (error) {
      setValidationError(error);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        frequency,
      });
      (ref as any)?.current?.dismiss();
    } catch (error) {
      console.error("Failed to update habit:", error);
    } finally {
      setIsSaving(false);
    }
  }, [title, frequency, validateHabitTitle, onSave, ref]);

  const handleDismiss = useCallback(() => {
    setValidationError("");
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!habit) return null;

  const hasChanges =
    title.trim() !== habit.title || frequency !== habit.frequency;
  const canSave = !validationError && title.trim() && hasChanges && !isSaving;

  return (
    <TandrumBottomSheet
      ref={ref}
      title="Edit Habit"
      subtitle="Modify your collaborative habit"
      icon="people"
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
    >
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          paddingBottom: 100,
        }}
      >
        {/* Content */}
        <View
          className="px-6 py-6 flex-1"
          style={{ backgroundColor: theme.colors.background[1] }}
        >
          {/* Title Input Section */}
          <View className="mb-6 gap-4">
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
                Habit Title
              </Text>
            </View>
            <View
              className="rounded-2xl border-2"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: validationError
                  ? "rgba(239, 68, 68, 0.4)"
                  : theme.colors.cardBorder,
              }}
            >
              <BottomSheetTextInput
                className="px-4 py-4 text-base font-medium"
                style={{
                  color: theme.colors.text.primary,
                  minHeight: 52,
                }}
                placeholder="Enter your habit title"
                placeholderTextColor={theme.colors.text.tertiary}
                value={title}
                onChangeText={handleTitleChange}
                returnKeyType="done"
                maxLength={50}
                multiline={false}
              />
            </View>
            {validationError ? (
              <View
                className="flex-row items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                }}
              >
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm font-medium flex-1">
                  {validationError}
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-sm"
                  style={{ color: theme.colors.text.tertiary }}
                >
                  {title.length}/50 characters
                </Text>
                {hasChanges && (
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: `${theme.colors.primary}20`,
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: theme.colors.primary }}
                    >
                      Modified
                    </Text>
                  </View>
                )}
              </View>
            )}
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
                onPress={() => setFrequency("daily")}
                className="flex-1 p-4 rounded-2xl"
                style={{
                  backgroundColor:
                    frequency === "daily"
                      ? theme.colors.primary + "15"
                      : theme.colors.cardBackground,
                  borderWidth: 2,
                  borderColor:
                    frequency === "daily"
                      ? theme.colors.primary
                      : theme.colors.cardBorder,
                }}
              >
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons
                    name="sunny"
                    size={18}
                    color={
                      frequency === "daily"
                        ? theme.colors.primary
                        : theme.colors.text.tertiary
                    }
                  />
                  <Text
                    className="font-semibold text-base"
                    style={{
                      color:
                        frequency === "daily"
                          ? theme.colors.primary
                          : theme.colors.text.secondary,
                    }}
                  >
                    Daily
                  </Text>
                  {frequency === "daily" && (
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
                onPress={() => setFrequency("weekly")}
                className="flex-1 p-4 rounded-2xl"
                style={{
                  backgroundColor:
                    frequency === "weekly"
                      ? theme.colors.primary + "15"
                      : theme.colors.cardBackground,
                  borderWidth: 2,
                  borderColor:
                    frequency === "weekly"
                      ? theme.colors.primary
                      : theme.colors.cardBorder,
                }}
              >
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={
                      frequency === "weekly"
                        ? theme.colors.primary
                        : theme.colors.text.tertiary
                    }
                  />
                  <Text
                    className="font-semibold text-base"
                    style={{
                      color:
                        frequency === "weekly"
                          ? theme.colors.primary
                          : theme.colors.text.secondary,
                    }}
                  >
                    Weekly
                  </Text>
                  {frequency === "weekly" && (
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

          {/* Frequency Change Warning */}
          {frequency !== habit.frequency && (
            <View
              className="flex-row gap-3 p-4 rounded-2xl border mt-2"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.05)",
                borderColor: "rgba(245, 158, 11, 0.2)",
              }}
            >
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <View className="flex-1">
                <Text className="text-amber-600 font-semibold text-sm mb-1">
                  Team Progress Reset
                </Text>
                <Text className="text-amber-700 text-xs leading-4">
                  Changing frequency will reset check-in status for all team
                  members. Progress will be cleared to ensure fair
                  collaboration.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View
          className="px-6 pb-8 pt-4"
          style={{
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
            borderTopWidth: 1,
            borderTopColor: theme.colors.cardBorder,
            backgroundColor: theme.colors.background[1],
          }}
        >
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => (ref as any)?.current?.dismiss()}
              className="flex-1 rounded-2xl py-4 border"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <Text
                className="text-center font-semibold text-base"
                style={{ color: theme.colors.text.secondary }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              className="flex-1 rounded-2xl py-4"
              style={{
                backgroundColor: canSave
                  ? theme.colors.primary
                  : theme.colors.cardBorder,
                opacity: canSave ? 1 : 0.6,
              }}
            >
              {isSaving ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-base">
                    Saving...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text className="text-white font-semibold text-base">
                    Save Changes
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text
            className="text-center text-xs mt-3 opacity-70"
            style={{ color: theme.colors.text.tertiary }}
          >
            Changes will sync with your teammates immediately
          </Text>
        </View>
      </Animated.View>
    </TandrumBottomSheet>
  );
});

HabitEditBottomSheet.displayName = "HabitEditBottomSheet";
export default HabitEditBottomSheet;
