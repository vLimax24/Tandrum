import React, { useCallback, useMemo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

interface TandrumBottomSheetProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  snapPoints?: string[];
  onClose?: () => void;
  onDismiss?: () => void;
}

const TandrumBottomSheet = React.forwardRef<
  BottomSheetModal,
  TandrumBottomSheetProps
>(
  (
    {
      children,
      title,
      subtitle,
      icon,
      snapPoints = ['75%'],
      onClose,
      onDismiss,
    },
    ref,
  ) => {
    const { isDarkMode } = useTheme();
    const theme = createTheme(isDarkMode);

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
      onClose?.();
    }, [ref, onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          style={[
            props.style,
            {
              backgroundColor: isDarkMode
                ? 'rgba(15, 23, 42, 0.9)'
                : 'rgba(0, 0, 0, 0.6)',
            },
          ]}
        />
      ),
      [isDarkMode],
    );

    const handleDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

    return (
      <BottomSheetModal
        ref={ref}
        handleComponent={null}
        snapPoints={memoizedSnapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismiss}
        enablePanDownToClose
        enableDismissOnClose
        keyboardBehavior="extend"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={false}
        backgroundComponent={() => (
          <BlurView
            intensity={95}
            tint={isDarkMode ? 'dark' : 'light'}
            className="flex-1 rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBackground,
            }}
          />
        )}
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <BottomSheetView className="flex-1">
          {/* Header */}
          <View className="relative overflow-hidden rounded-t-3xl">
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-6 relative overflow-hidden rounded-t-3xl"
            >
              {/* Glassmorphic overlay */}
              <View
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              />

              <View className="flex-row items-center justify-between relative z-10">
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className="items-center justify-center rounded-2xl"
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <Ionicons name={icon} size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold">
                      {title}
                    </Text>
                    {subtitle && (
                      <Text className="text-white/85 text-base">
                        {subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="items-center justify-center rounded-2xl"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Content */}
          <View
            className="flex-1"
            style={{ backgroundColor: theme.colors.cardBackground }}
          >
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

TandrumBottomSheet.displayName = 'TandrumBottomSheet';

export { TandrumBottomSheet };
