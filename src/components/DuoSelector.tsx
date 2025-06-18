import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

interface DuoSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  connections: any[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DuoSelectorModal({
  visible,
  onClose,
  connections,
  selectedIndex,
  onSelect,
}: DuoSelectorModalProps) {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const handleSelect = (index: number) => {
    onSelect(index);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      className="w-full"
    >
      <Pressable
        className="flex-1 justify-center items-center w-full px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full">
          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            className="rounded-3xl overflow-hidden w-full"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              borderWidth: 1,
            }}
          >
            <View className="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${theme.colors.primary}33` }}
                  >
                    <Ionicons
                      size={15}
                      name="people"
                      color={theme.colors.primaryLight}
                    />
                  </View>
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Select Duo Partner
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: theme.colors.glass }}
                >
                  <Ionicons
                    size={16}
                    name="close"
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Connection Options */}
              <View className="gap-3">
                {connections.map((connection, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(index)}
                    className="rounded-2xl p-4 border"
                    style={{
                      backgroundColor:
                        selectedIndex === index
                          ? theme.colors.primary
                          : theme.colors.glass,
                      borderColor:
                        selectedIndex === index
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-10 h-10 rounded-2xl items-center justify-center"
                          style={{
                            backgroundColor:
                              selectedIndex === index
                                ? "rgba(255, 255, 255, 0.2)"
                                : `${theme.colors.primary}33`,
                          }}
                        >
                          <Ionicons
                            size={16}
                            name="person"
                            color={
                              selectedIndex === index
                                ? "#ffffff"
                                : theme.colors.primary
                            }
                          />
                        </View>
                        <View>
                          <Text
                            className="font-semibold text-base"
                            style={{
                              color:
                                selectedIndex === index
                                  ? "#ffffff"
                                  : theme.colors.text.primary,
                            }}
                          >
                            {connection.partnerName}
                          </Text>
                          <Text
                            className="text-sm"
                            style={{
                              color:
                                selectedIndex === index
                                  ? "rgba(255, 255, 255, 0.8)"
                                  : theme.colors.text.secondary,
                            }}
                          >
                            Duo Partner
                          </Text>
                        </View>
                      </View>

                      {selectedIndex === index && (
                        <View className="w-6 h-6 rounded-full bg-white/30 items-center justify-center">
                          <Ionicons
                            size={12}
                            name="checkmark"
                            color="#ffffff"
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Usage example - Updated DuoSelector component
export function DuoSelector({ connections, selectedIndex, setSelectedIndex }) {
  const { isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const theme = createTheme(isDarkMode);

  return (
    <>
      <BlurView
        intensity={20}
        tint={isDarkMode ? "dark" : "light"}
        className="rounded-3xl mb-8 overflow-hidden w-full"
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
          borderWidth: 1,
        }}
      >
        <View className="p-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-8 h-8 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${theme.colors.primary}33` }}
            >
              <Ionicons
                size={15}
                name="people"
                color={theme.colors.primaryLight}
              />
            </View>
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              Active Duo Partnership
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
                  <Ionicons size={16} name="person" color="#ffffff" />
                </View>
                <Text
                  className="font-semibold text-base"
                  style={{ color: "#ffffff" }}
                >
                  Duo with {connections[selectedIndex]?.partnerName}
                </Text>
              </View>

              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <Ionicons size={12} name="chevron-down" color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </BlurView>

      <DuoSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        connections={connections}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
    </>
  );
}
