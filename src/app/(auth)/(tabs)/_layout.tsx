import React from "react";
import { Pressable, View, Text, Animated, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createTheme } from "@/utils/theme";
import { useTheme } from "@/contexts/themeContext";

const TabBarButton = ({
  children,
  onPress,
  accessibilityState,
  style,
  isDarkMode,
  ...props
}: any) => {
  const focused = accessibilityState?.selected;
  const theme = createTheme(isDarkMode);
  const animatedValue = React.useRef(
    new Animated.Value(focused ? 1 : 0)
  ).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [focused, animatedValue]);

  const scaleAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const translateYAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-3"
      style={[
        {
          borderRadius: 16,
          backgroundColor: focused ? theme.colors.glass : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }}
        className="items-center justify-center"
      >
        <View className="items-center justify-center z-10">{children}</View>
      </Animated.View>
    </Pressable>
  );
};

const TabBarIcon = ({
  focused,
  color,
  route,
  isDarkMode,
  size = 24,
}: {
  focused: boolean;
  color: string;
  route: any;
  isDarkMode: boolean;
  size?: number;
}) => {
  const theme = createTheme(isDarkMode);

  const getIconConfig = () => {
    switch (route.name) {
      case "home":
        return {
          activeIcon: "home",
          inactiveIcon: "home-outline",
          accentColor: "#3b82f6",
          bgColor: focused
            ? isDarkMode
              ? "rgba(59, 130, 246, 0.15)"
              : "rgba(59, 130, 246, 0.1)"
            : "transparent",
        };
      case "tree":
        return {
          activeIcon: "leaf",
          inactiveIcon: "leaf-outline",
          accentColor: theme.colors.primary,
          bgColor: focused
            ? isDarkMode
              ? "rgba(0, 153, 102, 0.15)"
              : "rgba(0, 153, 102, 0.1)"
            : "transparent",
        };
      case "habits":
        return {
          activeIcon: "checkmark-circle",
          inactiveIcon: "checkmark-circle-outline",
          accentColor: "#8b5cf6",
          bgColor: focused
            ? isDarkMode
              ? "rgba(139, 92, 246, 0.15)"
              : "rgba(139, 92, 246, 0.1)"
            : "transparent",
        };
      case "profile":
        return {
          activeIcon: "people",
          inactiveIcon: "people-outline",
          accentColor: "#f59e0b",
          bgColor: focused
            ? isDarkMode
              ? "rgba(245, 158, 11, 0.15)"
              : "rgba(245, 158, 11, 0.1)"
            : "transparent",
        };
      default:
        return {
          activeIcon: "ellipse-outline",
          inactiveIcon: "ellipse-outline",
          accentColor: theme.colors.text.secondary,
          bgColor: "transparent",
        };
    }
  };

  const config = getIconConfig();
  const iconName = focused ? config.activeIcon : config.inactiveIcon;
  const iconColor = focused ? config.accentColor : theme.colors.text.tertiary;

  return (
    <View className="items-center">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: config.bgColor,
          marginBottom: focused ? 6 : 2,
        }}
      >
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={size}
          color={iconColor}
        />
      </View>
    </View>
  );
};

const TabBarLabel = ({
  focused,
  children,
  route,
  isDarkMode,
}: {
  focused: boolean;
  children: string;
  route: any;
  isDarkMode: boolean;
}) => {
  const theme = createTheme(isDarkMode);

  const getLabelConfig = () => {
    switch (route.name) {
      case "home":
        return { color: focused ? "#3b82f6" : theme.colors.text.tertiary };
      case "tree":
        return {
          color: focused ? theme.colors.primary : theme.colors.text.tertiary,
        };
      case "habits":
        return { color: focused ? "#8b5cf6" : theme.colors.text.tertiary };
      case "profile":
        return { color: focused ? "#f59e0b" : theme.colors.text.tertiary };
      default:
        return { color: theme.colors.text.tertiary };
    }
  };

  const config = getLabelConfig();

  return (
    <Text
      className="text-xs text-center font-medium"
      style={{
        color: config.color,
        fontWeight: focused ? "600" : "500",
        marginTop: focused ? 1 : 0,
      }}
    >
      {children}
    </Text>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme(); // Use the theme context
  const theme = createTheme(isDarkMode);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
          paddingHorizontal: 8,
          backgroundColor: theme.colors.cardBackground,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: theme.colors.cardBorder,
          ...(Platform.OS === "ios" && {
            backdropFilter: "blur(20px)",
          }),
        },
        tabBarBackground: () => (
          <View className="absolute inset-0 overflow-hidden">
            <View
              className="absolute inset-0 rounded-t-3xl"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            {/* Glassmorphism overlay */}
            <View
              className="absolute inset-0 rounded-t-3xl"
              style={{
                backgroundColor: theme.colors.glass,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
          </View>
        ),
        tabBarButton: (props) => (
          <TabBarButton {...props} isDarkMode={isDarkMode} />
        ),
        tabBarIcon: ({ focused, color }) => (
          <TabBarIcon
            focused={focused}
            color={color}
            route={route}
            isDarkMode={isDarkMode}
          />
        ),
        tabBarLabel: ({ focused, children }) => (
          <TabBarLabel
            focused={focused}
            children={children}
            route={route}
            isDarkMode={isDarkMode}
          />
        ),
        tabBarActiveTintColor: theme.colors.text.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarHideOnKeyboard: true,
      })}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarAccessibilityLabel:
            "Home tab - View your dashboard and daily progress",
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: "Growth",
          tabBarAccessibilityLabel:
            "Growth tab - Track your habit building journey",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarAccessibilityLabel:
            "Habits tab - Manage your daily habits and routines",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Team",
          tabBarAccessibilityLabel:
            "Team tab - Connect with your accountability partners",
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}
