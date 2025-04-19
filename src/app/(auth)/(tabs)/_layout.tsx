import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb", // Tailwind gray-200
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#16a34a", // Tailwind green-600
        tabBarInactiveTintColor: "#9ca3af", // Tailwind gray-400
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "tree")
            iconName = focused ? "leaf" : "leaf-outline";
          else if (route.name === "habits")
            iconName = focused ? "checkbox" : "checkbox-outline";
          else if (route.name === "profile")
            iconName = focused ? "person" : "person-outline";
          else iconName = "ellipse-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
      initialRouteName="home"
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="tree" options={{ title: "Tree" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
