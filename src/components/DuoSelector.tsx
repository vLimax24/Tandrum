import React, { use } from "react";
import { View, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

interface DuoSelectorProps {
  connections: any[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export function DuoSelector({
  connections,
  selectedIndex,
  setSelectedIndex,
}: DuoSelectorProps) {
  const { isDarkMode } = useTheme();

  const theme = createTheme(isDarkMode);

  return (
    <BlurView
      intensity={20}
      tint={isDarkMode ? "dark" : "light"}
      className="rounded-3xl mb-8 overflow-hidden"
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.cardBorder,
        borderWidth: 1,
      }}
    >
      <View className="p-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-8 h-8 rounded-xl bg-primary/20 items-center justify-center">
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

        <View
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View className="flex-1">
              <RNPickerSelect
                onValueChange={setSelectedIndex}
                placeholder={{}}
                value={selectedIndex}
                items={connections.map((c, i) => ({
                  label: `Duo with ${c.partnerName}`,
                  value: i,
                }))}
                useNativeAndroidPickerStyle={false}
                style={{
                  inputIOS: {
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                    paddingVertical: 8,
                    paddingRight: 40,
                    paddingLeft: 4,
                  },
                  inputAndroid: {
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                    paddingVertical: 8,
                    paddingRight: 40,
                    paddingLeft: 4,
                  },
                  iconContainer: {
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    marginTop: -20 / 2, // half icon height
                    justifyContent: "center",
                    alignItems: "center",
                    height: 40,
                    width: 40,
                  },
                }}
                Icon={() => (
                  <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-5">
                    <Text style={{ color: "#ffffff", fontSize: 20 }}>▾</Text>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </View>
    </BlurView>
  );
}
