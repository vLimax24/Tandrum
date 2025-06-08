import React, { useEffect, useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useLiveTimers } from "@/hooks/useLiveTimer";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import { LinearGradient } from "expo-linear-gradient";
import { StreakVisualization } from "@/components/StreakVisualization";
import HabitActionMenu from "@/components/HabitActionMenu";
import HabitEditModal from "@/components/HabitEditModal";
import { DuoSelector } from "@/components/DuoSelector";
import { CreateHabitModal } from "@/components/CreateHabitModal";
import { HabitsHeader } from "@/components/HabitsHeader";
import { LoadingState } from "@/components/LoadingState";
import { CreateHabitButton } from "@/components/CreateHabitButton";
import { HabitsContainer } from "@/components/HabitsContainer";
import { Id } from "../../../../convex/_generated/dataModel";

export default function HabitsSection() {
  const { user } = useUser();
  const { timeToday, timeWeek } = useLiveTimers();
  const { selectedIndex, setSelectedIndex } = useDuo();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(
    null
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [now, setNow] = useState(Date.now());

  const clerkId = user?.id;
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

  useEffect(() => {
    if (connections && selectedIndex >= connections.length) {
      setSelectedIndex(0);
    }
  }, [connections, selectedIndex, setSelectedIndex]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleMenuPress = (event: any, habit: any) => {
    if (activeMenuHabitId !== null || isMenuAnimating) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({
      x: pageX && pageX > 0 ? pageX : 200,
      y: pageY && pageY > 0 ? pageY : 200,
    });
    setActiveMenuHabitId(habit._id);
  };

  const handleMenuClose = () => {
    setIsMenuAnimating(true);
    setActiveMenuHabitId(null);
    setTimeout(() => {
      setIsMenuAnimating(false);
      setMenuPosition({ x: 0, y: 0 });
    }, 300);
  };

  const handleDeleteHabit = (habitId: Id<"duoHabits">, habitTitle: string) => {
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
    }
  };

  if (!convexUser || !connections || !habits) {
    return <LoadingState />;
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === "daily");
  const weekly = habits.filter((h) => h.frequency === "weekly");
  const amI_A = convexUser._id === duo.user1;

  return (
    <>
      <LinearGradient
        colors={["#f8fafc", "#dbeafe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1">
          <HabitsHeader />

          <View className="px-6 -mt-6">
            <DuoSelector
              connections={connections}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />

            <LevelDisplay duo={duo} />
            <StreakVisualization duo={duo} />

            <HabitsContainer
              daily={daily}
              weekly={weekly}
              duo={duo}
              amI_A={amI_A}
              now={now}
              timeToday={timeToday}
              timeWeek={timeWeek}
              checkInHabit={checkInHabit}
              deleteHabit={deleteHabit}
              onMenuPress={handleMenuPress}
            />

            <CreateHabitButton onPress={() => setModalVisible(true)} />
          </View>
        </ScrollView>
      </LinearGradient>

      <CreateHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={createHabit}
        duo={duo}
        existingHabits={habits}
      />

      <HabitActionMenu
        visible={activeMenuHabitId !== null}
        onClose={handleMenuClose}
        onEdit={() => {
          const habit = habits?.find((h) => h._id === activeMenuHabitId);
          if (habit) {
            handleEditHabit(habit);
            handleMenuClose();
          }
        }}
        onDelete={() => {
          const habit = habits?.find((h) => h._id === activeMenuHabitId);
          if (habit) {
            handleDeleteHabit(habit._id, habit.title);
            handleMenuClose();
          }
        }}
        buttonPosition={menuPosition}
      />

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
