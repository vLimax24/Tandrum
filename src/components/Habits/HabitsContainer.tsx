import React, { useState } from 'react';
import { View } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { HabitsGrid } from '@/components/Habits/HabitsGrid';
import { useI18n } from '@/contexts/i18nContext';

interface HabitsContainerProps {
  daily: any[];
  weekly: any[];
  duo: any;
  amI_A: boolean;
  now: number;
  timeToday: string;
  timeWeek: string;
  checkInHabit: any;
  deleteHabit: any;
  onMenuPress: (event: any, habit: any) => void;
}

export function HabitsContainer({
  daily,
  weekly,
  duo,
  amI_A,
  now,
  timeToday,
  timeWeek,
  checkInHabit,
  deleteHabit,
  onMenuPress,
}: HabitsContainerProps) {
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

  const { t } = useI18n();

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

    const startOfWeek1 = new Date(date1);
    startOfWeek1.setDate(date1.getDate() - date1.getDay());
    startOfWeek1.setHours(0, 0, 0, 0);

    const startOfWeek2 = new Date(date2);
    startOfWeek2.setDate(date2.getDate() - date2.getDay());
    startOfWeek2.setHours(0, 0, 0, 0);

    return startOfWeek1.getTime() === startOfWeek2.getTime();
  };

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

  return (
    <View className="gap-5">
      {/* Daily Habits Section */}
      <View>
        <SectionHeader
          title={t('habits.sections.daily')}
          resetTime={timeToday}
          isDaily={true}
        />
        <HabitsGrid
          habits={daily}
          duo={duo}
          amI_A={amI_A}
          now={now}
          checkInHabit={checkInHabit}
          deleteHabit={deleteHabit}
          isSameDay={isSameDay}
          isSameWeek={isSameWeek}
          onMenuPress={onMenuPress}
          emptyStateIcon="calendar-number"
          emptyStateMessage={t('habits.emptyState.daily')}
          onShowAlert={showAlert}
        />
      </View>

      {/* Weekly Habits Section */}
      <View className="mb-6">
        <SectionHeader
          title={t('habits.sections.weekly')}
          resetTime={timeWeek}
          isDaily={false}
        />
        <HabitsGrid
          habits={weekly}
          duo={duo}
          amI_A={amI_A}
          now={now}
          checkInHabit={checkInHabit}
          deleteHabit={deleteHabit}
          isSameDay={isSameDay}
          isSameWeek={isSameWeek}
          onMenuPress={onMenuPress}
          emptyStateIcon="calendar-number"
          emptyStateMessage={t('habits.emptyState.weekly')}
          onShowAlert={showAlert}
        />
      </View>
    </View>
  );
}
