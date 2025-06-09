import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useLiveTimers } from "@/hooks/useLiveTimer";
import { LevelDisplay } from "@/components/LevelDisplay";
import { useDuo } from "@/hooks/useDuo";
import { LinearGradient } from "expo-linear-gradient";
import { StreakVisualization } from "@/components/StreakVisualization";
import HabitActionBottomSheet from "@/components/HabitActionBottomSheet";
import HabitEditBottomSheet from "@/components/HabitEditBottomSheet";
import { DuoSelector } from "@/components/DuoSelector";
import { CreateHabitBottomSheet } from "@/components/CreateHabitBottomSheet";
import { HabitsHeader } from "@/components/HabitsHeader";
import { LoadingState } from "@/components/LoadingState";
import { CreateHabitButton } from "@/components/CreateHabitButton";
import { HabitsContainer } from "@/components/HabitsContainer";
import { RewardAnimation } from "@/components/RewardAnimation";
import { Id } from "../../../../convex/_generated/dataModel";
import { NoDuoScreen } from "@/components/NoDuoScreen";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

export default function HabitsSection() {
  const { user } = useUser();
  const { timeToday, timeWeek } = useLiveTimers();
  const { selectedIndex, setSelectedIndex } = useDuo();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(
    null
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [now, setNow] = useState(Date.now());

  const editBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    editBottomSheetRef.current?.present();
  };

  // Bottom sheet ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const createHabitBottomSheetRef = useRef<BottomSheetModal>(null);

  // Reward animation state
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentRewards, setCurrentRewards] = useState<any>(null);

  const [noDuoModalVisible, setNoDuoModalVisible] = useState(false);

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
    // Set the active habit and present the bottom sheet
    setActiveMenuHabitId(habit._id);
    bottomSheetModalRef.current?.present();
  };

  const handleCreateHabitPress = () => {
    createHabitBottomSheetRef.current?.present();
  };

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

  const handleBottomSheetEdit = () => {
    const habit = habits?.find((h) => h._id === activeMenuHabitId);
    if (habit) {
      handleEditHabit(habit);
    }
  };

  const handleBottomSheetDelete = () => {
    const habit = habits?.find((h) => h._id === activeMenuHabitId);
    if (habit) {
      handleDeleteHabit(habit._id, habit.title);
    }
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
      editBottomSheetRef.current?.dismiss();
      setEditingHabit(null);
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  const handleHabitCheckIn = async (
    habitId: Id<"duoHabits">,
    userIsA: boolean
  ) => {
    try {
      const result = await checkInHabit({
        habitId,
        userIsA,
      });

      if (result.checkedIn && result.bothCompleted && result.rewards) {
        setCurrentRewards(result.rewards);
        setShowRewardAnimation(true);
      }

      return result;
    } catch (error) {
      console.error("Check-in error:", error);
      setTimeout(() => {
        Alert.alert("Error", "Failed to update habit. Please try again.");
      }, 100);
    }
  };

  const handleRewardAnimationComplete = () => {
    setShowRewardAnimation(false);
    setCurrentRewards(null);
  };

  // Replace the existing loading check with this updated version
  if (!convexUser) {
    return <LoadingState />;
  }

  // Show NoDuoScreen if user exists but has no connections
  if (!connections || connections.length === 0) {
    return (
      <NoDuoScreen
        modalVisible={noDuoModalVisible}
        setModalVisible={setNoDuoModalVisible}
      />
    );
  }

  // Show loading if habits are still loading
  if (!habits) {
    return <LoadingState />;
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === "daily");
  const weekly = habits.filter((h) => h.frequency === "weekly");
  const amI_A = convexUser._id === duo.user1;

  return (
    <BottomSheetModalProvider>
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
              checkInHabit={handleHabitCheckIn}
              deleteHabit={deleteHabit}
              onMenuPress={handleMenuPress}
            />

            <CreateHabitButton onPress={handleCreateHabitPress} />
          </View>
        </ScrollView>
      </LinearGradient>

      <CreateHabitBottomSheet
        ref={createHabitBottomSheetRef}
        onCreate={createHabit}
        duo={duo}
        existingHabits={habits}
      />

      <HabitActionBottomSheet
        ref={bottomSheetModalRef}
        onEdit={handleBottomSheetEdit}
        onDelete={handleBottomSheetDelete}
      />

      <HabitEditBottomSheet
        ref={editBottomSheetRef}
        onSave={handleSaveEdit}
        habit={editingHabit}
        existingHabits={habits || []}
      />

      <RewardAnimation
        visible={showRewardAnimation}
        rewards={currentRewards}
        onComplete={handleRewardAnimationComplete}
      />
    </BottomSheetModalProvider>
  );
}
