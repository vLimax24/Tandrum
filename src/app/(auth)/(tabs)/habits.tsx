import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useLiveTimers } from "@/hooks/useLiveTimer";
import { getLevelData } from "@/utils/level";

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
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");

  // time tracking
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!convexUser || !connections || !habits) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">Loading…</Text>
      </View>
    );
  }
  if (connections.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-text">You have no duos yet 🌱</Text>
      </View>
    );
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === "daily");
  const weekly = habits.filter((h) => h.frequency === "weekly");
  const amI_A = convexUser._id === duo.user1;

  // Labels for Daily and Weekly Tasks
  const dailyLabel = timeToday;
  const weeklyLabel = timeWeek;

  const currentDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Correct order: Monday to Sunday

  const totalStreak = duo.streak; // Total streak count

  // We need to calculate the days in the streak, starting from the current day
  let streakDates = [];
  for (let i = 0; i < totalStreak; i++) {
    // Going backwards from today (currentDayOfWeek), wrap the day correctly using modulo
    const streakDay = (currentDayOfWeek - i + 7) % 7;
    streakDates.push(streakDay);
  }

  // Now reorder the days so that Monday is the first day
  const streakDisplay = [];
  for (let i = 0; i < 7; i++) {
    // Correctly map the days to show the current week starting with Monday
    const dayIndex = (i + 1) % 7; // 0 = Monday, 6 = Sunday
    const isStreakDay = streakDates.includes(dayIndex);

    streakDisplay.push(
      <View
        key={i}
        className={`w-12 h-12 rounded-full border-2 mx-1 flex items-center justify-center ${
          isStreakDay ? "bg-accent border-accent" : "border-gray-300"
        }`}
      >
        <Text
          className={`text-xs ${isStreakDay ? "text-background" : "text-gray-400"}`}
        >
          {daysOfWeek[dayIndex]}
        </Text>
      </View>
    );
  }

  const {
    level,
    xpIntoLevel,
    xpNeeded,
    progressPercent: progress,
  } = getLevelData(duo.trust_score);

  // render
  return (
    <>
      <ScrollView className="flex-1 bg-background p-4">
        <Text className="text-2xl font-semibold text-text mb-4">
          Gewohnheiten
        </Text>

        {/* Duo selector */}
        <RNPickerSelect
          onValueChange={(v) => setSelectedIndex(v)}
          value={selectedIndex}
          items={connections.map((c, i) => ({
            label: `Duo mit ${c.partnerName}`,
            value: i,
          }))}
          style={{
            inputIOS: {
              backgroundColor: "#444",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            },
            inputAndroid: {
              backgroundColor: "#444",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            },
          }}
        />

        <View className="mb-4">
          {/* Top: Level Numbers */}
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-text text-sm">Level {level}</Text>
            <Text className="text-text text-sm">Level {level + 1}</Text>
          </View>

          {/* XP Progress Bar */}
          <View className="h-4 bg-gray-300 rounded-full overflow-hidden">
            <View
              style={{ width: `${Math.min(100, progress * 100)}%` }}
              className="h-full bg-primary"
            />
          </View>

          {/* Bottom: XP Info */}
          <Text className="text-xs text-gray-400 mt-1">
            {xpIntoLevel} / {xpNeeded} XP bis zum nächsten Level
          </Text>
        </View>

        {/* Streak Display */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-text">
            Streak: {totalStreak} Tage
          </Text>
        </View>
        <View className="flex-row justify-start items-center mb-4">
          {streakDisplay}
        </View>

        {/* Daily header */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-text">
            Tägliche Aufgaben
          </Text>
          <Text className="text-accent font-semibold">{dailyLabel}</Text>
        </View>

        <View className="flex-row items-center px-5 mb-1">
          <View className="flex-1" />
          <Text className="w-8 text-xs text-text text-center">
            {convexUser.name ?? "Ich"}
          </Text>
          <Text className="w-8 text-xs text-text text-center">
            {duo.partnerName ?? "Partner"}
          </Text>
        </View>

        {daily.map((h) => {
          const lastA = h.last_checkin_at_userA ?? 0;
          const lastB = h.last_checkin_at_userB ?? 0;
          const doneA = now - lastA < 86400e3;
          const doneB = now - lastB < 86400e3;

          return (
            <View
              key={h._id}
              className="flex-row items-center bg-white p-3 rounded-lg mb-2"
            >
              <Text className="flex-1 text-text">{h.title}</Text>

              {/* Your checkmark */}
              <Pressable
                className={`w-8 h-8 rounded-full border-2 mx-1 ${
                  (amI_A ? doneA : doneB)
                    ? "bg-accent border-accent"
                    : "border-gray-300"
                } flex items-center justify-center`}
                onPress={async () => {
                  const habitId = h._id; // Get the habit ID
                  const userIsA = amI_A; // Determine if the current user is "A"

                  // Call the checkInHabit mutation
                  await checkInHabit({ habitId, userIsA });
                }}
              >
                {(amI_A ? doneA : doneB) && (
                  <Text className="text-background">✓</Text>
                )}
              </Pressable>

              {/* Partner's checkmark */}
              <View
                className={`w-8 h-8 rounded-full border-2 mx-1 ${
                  (amI_A ? doneB : doneA)
                    ? "bg-accent border-accent"
                    : "border-gray-300"
                } flex items-center justify-center`}
              >
                {(amI_A ? doneB : doneA) && (
                  <Text className="text-background">✓</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Weekly header */}
        <View className="flex-row justify-between items-center mt-6 mb-2">
          <Text className="text-lg font-semibold text-text">
            Wöchentliche Aufgaben
          </Text>
          <Text className="text-accent font-semibold">{weeklyLabel}</Text>
        </View>

        {weekly.map((h) => {
          const lastA = h.last_checkin_at_userA ?? 0;
          const lastB = h.last_checkin_at_userB ?? 0;
          const doneA = now - lastA < 7 * 86400e3;
          const doneB = now - lastB < 7 * 86400e3;

          return (
            <View
              key={h._id}
              className="flex-row items-center bg-white p-3 rounded-lg mb-2"
            >
              <Text className="flex-1 text-text">{h.title}</Text>

              {/* Your checkmark */}
              <Pressable
                className={`w-8 h-8 rounded-full border-2 mx-1 ${
                  (amI_A ? doneA : doneB)
                    ? "bg-accent border-accent"
                    : "border-gray-300"
                } flex items-center justify-center`}
                onPress={async () => {
                  const habitId = h._id;
                  const userIsA = amI_A;
                  await checkInHabit({ habitId, userIsA });
                }}
              >
                {(amI_A ? doneA : doneB) && (
                  <Text className="text-background">✓</Text>
                )}
              </Pressable>

              {/* Partner's checkmark */}
              <View
                className={`w-8 h-8 rounded-full border-2 mx-1 ${
                  (amI_A ? doneB : doneA)
                    ? "bg-accent border-accent"
                    : "border-gray-300"
                } flex items-center justify-center`}
              >
                {(amI_A ? doneB : doneA) && (
                  <Text className="text-background">✓</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Add Habit Button */}
        <Pressable
          className="bg-primary rounded-full p-3 mt-6"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-background font-semibold">Neue Gewohnheit</Text>
        </Pressable>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-80">
            <Text className="text-xl font-semibold text-text mb-4">
              Neue Gewohnheit
            </Text>

            <TextInput
              className="border-b-2 border-gray-300 p-2 mb-4"
              placeholder="Titel der Gewohnheit"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <RNPickerSelect
              onValueChange={(value) => setNewFreq(value)}
              value={newFreq}
              items={[
                { label: "Täglich", value: "daily" },
                { label: "Wöchentlich", value: "weekly" },
              ]}
              style={{
                inputIOS: {
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                },
                inputAndroid: {
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                },
              }}
            />
            <Pressable
              onPress={async () => {
                await createHabit({
                  title: newTitle,
                  frequency: newFreq,
                  duoId: duo._id,
                });
                setNewTitle("");
                setNewFreq("daily");
                setModalVisible(false);
              }}
              className="bg-primary p-3 rounded-lg mt-4"
            >
              <Text className="text-background font-semibold text-center">
                Erstellen
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
