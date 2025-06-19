// HabitActionBottomSheet.tsx
import React, { forwardRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

interface HabitActionBottomSheetProps {
  onEdit: () => void;
  onDelete: () => void;
}

const HabitActionBottomSheet = forwardRef<
  BottomSheetModal,
  HabitActionBottomSheetProps
>(({ onEdit, onDelete }, ref) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);
  const snapPoints = useMemo(() => ['65%'], []);

  // Custom backdrop component with glassmorphism
  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDarkMode ? 0.4 : 0.2}
      />
    ),
    [isDarkMode],
  );

  const handleEdit = () => {
    // Call onEdit immediately while the bottom sheet is still open
    onEdit();

    // Then dismiss after a very short delay to ensure the edit sheet can open
    setTimeout(() => {
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    }, 50);
  };

  const handleDelete = () => {
    onDelete();
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      animateOnMount={true}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.text.tertiary,
        width: 48,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <BlurView
        intensity={isDarkMode ? 25 : 15}
        tint={isDarkMode ? 'dark' : 'light'}
        className="flex-1 overflow-hidden"
        style={{
          backgroundColor: theme.colors.cardBackground,
        }}
      >
        {/* Subtle decorative elements - positioned relative to entire bottom sheet */}
        <View className="absolute inset-0 overflow-hidden" style={{ top: -24 }}>
          <View
            className="absolute rounded-full opacity-10"
            style={{
              width: 120,
              height: 120,
              backgroundColor: theme.colors.primaryLight,
              bottom: -60,
              left: -60,
            }}
          />
        </View>

        <BottomSheetView className="flex-1 px-6 py-8">
          {/* Header Section */}
          <View className="items-center mb-8">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.glass }}
            >
              <Ionicons
                name="options-outline"
                size={28}
                color={theme.colors.primary}
              />
            </View>
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Habit Actions
            </Text>
            <Text
              className="text-base text-center max-w-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              Choose what you'd like to do with this habit
            </Text>
          </View>

          {/* Action Buttons Container */}
          <View className="flex-1 justify-center gap-4">
            {/* Edit Button */}
            <TouchableOpacity
              onPress={handleEdit}
              className="w-full"
              activeOpacity={0.75}
            >
              <View
                className="relative overflow-hidden rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <BlurView
                  intensity={isDarkMode ? 15 : 10}
                  tint={isDarkMode ? 'dark' : 'light'}
                  className="absolute inset-0"
                />
                <LinearGradient
                  colors={[
                    `${theme.colors.primary}15`,
                    `${theme.colors.primaryLight}10`,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-5"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Ionicons name="create-outline" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-bold text-lg mb-1"
                        style={{ color: theme.colors.text.primary }}
                      >
                        Edit Habit
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Modify your habit details and settings
                      </Text>
                    </View>
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: theme.colors.glass }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.text.tertiary}
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleDelete}
              className="w-full"
              activeOpacity={0.75}
            >
              <View
                className="relative overflow-hidden rounded-2xl border"
                style={{
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                <BlurView
                  intensity={isDarkMode ? 15 : 10}
                  tint={isDarkMode ? 'dark' : 'light'}
                  className="absolute inset-0"
                />
                <LinearGradient
                  colors={['#dc262615', '#ef444410']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-5"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <Ionicons name="trash-outline" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-bold text-lg mb-1"
                        style={{ color: theme.colors.text.primary }}
                      >
                        Delete Habit
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Remove this habit permanently
                      </Text>
                    </View>
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: theme.colors.glass }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.text.tertiary}
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing for safe area */}
          <View className="h-4" />
        </BottomSheetView>
      </BlurView>
    </BottomSheetModal>
  );
});

HabitActionBottomSheet.displayName = 'HabitActionBottomSheet';

export default HabitActionBottomSheet;
