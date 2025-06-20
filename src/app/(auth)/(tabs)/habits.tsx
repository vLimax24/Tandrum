import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import { useLiveTimers } from '@/hooks/useLiveTimer';
import { LevelDisplay } from '@/components/LevelDisplay';
import { useDuo } from '@/hooks/useDuo';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StreakVisualization } from '@/components/StreakVisualization';
import HabitActionBottomSheet from '@/components/BottomSheets/HabitActionBottomSheet';
import HabitEditBottomSheet from '@/components/BottomSheets/HabitEditBottomSheet';
import { DuoSelector } from '@/components/Modals/DuoSelector';
import { CreateHabitBottomSheet } from '@/components/BottomSheets/CreateHabitBottomSheet';
import { HabitsHeader } from '@/components/Habits/HabitsHeader';
import LoadingState from '@/components/LoadingState';
import { CreateHabitButton } from '@/components/CreateHabitButton';
import { HabitsContainer } from '@/components/Habits/HabitsContainer';
import { RewardAnimation } from '@/components/Modals/RewardAnimation';
import { AlertModal } from '@/components/Modals/AlertModal';
import { Id } from '../../../../convex/_generated/dataModel';
import { NoDuoScreen } from '@/components/NoDuoScreen';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

export default function HabitsSection() {
  const { user } = useUser();
  const { timeToday, timeWeek } = useLiveTimers();
  const { selectedIndex, setSelectedIndex } = useDuo();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [now, setNow] = useState(Date.now());

  const editBottomSheetRef = useRef<BottomSheetModal>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

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
    clerkId ? { clerkId } : 'skip',
  );
  const connections = useQuery(
    api.duoConnections.getConnectionsForUser,
    convexUser ? { userId: convexUser._id } : 'skip',
  );
  const habits = useQuery(
    api.duoHabits.getHabitsForDuo,
    connections && connections[selectedIndex]
      ? { duoId: connections[selectedIndex]._id }
      : 'skip',
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

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap,
    iconColor?: string,
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  };

  const handleMenuPress = (event: any, habit: any) => {
    // Set the active habit and present the bottom sheet
    setActiveMenuHabitId(habit._id);
    bottomSheetModalRef.current?.present();
  };

  const handleCreateHabitPress = () => {
    createHabitBottomSheetRef.current?.present();
  };

  const handleDeleteHabit = (habitId: Id<'duoHabits'>, habitTitle: string) => {
    showAlert(
      'Delete Habit',
      `Are you sure you want to delete "${habitTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit({ habitId });
            } catch (error) {
              showAlert(
                'Error',
                'Failed to delete habit. Please try again.',
                [{ text: 'OK', style: 'default' }],
                'alert-circle',
                '#ef4444',
              );
            }
          },
        },
      ],
      'trash',
      '#ef4444',
    );
  };

  const handleBottomSheetEdit = () => {
    if (!activeMenuHabitId || !habits) {
      console.log('Missing activeMenuHabitId or habits');
      return;
    }

    const habit = habits.find((h) => h._id === activeMenuHabitId);

    if (habit) {
      setEditingHabit(habit);
      setTimeout(() => {
        editBottomSheetRef.current?.present();
      }, 100);
    } else {
      console.log('Habit not found with id:', activeMenuHabitId);
    }
  };

  const handleBottomSheetDelete = () => {
    const habit = habits?.find((h) => h._id === activeMenuHabitId);
    if (habit) {
      // Dismiss the bottom sheet first, then show the alert
      bottomSheetModalRef.current?.dismiss();
      setTimeout(() => {
        handleDeleteHabit(habit._id, habit.title);
      }, 300); // Small delay to ensure bottom sheet is fully dismissed
    }
  };

  const handleSaveEdit = async (data: {
    title: string;
    frequency: 'daily' | 'weekly';
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
      console.error('Failed to update habit:', error);
    }
  };

  const handleHabitCheckIn = async (
    habitId: Id<'duoHabits'>,
    userIsA: boolean,
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
      console.error('Check-in error:', error);
      setTimeout(() => {
        showAlert(
          'Error',
          'Failed to update habit. Please try again.',
          [{ text: 'OK', style: 'default' }],
          'alert-circle',
          '#ef4444',
        );
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
    return <LoadingState screen="habits" />;
  }

  const duo = connections[selectedIndex];
  const daily = habits.filter((h) => h.frequency === 'daily');
  const weekly = habits.filter((h) => h.frequency === 'weekly');
  const amI_A = convexUser._id === duo.user1;

  return (
    <BottomSheetModalProvider>
      <LinearGradient
        colors={theme.colors.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 70 }}
        >
          <HabitsHeader
            daily={daily}
            weekly={weekly}
            duo={duo}
            now={now}
            timeToday={Number(timeToday)}
            timeWeek={Number(timeWeek)}
          />

          <View className="px-6 mt-10">
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

      {/* Bottom Sheets */}
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

      {/* Custom Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
    </BottomSheetModalProvider>
  );
}
