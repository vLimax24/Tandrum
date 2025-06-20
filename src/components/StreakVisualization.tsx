import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/themeContext';
// Import the translation hook
import { useTranslation } from '@/contexts/i18nContext';
import { createTheme } from '@/utils/theme';
import { Doc } from '../../convex/_generated/dataModel';

// Enhanced Streak Display with Enterprise Glass Design
const getStreakColors = (streak, isDarkMode) => {
  const baseColors = {
    30: {
      primary: '#8B5CF6', // Purple for 30+ days
      secondary: '#A78BFA',
      light: '#C4B5FD',
    },
    14: {
      primary: '#F59E0B', // Amber for 14+ days
      secondary: '#FBBF24',
      light: '#FDE68A',
    },
    7: {
      primary: '#06B6D4', // Cyan for 7+ days
      secondary: '#22D3EE',
      light: '#A5F3FC',
    },
    default: {
      primary: '#009966', // Using your primary color
      secondary: '#00cc88',
      light: '#34D399',
    },
  };

  let colorSet;
  if (streak >= 30) colorSet = baseColors[30];
  else if (streak >= 14) colorSet = baseColors[14];
  else if (streak >= 7) colorSet = baseColors[7];
  else colorSet = baseColors.default;

  return {
    primary: colorSet.primary,
    secondary: colorSet.secondary,
    light: colorSet.light,
    background: isDarkMode ? `${colorSet.primary}20` : `${colorSet.primary}15`,
    border: isDarkMode ? `${colorSet.primary}40` : `${colorSet.primary}30`,
    glow: colorSet.primary,
  };
};

