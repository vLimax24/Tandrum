import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

interface SectionHeaderProps {
  title: string;
  resetTime: string;
  isDaily?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  resetTime,
  isDaily = true,
}) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <View className="flex-row justify-between items-center mb-8">
      {/* Title Section */}
      <View className="flex-1">
        <Text
          className="font-bold text-2xl font-mainRegular"
          style={{ color: theme.colors.text.primary }}
        >
          {title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text
            className="text-sm font-mainRegular"
            style={{ color: theme.colors.text.secondary }}
          >
            Reset in {resetTime}
          </Text>
        </View>
      </View>

      {/* Partner Status Pills */}
      <View className="flex-row gap-3">
        {/* User Pill */}
        <BlurView
          intensity={20}
          tint={isDarkMode ? 'dark' : 'light'}
          className="rounded-2xl overflow-hidden"
        >
          <View
            className="px-4 py-3 flex-row items-center gap-2 rounded-2xl border"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Text
              className="text-xs font-bold font-mainRegular tracking-wide"
              style={{ color: theme.colors.primary }}
            >
              YOU
            </Text>
          </View>
        </BlurView>

        {/* Partner Pill */}
        <BlurView
          intensity={20}
          tint={isDarkMode ? 'dark' : 'light'}
          className="rounded-2xl overflow-hidden"
        >
          <View
            className="px-4 py-3 flex-row items-center gap-2 rounded-2xl border"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isDarkMode ? '#60a5fa' : '#3b82f6',
              }}
            />
            <Text
              className="text-xs font-bold font-mainRegular tracking-wide"
              style={{
                color: isDarkMode ? '#60a5fa' : '#3b82f6',
              }}
            >
              PARTNER
            </Text>
          </View>
        </BlurView>
      </View>
    </View>
  );
};
