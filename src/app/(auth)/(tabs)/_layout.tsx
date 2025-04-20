// app/(auth)/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIcon: ({ focused, color }) => {
          let icon: keyof typeof Ionicons.glyphMap;
          if (route.name === "home") icon = focused ? "home" : "home-outline";
          else if (route.name === "tree")
            icon = focused ? "leaf" : "leaf-outline";
          else if (route.name === "habits")
            icon = focused ? "checkbox" : "checkbox-outline";
          else if (route.name === "profile")
            icon = focused ? "person" : "person-outline";
          else icon = "ellipse-outline";
          return <Ionicons name={icon} size={24} color={color} />;
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
