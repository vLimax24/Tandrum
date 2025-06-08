import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useLiveTimers } from "@/hooks/useLiveTimer";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import { Id } from "../../../../convex/_generated/dataModel";
import { LinearGradient } from "expo-linear-gradient";
import { StreakVisualization } from "@/components/StreakVisualization";
import HabitActionMenu from "@/components/HabitActionMenu";
import HabitEditModal from "@/components/HabitEditModal";
import { NoDuoScreen } from "@/components/NoDuoScreen";

export default function HabitsSection() {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL LOGIC
  const { user } = useUser();
  const { timeToday, timeWeek } = useLiveTimers();
  const { selectedIndex, setSelectedIndex } = useDuo();

  // All state hooks
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [modalOpacity] = useState(new Animated.Value(0));
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [noDuoModalVisible, setNoDuoModalVisible] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Derived values
  const clerkId = user?.id;

  // ALL useQuery and useMutation hooks - these must be called unconditionally
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  const connections = useQuery(
    api.duoConnections.getConnectionsForUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const habits = useQuery(
    api.duoHabits.getHabitsForDuo,
    connections && connections[selectedIndex]
      ? { duoId: connections[selectedIndex]._id }
      : "skip"
  );
  const checkInHabit = useMutation(api.duoHabits.checkInHabit);
  const deleteHabit = useMutation(api.duoHabits.deleteHabit);
  const createHabit = useMutation(api.duoHabits.createHabit);
  const updateHabit = useMutation(api.duoHabits.updateHabit);

  // All useEffect hooks
  useEffect(() => {
    if (connections && selectedIndex >= connections.length) {
      setSelectedIndex(0);
    }
  }, [connections, selectedIndex, setSelectedIndex]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Tree images constant
  const treeImages: Record<string, any> = {
    sprout: require("../../../assets/tree-1.png"),
    smallTree: require("../../../assets/tree-2.png"),
    mediumTree: require("../../../assets/tree-1.png"),
    grownTree: require("../../../assets/tree-1.png"),
    orange: require("../../../assets/orange.png"),
    leaf: require("../../../assets/hemp-leaf.png"),
    calendar: require("../../../assets/calendar.png"),
  };

  const isSameDay = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSameWeek = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    // Get the start of the week (Sunday) for both dates
    const startOfWeek1 = new Date(date1);
    startOfWeek1.setDate(date1.getDate() - date1.getDay());
    startOfWeek1.setHours(0, 0, 0, 0);

    const startOfWeek2 = new Date(date2);
    startOfWeek2.setDate(date2.getDate() - date2.getDay());
    startOfWeek2.setHours(0, 0, 0, 0);

    return startOfWeek1.getTime() === startOfWeek2.getTime();
  };

  // Handler functions
  const handleMenuPress = (event: any, habit: any) => {
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({ x: pageX, y: pageY });
      setActiveMenuHabitId(habit._id);
    });
  };

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (data: {
    title: string;
    frequency: "daily" | "weekly";
  }) => {
    if (!editingHabit) return;

    try {
      await updateHabit({
        habitId: editingHabit._id,
        title: data.title,
        frequency: data.frequency,
      });
      setEditModalVisible(false);
      setEditingHabit(null);
    } catch (error) {
      console.error("Failed to update habit:", error);
      Alert.alert("Error", "Failed to update habit. Please try again.");
    }
  };

  // Enhanced validation function
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
    // Check for duplicate habits
    if (
      habits?.some((h) => h.title.toLowerCase() === trimmedTitle.toLowerCase())
    ) {
      return "A habit with this title already exists";
    }
    return "";
  };

  // Enhanced input change handler
  const handleTitleChange = (text: string) => {
    setNewTitle(text);
    if (validationError) {
      const error = validateHabitTitle(text);
      setValidationError(error);
    }
  };

  // time tracking
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Modal animation handlers
  const showModal = () => {
    setModalVisible(true);
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
      setModalVisible(false);
      setNewTitle("");
      setValidationError("");
    });
  };

  if (!convexUser || !connections || !habits) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-[#374151] mt-4 text-lg font-medium text-center">
            Loading your habits...
          </Text>
        </View>
      </View>
    );
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === "daily");
  const weekly = habits.filter((h) => h.frequency === "weekly");
  const amI_A = convexUser._id === duo.user1;

  const handleDeleteHabit = (habitId: Id<"duoHabits">, habitTitle: string) => {
    // Use setTimeout to ensure navigation context is available
    setTimeout(() => {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habitTitle}"? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteHabit({ habitId });
              } catch (error) {
                setTimeout(() => {
                  Alert.alert(
                    "Error",
                    "Failed to delete habit. Please try again."
                  );
                }, 100);
              }
            },
          },
        ]
      );
    }, 100);
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
      await createHabit({
        title: newTitle.trim(),
        frequency: newFreq,
        duoId: duo._id,
      });
      hideModal();
    } catch (error) {
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const HabitItem = ({
    habit,
    isDoneByMe,
    isDoneByPartner,
    onCheck,
    onMenuPress,
  }) => (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-[#f3f4f6]">
      <View className="flex-row items-center">
        <View className="flex-1 mr-4">
          <Text className="text-[#111827] font-semibold text-base mb-1">
            {habit.title}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-[#f3f4f6] rounded-full px-3 py-1">
              <Text className="text-[#6b7280] text-xs font-medium capitalize">
                {habit.frequency === "daily" ? "Daily" : "Weekly"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* My completion status */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-full border-2 ${
              isDoneByMe
                ? "bg-[#10b981] border-[#10b981] shadow-lg"
                : "border-[#e5e7eb] bg-[#f9fafb] hover:border-[#10b981]"
            } flex items-center justify-center`}
            onPress={onCheck}
            style={{
              shadowColor: isDoneByMe ? "#10b981" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDoneByMe ? 0.3 : 0,
              shadowRadius: 4,
              elevation: isDoneByMe ? 4 : 0,
            }}
          >
            {isDoneByMe && (
              <Text className="text-white font-bold text-lg">✓</Text>
            )}
          </TouchableOpacity>

          {/* Partner's completion status */}
          <View
            className={`w-12 h-12 rounded-full border-2 ${
              isDoneByPartner
                ? "bg-[#059669] border-[#059669] shadow-lg"
                : "border-[#e5e7eb] bg-[#f9fafb]"
            } flex items-center justify-center`}
            style={{
              shadowColor: isDoneByPartner ? "#059669" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDoneByPartner ? 0.3 : 0,
              shadowRadius: 4,
              elevation: isDoneByPartner ? 4 : 0,
            }}
          >
            {isDoneByPartner && (
              <Text className="text-white font-bold text-lg">✓</Text>
            )}
          </View>

          {/* 3-dot menu button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full flex items-center justify-center"
            onPress={(event) => onMenuPress(event, habit)}
          >
            <View className="flex-col items-center justify-center gap-[3px]">
              <View className="w-1 h-1 bg-[#000] rounded-full opacity-80" />
              <View className="w-1 h-1 bg-[#000] rounded-full opacity-80" />
              <View className="w-1 h-1 bg-[#000] rounded-full opacity-80" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const dailyLabel = timeToday;
  const weeklyLabel = timeWeek;

  return (
    <>
      <LinearGradient
        colors={["#f8fafc", "#dbeafe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-6 pt-16 pb-8 bg-gradient-to-r from-[#10b981] to-[#059669]">
            <Text className="text-black text-4xl font-bold mb-2">Habits</Text>
          </View>

          <View className="px-6 -mt-6">
            {/* Duo Selector Card */}
            {/* Duo Selector - Updated without box */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-text mb-2">
                Select Duo
              </Text>
              <View className="bg-primary rounded-lg px-4 py-2 flex-row items-center">
                <Image
                  source={treeImages["leaf"]}
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                <View
                  style={{
                    flex: 1,
                    position: "relative",
                    justifyContent: "center",
                  }}
                >
                  <RNPickerSelect
                    onValueChange={setSelectedIndex}
                    placeholder={{}}
                    value={selectedIndex}
                    items={connections.map((c, i) => ({
                      label: `Duo with ${c.partnerName}`,
                      value: i,
                    }))}
                    useNativeAndroidPickerStyle={false}
                    style={{
                      inputIOS: {
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "500",
                        paddingVertical: 10,
                        paddingRight: 32,
                        paddingLeft: 8,
                        borderRadius: 8,
                        backgroundColor: "transparent",
                      },
                      inputAndroid: {
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "500",
                        paddingVertical: 10,
                        paddingRight: 32,
                        paddingLeft: 8,
                        borderRadius: 8,
                        backgroundColor: "transparent",
                      },
                      iconContainer: {
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        marginTop: -12,
                      },
                    }}
                    Icon={() => (
                      <Text style={{ color: "#fff", fontSize: 18 }}>▼</Text>
                    )}
                  />
                </View>
              </View>
            </View>

            <LevelDisplay duo={duo} />

            {/* Enhanced Streak Display */}
            <StreakVisualization duo={duo} />

            {/* Daily Habits Section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-[#111827] font-bold text-2xl">
                    Daily Habits
                  </Text>
                  <Text className="text-[#6b7280] text-sm mt-1">
                    Reset in {dailyLabel}
                  </Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <View className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1">
                    <Text className="text-[#059669] text-xs font-semibold">
                      You
                    </Text>
                  </View>
                  <View className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-3 py-1">
                    <Text className="text-[#1d4ed8] text-xs font-semibold">
                      {duo.partnerName?.split(" ")[0]}
                    </Text>
                  </View>
                </View>
              </View>

              {daily.length === 0 ? (
                <View className="bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl p-8 text-center">
                  <View className="w-16 h-16 bg-[#f3f4f6] rounded-full items-center justify-center mx-auto mb-4">
                    <Text className="text-[#9ca3af] text-2xl">📅</Text>
                  </View>
                  <Text className="text-[#6b7280] text-center text-base">
                    No daily habits yet. Create one to get started!
                  </Text>
                </View>
              ) : (
                daily.map((h) => {
                  const lastA = h.last_checkin_at_userA ?? 0;
                  const lastB = h.last_checkin_at_userB ?? 0;
                  const doneA = lastA > 0 && isSameDay(lastA, now);
                  const doneB = lastB > 0 && isSameDay(lastB, now);

                  return (
                    <HabitItem
                      key={h._id}
                      habit={h}
                      isDoneByMe={amI_A ? doneA : doneB}
                      isDoneByPartner={amI_A ? doneB : doneA}
                      onCheck={async () => {
                        try {
                          await checkInHabit({
                            habitId: h._id,
                            userIsA: amI_A,
                          });
                        } catch (error) {
                          console.error("Check-in error:", error);
                          setTimeout(() => {
                            Alert.alert(
                              "Error",
                              "Failed to update habit. Please try again."
                            );
                          }, 100);
                        }
                      }}
                      onMenuPress={handleMenuPress}
                    />
                  );
                })
              )}
            </View>

            {/* Weekly Habits Section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-[#111827] font-bold text-2xl">
                    Weekly Habits
                  </Text>
                  <Text className="text-[#6b7280] text-sm mt-1">
                    Reset in {weeklyLabel}
                  </Text>
                </View>
              </View>

              {weekly.length === 0 ? (
                <View className="bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl p-8 text-center">
                  <View className="w-16 h-16 bg-[#f3f4f6] rounded-full items-center justify-center mx-auto mb-4">
                    <Text className="text-[#9ca3af] text-2xl">📊</Text>
                  </View>
                  <Text className="text-[#6b7280] text-center text-base">
                    No weekly habits yet. Create one to get started!
                  </Text>
                </View>
              ) : (
                weekly.map((h) => {
                  const lastA = h.last_checkin_at_userA ?? 0;
                  const lastB = h.last_checkin_at_userB ?? 0;
                  const doneA = lastA > 0 && isSameWeek(lastA, now);
                  const doneB = lastB > 0 && isSameWeek(lastB, now);

                  return (
                    <HabitItem
                      key={h._id}
                      habit={h}
                      isDoneByMe={amI_A ? doneA : doneB}
                      isDoneByPartner={amI_A ? doneB : doneA}
                      onCheck={async () => {
                        try {
                          await checkInHabit({
                            habitId: h._id,
                            userIsA: amI_A,
                          });
                        } catch (error) {
                          console.error("Check-in error:", error);
                          setTimeout(() => {
                            Alert.alert(
                              "Error",
                              "Failed to update habit. Please try again."
                            );
                          }, 100);
                        }
                      }}
                      onMenuPress={handleMenuPress}
                    />
                  );
                })
              )}
            </View>

            {/* Enhanced Add Habit Button */}
            <TouchableOpacity
              onPress={showModal}
              style={{
                borderRadius: 16,
                marginBottom: 32,
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                overflow: "hidden",
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  padding: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View className="flex-row items-center justify-center">
                  <View className="w-6 h-6 bg-white bg-opacity-20 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-lg">+</Text>
                  </View>
                  <Text className="text-white font-bold text-lg">
                    Create New Habit
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Enhanced Modal */}
      <Modal
        visible={modalVisible}
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
              backgroundColor: "white",
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
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                backgroundColor: "#10b981",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingVertical: 24,
                position: "relative",
                overflow: "hidden",
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
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  Create New Habit
                </Text>
                <TouchableOpacity
                  onPress={hideModal}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
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

            {/* Modal Content */}
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
                <TextInput
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 2,
                    borderColor: validationError ? "#dc2626" : "#e5e7eb",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: "#111827",
                  }}
                  placeholder="Enter your habit (e.g., Drink 8 glasses of water)"
                  placeholderTextColor="#9CA3AF"
                  value={newTitle}
                  onChangeText={handleTitleChange}
                  autoFocus
                  returnKeyType="done"
                  maxLength={50}
                />
                {validationError ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
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
                  <Text
                    style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}
                  >
                    {newTitle.length}/50 characters
                  </Text>
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
                    backgroundColor: "#f8fafc",
                    borderWidth: 2,
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
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
                      <Text style={{ color: "#6B7280", fontSize: 16 }}>▼</Text>
                    )}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={hideModal}
                  style={{
                    flex: 1,
                    backgroundColor: "#f3f4f6",
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 12,
                    paddingVertical: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#111827",
                      fontWeight: "600",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateHabit}
                  disabled={!!validationError || !newTitle.trim() || isCreating}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 16,
                    backgroundColor:
                      validationError || !newTitle.trim() || isCreating
                        ? "#e5e7eb"
                        : "#10b981",
                    shadowColor:
                      validationError || !newTitle.trim() || isCreating
                        ? "transparent"
                        : "#10b981",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation:
                      validationError || !newTitle.trim() || isCreating ? 0 : 4,
                  }}
                >
                  {isCreating ? (
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
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: 16,
                        color:
                          validationError || !newTitle.trim()
                            ? "#9ca3af"
                            : "white",
                      }}
                    >
                      Create Habit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      <HabitActionMenu
        visible={activeMenuHabitId !== null}
        onClose={() => setActiveMenuHabitId(null)}
        onEdit={() => {
          const habit = habits?.find((h) => h._id === activeMenuHabitId);
          if (habit) {
            handleEditHabit(habit);
            setActiveMenuHabitId(null);
          }
        }}
        onDelete={() => {
          const habit = habits?.find((h) => h._id === activeMenuHabitId);
          if (habit) {
            handleDeleteHabit(habit._id, habit.title);
            setActiveMenuHabitId(null);
          }
        }}
        buttonPosition={menuPosition}
      />

      {/* Edit Modal */}
      <HabitEditModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveEdit}
        habit={editingHabit}
        existingHabits={habits || []}
      />
    </>
  );
}
