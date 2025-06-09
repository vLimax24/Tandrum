import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
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
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import RNPickerSelect from "react-native-picker-select";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface CreateHabitBottomSheetProps {
  onCreate: any;
  duo: any;
  existingHabits: any[];
}

const CreateHabitBottomSheet = React.forwardRef<
  BottomSheetModal,
  CreateHabitBottomSheetProps
>(({ onCreate, duo, existingHabits = [] }, ref) => {
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Updated snap points with more flexibility for keyboard
  const snapPoints = useMemo(() => ["65%", "85%"], []);

  useEffect(() => {
    // Animate content when sheet opens
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      Alert.alert("Error", "No duo selected. Please try again.");
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
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = useCallback(() => {
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }
    // Reset form
    setTimeout(() => {
      setNewTitle("");
      setNewFreq("daily");
      setValidationError("");
      setIsCreating(false);
    }, 300);
  }, [ref]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        style={[props.style, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}
      />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    setValidationError("");
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <BottomSheetModal
      ref={ref}
      handleComponent={null}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableDismissOnClose
      // Fixed keyboard handling props
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
      <BottomSheetView className="flex-1">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
          className="flex-1"
        >
          {/* Header */}
          <View className="relative overflow-hidden">
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
              {/* Background decorative elements */}
              <View className="absolute inset-0 overflow-hidden">
                <View
                  className="absolute rounded-full opacity-10"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "white",
                    top: -40,
                    right: -20,
                  }}
                />
                <View
                  className="absolute rounded-full opacity-5"
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "white",
                    bottom: -20,
                    left: -10,
                  }}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="mr-3 items-center justify-center rounded-full"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Ionicons name="add-circle" size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      Create New Habit
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Build lasting habits together
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Content */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 px-6 py-6">
              {/* Title Input */}
              <View className="mb-6">
                <Text className="text-gray-900 font-semibold text-lg mb-3">
                  Habit Title
                </Text>
                <View
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 2,
                    borderColor: validationError
                      ? "#ef4444" // Red for validation errors
                      : newTitle.trim() && !validationError
                        ? "#10b981" // Green matching header when valid
                        : "#e5e7eb", // Default gray
                  }}
                >
                  <BottomSheetTextInput
                    className="text-gray-900 text-base"
                    placeholder="Read 30 Minutes"
                    placeholderTextColor="#9CA3AF"
                    value={newTitle}
                    onChangeText={handleTitleChange}
                    returnKeyType="done"
                    maxLength={50}
                    multiline={false}
                    textAlignVertical="center"
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      width: 1000,
                      fontSize: 16,
                      paddingLeft: 16,
                      paddingRight: 48, // Always reserve space for icon
                      paddingTop: 16,
                      paddingBottom: 16,
                      height: 52, // Fixed height instead of minHeight
                      includeFontPadding: false, // Android: removes extra font padding
                      textAlignVertical: "center", // Ensure vertical centering
                    }}
                  />
                  {/* Icon area - always present to prevent layout shifts */}
                  <View
                    className="absolute right-3 top-1/2 items-center justify-center"
                    style={{
                      transform: [{ translateY: -10 }],
                      width: 20,
                      height: 20,
                    }}
                  >
                    {validationError ? (
                      <Ionicons name="warning" size={20} color="#ef4444" />
                    ) : newTitle.trim() && newTitle.trim().length >= 3 ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10b981"
                      />
                    ) : null}
                  </View>
                </View>

                {validationError ? (
                  <View className="flex-row items-center mt-3">
                    <Ionicons name="warning" size={16} color="#ef4444" />
                    <Text className="text-red-500 text-sm font-medium ml-2">
                      {validationError}
                    </Text>
                  </View>
                ) : newTitle.trim() &&
                  newTitle.trim().length >= 3 &&
                  !validationError ? (
                  <View className="flex-row items-center mt-3">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10b981"
                    />
                    <Text className="text-green-600 text-sm font-medium ml-2">
                      Looks good! ({newTitle.length}/50 characters)
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-500 text-sm mt-2">
                    {newTitle.length}/50 characters
                  </Text>
                )}
              </View>

              {/* Frequency Selector */}
              <View className="mb-8">
                <Text className="text-gray-900 font-semibold text-lg mb-3">
                  Frequency
                </Text>
                <View
                  className="overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 2,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <RNPickerSelect
                    onValueChange={setNewFreq}
                    value={newFreq}
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
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    )}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-auto">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 items-center justify-center py-4 rounded-xl"
                  style={{
                    backgroundColor: "#f3f4f6",
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                  }}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateHabit}
                  disabled={!!validationError || !newTitle.trim() || isCreating}
                  className="flex-1 items-center justify-center py-4 rounded-xl"
                  style={{
                    backgroundColor:
                      !!validationError || !newTitle.trim() || isCreating
                        ? "#e5e7eb"
                        : "#57b686",
                    shadowColor:
                      !!validationError || !newTitle.trim() || isCreating
                        ? "transparent"
                        : "#57b686",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation:
                      !!validationError || !newTitle.trim() || isCreating
                        ? 0
                        : 6,
                  }}
                >
                  {isCreating ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold text-base ml-2">
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={
                          !!validationError || !newTitle.trim()
                            ? "#9ca3af"
                            : "white"
                        }
                      />
                      <Text
                        className="font-semibold text-base ml-2"
                        style={{
                          color:
                            !!validationError || !newTitle.trim()
                              ? "#9ca3af"
                              : "white",
                        }}
                      >
                        Create Habit
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

CreateHabitBottomSheet.displayName = "CreateHabitBottomSheet";

export { CreateHabitBottomSheet };
