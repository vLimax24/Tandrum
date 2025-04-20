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
import { Id } from "convex/_generated/dataModel";

export default function HabitsSection() {
  const { user } = useUser();
  const clerkId = user.id;

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

  // daily countdown → midnight
  const endOfDay = new Date(now);
  endOfDay.setHours(24, 0, 0, 0);
  const msDaily = endOfDay.getTime() - now;
  const h = String(Math.floor(msDaily / 3600e3)).padStart(2, "0");
  const m = String(Math.floor((msDaily % 3600e3) / 60e3)).padStart(2, "0");
  const s = String(Math.floor((msDaily % 60e3) / 1e3)).padStart(2, "0");
  const dailyLabel = `${h}:${m}:${s}`;

  // weekly countdown → next Monday 00:00
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const daysToMon = (8 - day) % 7;
  const endOfWeek = new Date(now + daysToMon * 86400e3);
  endOfWeek.setHours(0, 0, 0, 0);
  const msWeek = endOfWeek.getTime() - now;
  const daysLeft = Math.ceil(msWeek / 86400e3);
  const weeklyLabel =
    msWeek > 86400e3 ? `${daysLeft} Tage` : `${daysLeft} Tage`;

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

                  // Optionally, update local state to reflect the check-in (to avoid waiting for server response)
                  // This can be handled via state management to immediately update UI
                }}
              >
                {(amI_A ? doneA : doneB) && (
                  <Text className="text-background">✓</Text>
                )}
              </Pressable>

              {/* Partner's checkmark (non-interactive) */}
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
                  const habitId = h._id; // Get the habit ID
                  const userIsA = amI_A; // Determine if the current user is "A"

                  // Call the checkInHabit mutation
                  await checkInHabit({ habitId, userIsA });

                  // Optionally, update local state to reflect the check-in (to avoid waiting for server response)
                  // This can be handled via state management to immediately update UI
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

        {/* Create button */}
        <Pressable
          className="mt-8 bg-primary py-4 rounded-lg items-center"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-background font-semibold">
            Aufgabe Erstellen
          </Text>
        </Pressable>
      </ScrollView>

      {/* ✨ Create Habit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Dark semi-transparent background */}
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          {/* Modal Card */}
          <View className="w-full max-w-md mx-4 bg-background rounded-2xl p-6 shadow-lg">
            <Text className="text-2xl font-semibold text-text mb-2">
              Neue Aufgabe
            </Text>
            <Text className="text-sm text-text mb-4">
              Erstelle eine neue Gewohnheit für dein Duo.
            </Text>

            {/* Title Input */}
            <TextInput
              className="border border-gray-300 text-text bg-white px-4 py-2 rounded-lg mb-4"
              placeholder="Titel eingeben"
              placeholderTextColor="#999"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* Frequency Picker */}
            <View className="mb-6">
              <RNPickerSelect
                onValueChange={(v) => setNewFreq(v)}
                value={newFreq}
                items={[
                  { label: "Täglich", value: "daily" },
                  { label: "Wöchentlich", value: "weekly" },
                ]}
                style={{
                  inputIOS: {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    borderColor: "#d1d5db",
                    borderWidth: 1,
                    color: "#111827",
                    fontSize: 16,
                  },
                  inputAndroid: {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    borderColor: "#d1d5db",
                    borderWidth: 1,
                    color: "#111827",
                    fontSize: 16,
                  },
                }}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row justify-end space-x-4">
              <Pressable onPress={() => setModalVisible(false)}>
                <Text className="text-text text-base">Abbrechen</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  await createHabit({
                    duoId: connections[selectedIndex]._id,
                    title: newTitle,
                    frequency: newFreq,
                  });
                  setNewTitle("");
                  setNewFreq("daily");
                  setModalVisible(false);
                }}
                className="bg-accent px-5 py-2 rounded-lg"
              >
                <Text className="text-background font-semibold">Erstellen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
