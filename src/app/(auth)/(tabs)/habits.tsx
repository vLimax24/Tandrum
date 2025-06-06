import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useLiveTimers } from "@/hooks/useLiveTimer";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import { Id } from "../../../../convex/_generated/dataModel";

export default function HabitsSection() {
  const { user } = useUser();
  const clerkId = user.id;
  const { timeToday, timeWeek } = useLiveTimers();
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId });
  const connections = useQuery(
    api.duoConnections.getConnectionsForUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const checkInHabit = useMutation(api.duoHabits.checkInHabit);
  const deleteHabit = useMutation(api.duoHabits.deleteHabit);
  const { selectedIndex, setSelectedIndex } = useDuo();

  const treeImages: Record<string, any> = {
    sprout: require("../../../assets/Sprout.png"),
    smallTree: require("../../../assets/Baum-Klein.png"),
    mediumTree: require("../../../assets/Sprout.png"),
    grownTree: require("../../../assets/Sprout.png"),
    orange: require("../../../assets/orange.png"),
    leaf: require("../../../assets/ShowcaseLeaf.png"),
    calendar: require("../../../assets/calendar.png"),
  };

  useEffect(() => {
    if (connections && selectedIndex >= connections.length) {
      setSelectedIndex(0);
    }
  }, [connections]);

  const habits = useQuery(
    api.duoHabits.getHabitsForDuo,
    connections ? { duoId: connections[selectedIndex]._id } : "skip"
  );
  const createHabit = useMutation(api.duoHabits.createHabit);

  // Enhanced modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");

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
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!convexUser || !connections || !habits) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-text mt-4 text-lg">Loading your habits...</Text>
      </View>
    );
  }

  if (connections.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-8">
        <Image
          source={treeImages["sprout"]}
          style={{ width: 80, height: 80, marginBottom: 16, opacity: 0.6 }}
        />
        <Text className="text-text text-xl font-semibold text-center mb-2">
          No Duos Yet
        </Text>
        <Text className="text-gray-400 text-center leading-6">
          Connect with a partner to start building habits together and grow your
          tree! 🌱
        </Text>
      </View>
    );
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === "daily");
  const weekly = habits.filter((h) => h.frequency === "weekly");
  const amI_A = convexUser._id === duo.user1;

  // Enhanced streak calculation
  const calculateStreakDisplay = () => {
    const currentDate = new Date();
    const streakStartDate = duo.streakDate
      ? new Date(duo.streakDate)
      : currentDate;
    const totalStreak = duo.streak || 0;

    const streakDisplay = [];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Get current week's Monday
    const currentDay = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(
      currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      // Check if this day is within the streak period
      const isStreakDay =
        totalStreak > 0 &&
        dayDate >= streakStartDate &&
        dayDate <= currentDate &&
        Math.floor(
          (dayDate.getTime() - streakStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) < totalStreak;

      const isToday = dayDate.toDateString() === currentDate.toDateString();

      streakDisplay.push(
        <View
          key={i}
          className={`w-12 h-12 rounded-full border-2 mx-0.5 flex items-center justify-center ${
            isStreakDay
              ? "bg-accent border-accent shadow-md"
              : isToday
                ? "border-accent border-opacity-50 bg-accent bg-opacity-10"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              isStreakDay
                ? "text-white"
                : isToday
                  ? "text-accent"
                  : "text-gray-400"
            }`}
          >
            {daysOfWeek[i]}
          </Text>
          {isToday && (
            <View className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full" />
          )}
        </View>
      );
    }

    return streakDisplay;
  };

  // Enhanced habit deletion with confirmation
  const handleDeleteHabit = (habitId: Id<"duoHabits">, habitTitle: string) => {
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
              Alert.alert("Error", "Failed to delete habit. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Enhanced habit creation
  const handleCreateHabit = async () => {
    const error = validateHabitTitle(newTitle);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsCreating(true);
    try {
      await createHabit({
        title: newTitle.trim(),
        frequency: newFreq,
        duoId: duo._id,
      });
      setNewTitle("");
      setNewFreq("daily");
      setValidationError("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Enhanced habit item component
  const HabitItem = ({
    habit,
    isDoneByMe,
    isDoneByPartner,
    onCheck,
    onDelete,
  }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-base mb-1">
            {habit.title}
          </Text>
          <Text className="text-gray-500 text-sm capitalize">
            {habit.frequency === "daily" ? "Daily" : "Weekly"} habit
          </Text>
        </View>

        <View className="flex-row items-center space-x-3">
          {/* My completion status */}
          <Pressable
            className={`w-10 h-10 rounded-full border-2 ${
              isDoneByMe
                ? "bg-accent border-accent shadow-md"
                : "border-gray-200 hover:border-accent"
            } flex items-center justify-center`}
            onPress={onCheck}
          >
            {isDoneByMe && (
              <Text className="text-white font-bold text-lg">✓</Text>
            )}
          </Pressable>

          {/* Partner's completion status */}
          <View
            className={`w-10 h-10 rounded-full border-2 ${
              isDoneByPartner
                ? "bg-green-500 border-green-500"
                : "border-gray-200"
            } flex items-center justify-center`}
          >
            {isDoneByPartner && (
              <Text className="text-white font-bold text-lg">✓</Text>
            )}
          </View>

          {/* Delete button */}
          <Pressable
            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"
            onPress={() => onDelete(habit._id, habit.title)}
          >
            <Text className="text-red-500 font-bold">×</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const dailyLabel = timeToday;
  const weeklyLabel = timeWeek;

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 bg-gradient-to-r from-primary to-accent">
          <Text className="text-white text-3xl font-bold mb-2">Habits</Text>
          <Text className="text-white text-opacity-90">
            Build consistency together with your duo partner
          </Text>
        </View>

        <View className="px-6 -mt-4">
          {/* Duo Selector Card */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <Text className="text-gray-900 font-semibold mb-3">Select Duo</Text>
            <View className="bg-primary rounded-lg px-4 py-3 flex-row items-center">
              <Image
                source={treeImages["leaf"]}
                style={{ width: 20, height: 20, marginRight: 12 }}
              />
              <View className="flex-1">
                <RNPickerSelect
                  onValueChange={setSelectedIndex}
                  value={selectedIndex}
                  placeholder={{}}
                  items={connections.map((c, i) => ({
                    label: `${c.partnerName}`,
                    value: i,
                  }))}
                  useNativeAndroidPickerStyle={false}
                  style={{
                    inputIOS: {
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "600",
                      paddingVertical: 4,
                    },
                    inputAndroid: {
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "600",
                      paddingVertical: 4,
                    },
                    iconContainer: {
                      right: 0,
                      top: "50%",
                      marginTop: -12,
                    },
                  }}
                  Icon={() => (
                    <Text style={{ color: "#fff", fontSize: 16 }}>▼</Text>
                  )}
                />
              </View>
            </View>
          </View>

          <LevelDisplay duo={duo} />

          {/* Enhanced Streak Display */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-900 font-semibold text-lg">
                  Current Streak
                </Text>
                <Text className="text-gray-500 text-sm">
                  {duo.streak || 0} consecutive days
                </Text>
              </View>
              <View className="bg-accent rounded-full px-4 py-2">
                <Text className="text-white font-bold text-xl">
                  {duo.streak || 0}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              {calculateStreakDisplay()}
            </View>
          </View>

          {/* Daily Habits Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-900 font-semibold text-xl">
                  Daily Habits
                </Text>
                <Text className="text-gray-500 text-sm">
                  Reset in {dailyLabel}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <View className="bg-gray-100 rounded-lg px-3 py-1">
                  <Text className="text-gray-600 text-xs font-medium">You</Text>
                </View>
                <View className="bg-gray-100 rounded-lg px-3 py-1">
                  <Text className="text-gray-600 text-xs font-medium">
                    {duo.partnerName?.split(" ")[0]}
                  </Text>
                </View>
              </View>
            </View>

            {daily.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 text-center">
                <Text className="text-gray-400 text-center">
                  No daily habits yet. Create one to get started!
                </Text>
              </View>
            ) : (
              daily.map((h) => {
                const lastA = h.last_checkin_at_userA ?? 0;
                const lastB = h.last_checkin_at_userB ?? 0;
                const doneA = now - lastA < 86400e3;
                const doneB = now - lastB < 86400e3;

                return (
                  <HabitItem
                    key={h._id}
                    habit={h}
                    isDoneByMe={amI_A ? doneA : doneB}
                    isDoneByPartner={amI_A ? doneB : doneA}
                    onCheck={async () => {
                      await checkInHabit({ habitId: h._id, userIsA: amI_A });
                    }}
                    onDelete={handleDeleteHabit}
                  />
                );
              })
            )}
          </View>

          {/* Weekly Habits Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-900 font-semibold text-xl">
                  Weekly Habits
                </Text>
                <Text className="text-gray-500 text-sm">
                  Reset in {weeklyLabel}
                </Text>
              </View>
            </View>

            {weekly.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 text-center">
                <Text className="text-gray-400 text-center">
                  No weekly habits yet. Create one to get started!
                </Text>
              </View>
            ) : (
              weekly.map((h) => {
                const lastA = h.last_checkin_at_userA ?? 0;
                const lastB = h.last_checkin_at_userB ?? 0;
                const doneA = now - lastA < 7 * 86400e3;
                const doneB = now - lastB < 7 * 86400e3;

                return (
                  <HabitItem
                    key={h._id}
                    habit={h}
                    isDoneByMe={amI_A ? doneA : doneB}
                    isDoneByPartner={amI_A ? doneB : doneA}
                    onCheck={async () => {
                      await checkInHabit({ habitId: h._id, userIsA: amI_A });
                    }}
                    onDelete={handleDeleteHabit}
                  />
                );
              })
            )}
          </View>

          {/* Enhanced Add Habit Button */}
          <Pressable
            className="bg-accent rounded-xl p-4 mb-8 shadow-md"
            onPress={() => setModalVisible(true)}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-semibold text-lg mr-2">+</Text>
              <Text className="text-white font-semibold text-base">
                Create New Habit
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Enhanced Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Create New Habit
              </Text>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setNewTitle("");
                  setValidationError("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-600 font-bold">×</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Habit Title
              </Text>
              <TextInput
                className={`bg-gray-50 rounded-xl px-4 py-4 text-base text-gray-900 border ${
                  validationError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter your habit (e.g., Drink 8 glasses of water)"
                placeholderTextColor="#9CA3AF"
                value={newTitle}
                onChangeText={handleTitleChange}
                autoFocus
                returnKeyType="done"
                maxLength={50}
              />
              {validationError ? (
                <Text className="text-red-500 text-sm mt-1">
                  {validationError}
                </Text>
              ) : (
                <Text className="text-gray-400 text-sm mt-1">
                  {newTitle.length}/50 characters
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Frequency</Text>
              <View className="bg-gray-50 rounded-xl border border-gray-200">
                <RNPickerSelect
                  onValueChange={setNewFreq}
                  value={newFreq}
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
                    },
                    inputAndroid: {
                      color: "#111827",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      fontSize: 16,
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

            <Pressable
              onPress={handleCreateHabit}
              disabled={!!validationError || !newTitle.trim() || isCreating}
              className={`rounded-xl py-4 ${
                validationError || !newTitle.trim() || isCreating
                  ? "bg-gray-200"
                  : "bg-accent"
              }`}
            >
              {isCreating ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold ml-2">
                    Creating...
                  </Text>
                </View>
              ) : (
                <Text
                  className={`text-center font-semibold text-base ${
                    validationError || !newTitle.trim()
                      ? "text-gray-400"
                      : "text-white"
                  }`}
                >
                  Create Habit
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