export const StreakVisualization = ({ duo }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation(); // Get translation function
  const theme = createTheme(isDarkMode);
  const streakColors = getStreakColors(duo.streak || 0, isDarkMode);
  const { width: screenWidth } = Dimensions.get('window');

  const calculateStreakDisplay = () => {
    const currentDate = new Date();
    const totalStreak = duo.streak || 0;

    const streakDisplay = [];

    // Use translated day abbreviations and labels
    const daysOfWeek = [
      t('streak.dayAbbr.monday'),
      t('streak.dayAbbr.tuesday'),
      t('streak.dayAbbr.wednesday'),
      t('streak.dayAbbr.thursday'),
      t('streak.dayAbbr.friday'),
      t('streak.dayAbbr.saturday'),
      t('streak.dayAbbr.sunday'),
    ];

    const dayLabels = [
      t('streak.dayLabels.monday'),
      t('streak.dayLabels.tuesday'),
      t('streak.dayLabels.wednesday'),
      t('streak.dayLabels.thursday'),
      t('streak.dayLabels.friday'),
      t('streak.dayLabels.saturday'),
      t('streak.dayLabels.sunday'),
    ];

    // Calculate circle size based on screen width with more spacing
    const circleSize = Math.min((screenWidth - 120) / 7 - 8, 40);

    // Get current week's Monday
    const currentDay = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(
      currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1),
    );

    // Calculate the streak start date (assuming streak includes today if active)
    const streakStartDate = new Date(currentDate);
    streakStartDate.setDate(currentDate.getDate() - totalStreak + 1);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      // Fixed logic: Check if this day is within the streak period
      const isStreakDay =
        totalStreak > 0 && dayDate >= streakStartDate && dayDate <= currentDate;

      const isToday = dayDate.toDateString() === currentDate.toDateString();

      streakDisplay.push(
        <View key={i} className="items-center gap-2">
          <View
            className="rounded-full border-2 flex items-center justify-center relative"
            style={{
              width: circleSize,
              height: circleSize,
              backgroundColor: isStreakDay
                ? streakColors.primary
                : isToday
                  ? isDarkMode
                    ? theme.colors.glass
                    : '#f0fdf4'
                  : isDarkMode
                    ? 'rgba(148, 163, 184, 0.1)'
                    : '#f9fafb',
              borderColor: isStreakDay
                ? streakColors.primary
                : isToday
                  ? `${streakColors.primary}66`
                  : isDarkMode
                    ? theme.colors.cardBorder
                    : '#e5e7eb',
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{
                color: isStreakDay
                  ? 'white'
                  : isToday
                    ? streakColors.primary
                    : theme.colors.text.tertiary,
              }}
            >
              {daysOfWeek[i]}
            </Text>
            {isToday && (
              <View
                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: streakColors.primary }}
              />
            )}
          </View>
          <Text
            className="text-xs font-medium"
            style={{ color: theme.colors.text.tertiary }}
          >
            {dayLabels[i]}
          </Text>
        </View>,
      );
    }

    return streakDisplay;
  };

  // Use translated milestone texts
  const getMilestoneText = (streak) => {
    if (streak >= 30) return t('streak.milestones.legend');
    if (streak >= 14) return t('streak.milestones.onFire');
    if (streak >= 7) return t('streak.milestones.unstoppable');
    return t('streak.milestones.growing');
  };

  const getNextMilestone = (streak) => {
    if (streak < 7) return { target: 7, remaining: 7 - streak };
    if (streak < 14) return { target: 14, remaining: 14 - streak };
    return { target: 30, remaining: 30 - streak };
  };

  return (
    <View className="mb-6 relative mt-4">
      {/* Main glass container */}
      <BlurView
        intensity={isDarkMode ? 80 : 100}
        tint={isDarkMode ? 'dark' : 'light'}
        className="rounded-3xl overflow-hidden"
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
        }}
      >
        {/* Inner gradient border */}
        <LinearGradient
          colors={[
            isDarkMode ? streakColors.border : streakColors.border,
            isDarkMode
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.8)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-0.5"
        >
          {/* Main content container */}
          <View
            className="p-6 relative overflow-hidden"
            style={{
              backgroundColor: isDarkMode
                ? 'rgba(15, 23, 42, 0.6)'
                : 'rgba(248, 250, 252, 0.8)',
              borderRadius: 19,
            }}
          >
            {/* Animated background orbs */}
            <View className="absolute inset-0">
              <View
                className="absolute rounded-full"
                style={{
                  width: 120,
                  height: 120,
                  backgroundColor: streakColors.background,
                  top: -60,
                  right: -60,
                  opacity: 0.6,
                }}
              />
              <View
                className="absolute rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: streakColors.background,
                  bottom: -40,
                  left: -40,
                  opacity: 0.4,
                }}
              />
            </View>

            {/* Header Section */}
            <View className="flex-row justify-between items-start mb-8 relative z-10">
              <View className="flex-1 gap-3" style={{ marginRight: 16 }}>
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: streakColors.primary }}
                  />
                  <Text
                    className="font-bold text-2xl tracking-tight"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {t('streak.currentStreak')}
                  </Text>
                </View>

                <Text
                  className="text-base font-medium"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 20,
                  }}
                >
                  {t('streak.consecutiveDays', { count: duo.streak || 0 })}
                </Text>

                {/* Streak milestone indicator */}
                {(duo.streak || 0) > 0 && (
                  <View className="flex-row">
                    <BlurView
                      intensity={60}
                      tint={isDarkMode ? 'dark' : 'light'}
                      className="px-4 py-2 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: isDarkMode
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 1,
                        borderColor: streakColors.border,
                        minWidth: 90,
                      }}
                    >
                      <Text
                        className="text-xs font-bold uppercase tracking-wider text-center"
                        style={{ color: streakColors.primary }}
                        numberOfLines={1}
                      >
                        {getMilestoneText(duo.streak || 0)}
                      </Text>
                    </BlurView>
                  </View>
                )}
              </View>

              {/* Main streak counter */}
              <View className="relative">
                {/* Glow effect */}
                <View
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    backgroundColor: streakColors.primary,
                    opacity: isDarkMode ? 0.2 : 0.15,
                    transform: [{ scale: 1.1 }],
                  }}
                />

                {/* Glass counter container */}
                <LinearGradient
                  colors={[
                    `${streakColors.primary}E6`,
                    `${streakColors.secondary}CC`,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-3xl p-5 items-center justify-center"
                  style={{
                    minWidth: 80,
                    borderRadius: 18,
                  }}
                >
                  <Text className="text-white font-black text-3xl tracking-tight">
                    {duo.streak || 0}
                  </Text>
                  <Text className="text-white text-xs font-semibold opacity-90 mt-1">
                    {duo.streak > 1 ? t('streak.days') : t('streak.day')}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Progress indicators */}
            <View className="relative z-10 gap-4">
              <View className="flex-row justify-between items-center">
                <Text
                  className="font-semibold text-sm flex-1"
                  style={{ color: theme.colors.text.primary }}
                >
                  {t('streak.thisWeekJourney')}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: streakColors.primary }}
                  />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: streakColors.primary }}
                  >
                    {t('streak.activeDays')}
                  </Text>
                </View>
              </View>

              {/* Week progress container with glass effect */}
              <BlurView
                intensity={40}
                tint={isDarkMode ? 'dark' : 'light'}
                className="rounded-2xl p-4 overflow-hidden"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(30, 41, 59, 0.4)'
                    : 'rgba(255, 255, 255, 0.6)',
                  borderWidth: 1,
                  borderColor: isDarkMode
                    ? 'rgba(148, 163, 184, 0.2)'
                    : 'rgba(148, 163, 184, 0.3)',
                }}
              >
                <View className="flex-row justify-between items-center">
                  {calculateStreakDisplay()}
                </View>
              </BlurView>

              {/* Next milestone indicator */}
              {(duo.streak || 0) < 30 && (
                <View className="flex-row items-center justify-center">
                  <BlurView
                    intensity={50}
                    tint={isDarkMode ? 'dark' : 'light'}
                    className="flex-row items-center px-4 py-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode
                        ? 'rgba(30, 41, 59, 0.5)'
                        : 'rgba(255, 255, 255, 0.7)',
                      borderWidth: 1,
                      borderColor: isDarkMode
                        ? 'rgba(148, 163, 184, 0.2)'
                        : 'rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {t('streak.nextMilestone', {
                        target: getNextMilestone(duo.streak || 0).target,
                        remaining: getNextMilestone(duo.streak || 0).remaining,
                      })}
                    </Text>
                  </BlurView>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};
