import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const AlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
  icon,
  iconColor,
}) => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [visible, scaleAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (buttonStyle: AlertButton['style']) => {
    switch (buttonStyle) {
      case 'destructive':
        return {
          backgroundColor: '#ef4444',
          textColor: '#ffffff',
        };
      case 'cancel':
        return {
          backgroundColor: theme.colors.glass,
          textColor: theme.colors.text.secondary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          textColor: '#ffffff',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 justify-center items-center px-6">
          {/* Backdrop */}
          <View
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />

          {/* Modal Content */}
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
              className="w-full max-w-sm"
            >
              <BlurView
                intensity={80}
                tint={isDarkMode ? 'dark' : 'light'}
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: theme.colors.background[1],
                  borderWidth: 1,
                  borderColor: theme.colors.cardBorder,
                }}
              >
                {/* Header */}
                <View className="px-6 pt-6 pb-4">
                  {/* Icon */}
                  {icon && (
                    <View className="items-center mb-4">
                      <View className="w-16 h-16 rounded-full items-center justify-center">
                        <View
                          className="absolute w-16 h-16 rounded-full"
                          style={{
                            backgroundColor: iconColor || theme.colors.primary,
                            opacity: 0.1,
                          }}
                        />
                        <Ionicons
                          name={icon}
                          size={32}
                          color={iconColor || theme.colors.primary}
                        />
                      </View>
                    </View>
                  )}

                  {/* Title */}
                  <Text
                    className="text-xl font-bold text-center mb-2 font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {title}
                  </Text>

                  {/* Message */}
                  {message && (
                    <Text
                      className="text-base text-center leading-6 font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {message}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View className="p-6 pt-2">
                  {buttons.length === 1 ? (
                    // Single button
                    <TouchableOpacity
                      onPress={() => handleButtonPress(buttons[0])}
                      className="rounded-2xl py-4 items-center"
                      style={{
                        backgroundColor: getButtonStyle(buttons[0].style)
                          .backgroundColor,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-base font-semibold font-mainRegular"
                        style={{
                          color: getButtonStyle(buttons[0].style).textColor,
                        }}
                      >
                        {buttons[0].text}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // Multiple buttons
                    <View className="gap-3">
                      {buttons.map((button, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleButtonPress(button)}
                          className="rounded-2xl py-4 items-center"
                          style={{
                            backgroundColor: getButtonStyle(button.style)
                              .backgroundColor,
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            className="text-base font-semibold font-mainRegular"
                            style={{
                              color: getButtonStyle(button.style).textColor,
                            }}
                          >
                            {button.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
