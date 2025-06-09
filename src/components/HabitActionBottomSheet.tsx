// HabitActionBottomSheet.tsx
import React, { forwardRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

interface HabitActionBottomSheetProps {
  onEdit: () => void;
  onDelete: () => void;
}

const HabitActionBottomSheet = forwardRef<
  BottomSheetModal,
  HabitActionBottomSheetProps
>(({ onEdit, onDelete }, ref) => {
  // Snap points - 35% of screen height
  const snapPoints = useMemo(() => ["50%"], []);

  // Custom backdrop component
  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );

  const handleEdit = () => {
    onEdit();
    // Close the bottom sheet
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
  };

  const handleDelete = () => {
    onDelete();
    // Close the bottom sheet
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#e5e7eb",
        width: 40,
        height: 4,
      }}
      backgroundStyle={{
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 16,
      }}
    >
      <BottomSheetView className="flex-1 px-6 pb-8">
        {/* Background Elements */}
        <View className="absolute inset-0 overflow-hidden">
          <View
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              backgroundColor: "rgba(87, 182, 134, 0.04)",
              top: -100,
              right: -100,
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 150,
              height: 150,
              backgroundColor: "rgba(220, 38, 38, 0.03)",
              bottom: -75,
              left: -75,
            }}
          />
        </View>

        {/* Header */}
        <View className="items-center mb-8 mt-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Habit Actions
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Choose what you'd like to do with this habit
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-1 justify-center gap-4">
          {/* Edit Button */}
          <TouchableOpacity
            onPress={handleEdit}
            className="w-full"
            activeOpacity={0.8}
          >
            <View className="relative overflow-hidden rounded-2xl">
              <LinearGradient
                colors={["#10b981", "#34d399"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <Ionicons name="create-outline" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">
                      Edit Habit
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Modify your habit details
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            className="w-full"
            activeOpacity={0.8}
          >
            <View className="relative overflow-hidden rounded-2xl">
              <LinearGradient
                colors={["#dc2626", "#ef4444"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 24,
                  shadowColor: "#dc2626",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <Ionicons name="trash-outline" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">
                      Delete Habit
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Remove this habit permanently
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default HabitActionBottomSheet;
