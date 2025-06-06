// HabitActionMenu.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface HabitActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  buttonPosition: { x: number; y: number };
}

const HabitActionMenu: React.FC<HabitActionMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  buttonPosition,
}) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setIsReady(false);
      // Reset animations to start state
      scaleAnimation.setValue(0);
      opacityAnimation.setValue(0);

      // Small delay to ensure modal is fully mounted
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsReady(true); // Enable buttons only after animation completes
        });
      }, 50);
    } else {
      setIsReady(false);
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Handle button presses with immediate action
  const handleEdit = () => {
    if (!isReady) return;
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    if (!isReady) return;
    onDelete();
    onClose();
  };

  // Calculate menu position to avoid screen edges
  const menuWidth = 140;
  const menuHeight = 44;
  const margin = 16;

  let menuX = buttonPosition.x - menuWidth + 40; // Align to right edge of button
  let menuY = buttonPosition.y + 40; // Below the button

  // Adjust if menu would go off screen
  if (menuX < margin) {
    menuX = margin;
  } else if (menuX + menuWidth > screenWidth - margin) {
    menuX = screenWidth - menuWidth - margin;
  }

  if (menuY + menuHeight > Dimensions.get("window").height - 100) {
    menuY = buttonPosition.y - menuHeight - 10; // Above the button
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-[rgba(0,0,0,0.2)]">
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                position: "absolute",
                left: menuX,
                top: menuY,
                opacity: opacityAnimation,
                transform: [
                  { scale: scaleAnimation },
                  {
                    translateX: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  {
                    translateY: scaleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Horizontal menu bar */}
              <View
                className="flex-row rounded-full shadow-2xl border border-[rgba(255,255,255,0.8)]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                  height: menuHeight,
                }}
              >
                {/* Edit button */}
                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-l-full"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.05)",
                  }}
                  activeOpacity={0.7}
                  disabled={!isReady}
                >
                  <Text className="text-[#10b981] text-sm mr-1">✏️</Text>
                  <Text className="text-[#10b981] font-semibold text-sm">
                    Edit
                  </Text>
                </TouchableOpacity>

                {/* Separator */}
                <View
                  className="w-px self-stretch my-1"
                  style={{ backgroundColor: "rgba(156,163,175,0.3)" }}
                />

                {/* Delete button */}
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-r-full"
                  style={{
                    backgroundColor: "rgba(220,38,38,0.05)",
                  }}
                  activeOpacity={0.7}
                  disabled={!isReady}
                >
                  <Text className="text-[#dc2626] text-sm mr-1">🗑️</Text>
                  <Text className="text-[#dc2626] font-semibold text-sm">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default HabitActionMenu;
