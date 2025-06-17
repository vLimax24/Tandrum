import React from "react";
import TabNavigator from "@/components/TabNavigator";
import SettingsScreen from "@/app/(auth)/(tabs)/settings";
import EditProfileScreen from "@/app/(auth)/(tabs)/edit-profile";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { View } from "react-native";
import type { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background[1] }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background[1],
            },
          }}
          id={undefined}
        >
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
      </View>
    </SafeAreaProvider>
  );
}
