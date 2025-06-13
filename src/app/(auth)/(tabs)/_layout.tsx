import React from "react";
import { Pressable, View, Text, Animated } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabBarButton = ({
  children,
  onPress,
  accessibilityState,
  style,
  ...props
}: any) => {
  const focused = accessibilityState?.selected;
  const animatedValue = React.useRef(
    new Animated.Value(focused ? 1 : 0)
  ).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [focused, animatedValue]);

  const scaleAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const translateYAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 8,
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Tab Content */}
        <View
          style={{ alignItems: "center", justifyContent: "center", zIndex: 1 }}
        >
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const TabBarIcon = ({
  focused,
  color,
  route,
  size = 24,
}: {
  focused: boolean;
  color: string;
  route: any;
  size?: number;
}) => {
  const getIconConfig = () => {
    switch (route.name) {
      case "home":
        return {
          activeIcon: "home",
          inactiveIcon: "home-outline",
          gradient: focused ? ["#3b82f6", "#1d4ed8"] : [color, color],
          bgColor: focused ? "#dbeafe" : "transparent",
        };
      case "tree":
        return {
          activeIcon: "leaf",
          inactiveIcon: "leaf-outline",
          gradient: focused ? ["#10b981", "#059669"] : [color, color],
          bgColor: focused ? "#d1fae5" : "transparent",
        };
      case "habits":
        return {
          activeIcon: "checkbox",
          inactiveIcon: "checkbox-outline",
          gradient: focused ? ["#8b5cf6", "#7c3aed"] : [color, color],
          bgColor: focused ? "#ede9fe" : "transparent",
        };
      case "profile":
        return {
          activeIcon: "person",
          inactiveIcon: "person-outline",
          gradient: focused ? ["#f59e0b", "#d97706"] : [color, color],
          bgColor: focused ? "#fef3c7" : "transparent",
        };
      default:
        return {
          activeIcon: "ellipse-outline",
          inactiveIcon: "ellipse-outline",
          gradient: [color, color],
          bgColor: "transparent",
        };
    }
  };

  const config = getIconConfig();
  const iconName = focused ? config.activeIcon : config.inactiveIcon;

  return (
    <View style={{ alignItems: "center" }}>
      {/* Icon Container with Background */}
      <View
        style={{
          width: 35,
          height: 35,
          borderRadius: 20,
          backgroundColor: config.bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: focused ? 8 : 4,
          ...(focused && {
            shadowColor: config.gradient[0],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }),
        }}
      >
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={size}
          color={focused ? config.gradient[0] : color}
        />
      </View>
    </View>
  );
};

const TabBarLabel = ({
  focused,
  children,
  route,
}: {
  focused: boolean;
  children: string;
  route: any;
}) => {
  const getLabelConfig = () => {
    switch (route.name) {
      case "home":
        return { color: focused ? "#1d4ed8" : "#6b7280" };
      case "tree":
        return { color: focused ? "#059669" : "#6b7280" };
      case "habits":
        return { color: focused ? "#7c3aed" : "#6b7280" };
      case "profile":
        return { color: focused ? "#d97706" : "#6b7280" };
      default:
        return { color: "#6b7280" };
    }
  };

  const config = getLabelConfig();

  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: focused ? "700" : "600",
        color: config.color,
        marginTop: 2,
        textAlign: "center",
      }}
      className="font-mainRegular"
    >
      {children}
    </Text>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          elevation: 1, // Reduced elevation
          zIndex: 0, // Lower z-index to ensure bottom sheet appears above
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#ffffff",
              overflow: "hidden",
            }}
          >
            {/* Subtle gradient overlay */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "#f8fafc",
              }}
            />
          </View>
        ),
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarIcon: ({ focused, color }) => (
          <TabBarIcon focused={focused} color={color} route={route} />
        ),
        tabBarLabel: ({ focused, children }) => (
          <TabBarLabel focused={focused} children={children} route={route} />
        ),
        tabBarActiveTintColor: "#1f2937",
        tabBarInactiveTintColor: "#6b7280",
        tabBarHideOnKeyboard: true,
      })}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home tab",
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: "Tree",
          tabBarAccessibilityLabel: "Tree tab",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarAccessibilityLabel: "Habits tab",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile tab",
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
