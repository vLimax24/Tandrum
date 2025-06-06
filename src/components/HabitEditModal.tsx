// HabitEditModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface HabitEditModalProps {
  visible: boolean;
  onClose: () => void;
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

const HabitEditModal: React.FC<HabitEditModalProps> = ({
  visible,
  onClose,
  onSave,
  habit,
  existingHabits,
}) => {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [modalOpacity] = useState(new Animated.Value(0));

  // Initialize form when habit changes
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setFrequency(habit.frequency);
      setValidationError("");
    }
  }, [habit]);

  // Enhanced validation function
  const validateHabitTitle = (inputTitle: string): string => {
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
  };

  // Enhanced input change handler
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (validationError) {
      const error = validateHabitTitle(text);
      setValidationError(error);
    }
  };

  // Modal animation handlers
  const showModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      showModal();
    }
  }, [visible]);

  // Enhanced save handler
  const handleSave = async () => {
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
      hideModal();
    } catch (error) {
      console.error("Failed to update habit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!habit) return null;

  // Check if changes were made
  const hasChanges =
    title.trim() !== habit.title || frequency !== habit.frequency;
  const canSave = !validationError && title.trim() && hasChanges && !isSaving;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hideModal}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          opacity: modalOpacity,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [
              {
                translateY: modalOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          {/* Gradient Header */}
          <View
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingVertical: 24,
              position: "relative",
              overflow: "hidden",
              backgroundColor: "rgba(16,185,129,0.95)",
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
                  top: 8,
                  right: 8,
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
                  bottom: 8,
                  left: 8,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
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
              <View className="flex-1">
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  Edit Habit
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    opacity: 0.9,
                    marginTop: 4,
                  }}
                >
                  Modify your habit details
                </Text>
              </View>
              <TouchableOpacity
                onPress={hideModal}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Section */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
            {/* Title Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "600",
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                Habit Title
              </Text>
              <View
                style={{
                  backgroundColor: "#f8fafc", // Changed to solid color
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
                <TextInput
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: "#111827",
                    fontWeight: "500",
                    backgroundColor: "transparent", // Added this
                  }}
                  placeholder="Enter your habit"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={handleTitleChange}
                  autoFocus
                  returnKeyType="done"
                  maxLength={50}
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
                  <Text
                    style={{
                      color: "#dc2626",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    ⚠️ {validationError}
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
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>
                    {title.length}/50 characters
                  </Text>
                  {hasChanges && (
                    <View className="bg-[rgba(16,185,129,0.1)] px-2 py-1 rounded-lg">
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
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#111827",
                  fontWeight: "600",
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                Frequency
              </Text>
              <View
                style={{
                  backgroundColor: "#f8fafc", // Changed to solid color
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
                      backgroundColor: "transparent", // Added this
                    },
                    inputAndroid: {
                      color: "#111827",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      fontWeight: "500",
                      backgroundColor: "transparent", // Added this
                    },
                    iconContainer: {
                      top: 20,
                      right: 16,
                    },
                  }}
                  Icon={() => (
                    <Text
                      style={{ color: "#10b981", fontSize: 16, opacity: 0.8 }}
                    >
                      ▼
                    </Text>
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
                  <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                  <Text
                    style={{
                      color: "#92400e",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Frequency Change Notice
                  </Text>
                </View>
                <Text
                  style={{ color: "#92400e", fontSize: 13, lineHeight: 18 }}
                >
                  Changing frequency will reset check-in status for all users.
                  Progress will be cleared.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={hideModal}
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6", // Changed to solid color
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
                  backgroundColor: canSave
                    ? "#10b981" // Changed to solid color
                    : "#e5e7eb", // Changed to solid color
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
            >
              Changes will be applied immediately after saving
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default HabitEditModal;
