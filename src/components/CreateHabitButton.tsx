import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createTheme } from '@/utils/theme';
import { useTheme } from '@/contexts/themeContext';

interface CreateHabitButtonProps {
  onPress: () => void;
}

export function CreateHabitButton({ onPress }: CreateHabitButtonProps) {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 16,
        marginBottom: 32,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-5 px-8 items-center justify-center flex-row"
      >
        <View className="w-6 h-6 bg-white/20 rounded-xl items-center justify-center mr-3">
          <Ionicons name="add" size={16} color="white" />
        </View>
        <Text
          className="text-white text-lg font-bold"
          style={{
            fontFamily: 'font-mainRegular',
          }}
        >
          Create new Habit
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="white"
          className="ml-3"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}
