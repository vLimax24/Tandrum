import React, {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import RNPickerSelect from "react-native-picker-select";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));

  // Updated snap points with more flexibility
  const snapPoints = useMemo(() => ["73%", "90%"], []);

  // Initialize form when habit changes
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setFrequency(habit.frequency);
      setValidationError("");

      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [habit]);

  // Enhanced validation function
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

      // Check for duplicate habits (excluding current habit)
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

  // Enhanced input change handler
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

  // Enhanced save handler
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

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
      />
    ),
    []
  );

  if (!habit) return null;

  // Check if changes were made
  const hasChanges =
    title.trim() !== habit.title || frequency !== habit.frequency;
  const canSave = !validationError && title.trim() && hasChanges && !isSaving;

  return (
    <BottomSheetModal
      ref={ref}
      handleComponent={null}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableDismissOnClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
      enableDynamicSizing={false}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 24,
      }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
          }}
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 20,
              position: "relative",
              overflow: "hidden",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            {/* Background pattern */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "white",
                  opacity: 0.2,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: -10,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "white",
                  opacity: 0.15,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Ionicons
                    name="create-outline"
                    size={24}
                    color="white"
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: "bold",
                    }}
                    className=" font-mainRegular"
                  >
                    Edit Habit
                  </Text>
                </View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    opacity: 0.9,
                  }}
                  className="font-mainRegular"
                >
                  Modify your habit details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => (ref as any)?.current?.dismiss()}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 24, flex: 1 }}>
            {/* Title Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "600",
                  fontSize: 16,
                  marginBottom: 12,
                }}
                className="font-mainRegular"
              >
                Habit Title
              </Text>
              <View
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 2,
                  borderColor: validationError
                    ? "rgba(220,38,38,0.5)"
                    : "rgba(16,185,129,0.2)",
                  borderRadius: 16,
                  shadowColor: validationError ? "#dc2626" : "#10b981",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <BottomSheetTextInput
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: "#111827",
                    fontWeight: "500",
                    minHeight: 50,
                  }}
                  placeholder="Enter your habit"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={handleTitleChange}
                  returnKeyType="done"
                  maxLength={50}
                  multiline={false}
                  blurOnSubmit={true}
                />
              </View>

              {validationError ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                    backgroundColor: "rgba(220,38,38,0.05)",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "rgba(220,38,38,0.2)",
                  }}
                >
                  <Ionicons
                    name="warning"
                    size={16}
                    color="#dc2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#dc2626",
                      fontSize: 14,
                      fontWeight: "500",
                      flex: 1,
                    }}
                    className="font-mainRegular"
                  >
                    {validationError}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{ color: "#6b7280", fontSize: 14 }}
                    className="font-mainRegular"
                  >
                    {title.length}/50 characters
                  </Text>
                  {hasChanges && (
                    <View
                      style={{
                        backgroundColor: "rgba(16,185,129,0.1)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#10b981",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Modified
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Frequency Selector */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "600",
                  fontSize: 16,
                  marginBottom: 12,
                }}
                className="font-mainRegular"
              >
                Frequency
              </Text>
              <View
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 2,
                  borderColor: "rgba(16,185,129,0.2)",
                  borderRadius: 16,
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <RNPickerSelect
                  onValueChange={setFrequency}
                  value={frequency}
                  placeholder={{}}
                  items={[
                    { label: "Daily - Every day", value: "daily" },
                    { label: "Weekly - Once per week", value: "weekly" },
                  ]}
                  useNativeAndroidPickerStyle={false}
                  style={{
                    inputIOS: {
                      color: "#111827",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      fontWeight: "500",
                    },
                    inputAndroid: {
                      color: "#111827",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      fontWeight: "500",
                    },
                    iconContainer: {
                      top: 20,
                      right: 16,
                    },
                  }}
                  Icon={() => (
                    <Ionicons name="chevron-down" size={20} color="#10b981" />
                  )}
                />
              </View>
            </View>

            {/* Warning for frequency change */}
            {frequency !== habit.frequency && (
              <View
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(245,158,11,0.2)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="warning"
                    size={20}
                    color="#92400e"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#92400e",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                    className="font-mainRegular"
                  >
                    Frequency Change Notice
                  </Text>
                </View>
                <Text
                  style={{ color: "#92400e", fontSize: 13, lineHeight: 18 }}
                  className="font-mainRegular"
                >
                  Changing frequency will reset check-in status for all users.
                  Progress will be cleared.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: Platform.OS === "ios" ? 34 : 24,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "rgba(229,231,235,0.5)",
              backgroundColor: "rgba(255,255,255,0.95)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => (ref as any)?.current?.dismiss()}
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  borderWidth: 1,
                  borderColor: "rgba(209,213,219,0.8)",
                  borderRadius: 16,
                  paddingVertical: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                  className="font-mainRegular"
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSave}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingVertical: 16,
                  backgroundColor: canSave ? "#10b981" : "#e5e7eb",
                  borderWidth: 1,
                  borderColor: canSave
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(209,213,219,0.8)",
                  shadowColor: canSave ? "#10b981" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: canSave ? 0.3 : 0,
                  shadowRadius: 8,
                  elevation: canSave ? 6 : 2,
                }}
              >
                {isSaving ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                      className="font-mainRegular"
                    >
                      Saving...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: 16,
                      color: canSave ? "white" : "#9ca3af",
                    }}
                    className="font-mainRegular"
                  >
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Helper text */}
            <Text
              style={{
                color: "#6b7280",
                fontSize: 12,
                textAlign: "center",
                marginTop: 12,
                opacity: 0.8,
              }}
              className="font-mainRegular"
            >
              Changes will be applied immediately after saving
            </Text>
          </View>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

HabitEditBottomSheet.displayName = "HabitEditBottomSheet";

export default HabitEditBottomSheet;
