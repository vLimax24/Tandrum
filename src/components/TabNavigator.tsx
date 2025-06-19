// TabNavigator.tsx
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '@/app/(auth)/(tabs)/home';
import TreeScreen from '@/app/(auth)/(tabs)/tree';
import HabitsScreen from '@/app/(auth)/(tabs)/habits';
import ProfileScreen from '@/app/(auth)/(tabs)/profile';
import { createTheme } from '@/utils/theme';
import { useTheme } from '@/contexts/themeContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { TabParamList } from '@/types/navigation';

const Tab = createMaterialTopTabNavigator<TabParamList>();

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
    new Animated.Value(focused ? 1 : 0),
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
          backgroundColor: focused ? theme.colors.glass : 'transparent',
        },
        style,
      ]}
      android_ripple={null}
      {...props}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }}
        className="items-center justify-center"
      >
        {children}
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
      case 'home':
        return {
          activeIcon: 'home',
          inactiveIcon: 'home-outline',
          accentColor: '#3b82f6',
          bgColor: focused
            ? isDarkMode
              ? 'rgba(59, 130, 246, 0.15)'
              : 'rgba(59, 130, 246, 0.1)'
            : 'transparent',
        };
      case 'tree':
        return {
          activeIcon: 'leaf',
          inactiveIcon: 'leaf-outline',
          accentColor: theme.colors.primary,
          bgColor: focused
            ? isDarkMode
              ? 'rgba(0, 153, 102, 0.15)'
              : 'rgba(0, 153, 102, 0.1)'
            : 'transparent',
        };
      case 'habits':
        return {
          activeIcon: 'checkmark-circle',
          inactiveIcon: 'checkmark-circle-outline',
          accentColor: '#8b5cf6',
          bgColor: focused
            ? isDarkMode
              ? 'rgba(139, 92, 246, 0.15)'
              : 'rgba(139, 92, 246, 0.1)'
            : 'transparent',
        };
      case 'profile':
        return {
          activeIcon: 'people',
          inactiveIcon: 'people-outline',
          accentColor: '#f59e0b',
          bgColor: focused
            ? isDarkMode
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(245, 158, 11, 0.1)'
            : 'transparent',
        };
      default:
        return {
          activeIcon: 'ellipse-outline',
          inactiveIcon: 'ellipse-outline',
          accentColor: theme.colors.text.secondary,
          bgColor: 'transparent',
        };
    }
  };

  const config = getIconConfig();
  const iconName = focused ? config.activeIcon : config.inactiveIcon;
  const iconColor = focused ? config.accentColor : theme.colors.text.tertiary;

  return (
    <View className="items-center">
      <View
        className="w-10 h-10 overflow-hidden items-center justify-center"
        style={{
          backgroundColor: config.bgColor,
          marginBottom: focused ? 6 : 2,
          borderRadius: 12,
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
      case 'home':
        return { color: focused ? '#3b82f6' : theme.colors.text.tertiary };
      case 'tree':
        return {
          color: focused ? theme.colors.primary : theme.colors.text.tertiary,
        };
      case 'habits':
        return { color: focused ? '#8b5cf6' : theme.colors.text.tertiary };
      case 'profile':
        return { color: focused ? '#f59e0b' : theme.colors.text.tertiary };
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
        fontWeight: focused ? '600' : '500',
        marginTop: focused ? 1 : 0,
      }}
    >
      {children}
    </Text>
  );
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <Tab.Navigator
      id={undefined}
      tabBarPosition="bottom"
      style={{
        backgroundColor: theme.colors.background[1],
      }}
      screenOptions={({ route, navigation }) => {
        const routeName =
          navigation.getState().routes[navigation.getState().index]?.name;

        const swipeDisabled = ['settings', 'edit-profile'].includes(
          routeName as string,
        );

        return {
          swipeEnabled: !swipeDisabled,
          animationEnabled: true, // Add this
          lazy: false, // Add this to prevent loading delays
        };
      }}
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80 + insets.bottom,
              paddingBottom: insets.bottom + 8,
              paddingTop: 12,
              paddingHorizontal: 8,
              backgroundColor: theme.colors.background[1],
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: theme.colors.cardBorder,
              ...(Platform.OS === 'ios' && {
                backdropFilter: 'blur(20px)',
              }),
            }}
          >
            {/* Background layers */}
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

            {/* Tab buttons container */}
            <View className="flex-1 flex-row items-center justify-around px-2">
              {state.routes
                .filter(
                  (route) => !['settings', 'edit-profile'].includes(route.name),
                )
                .map((route, index) => {
                  const { options } = descriptors[route.key];
                  const label = options.title || route.name;
                  const isFocused =
                    state.index ===
                    state.routes.findIndex((r) => r.key === route.key);

                  const onPress = () => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  return (
                    <TabBarButton
                      key={route.key}
                      onPress={onPress}
                      accessibilityState={{ selected: isFocused }}
                      isDarkMode={isDarkMode}
                      style={{ flex: 1 }}
                    >
                      <TabBarIcon
                        focused={isFocused}
                        color={
                          isFocused
                            ? theme.colors.text.primary
                            : theme.colors.text.tertiary
                        }
                        route={route}
                        isDarkMode={isDarkMode}
                      />
                      <TabBarLabel
                        focused={isFocused}
                        children={label}
                        route={route}
                        isDarkMode={isDarkMode}
                      />
                    </TabBarButton>
                  );
                })}
            </View>
          </View>
        );
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarAccessibilityLabel:
            'Home tab - View your dashboard and daily progress',
        }}
      />
      <Tab.Screen
        name="tree"
        component={TreeScreen}
        options={{
          title: 'Growth',
          tabBarAccessibilityLabel:
            'Growth tab - Track your habit building journey',
        }}
      />
      <Tab.Screen
        name="habits"
        component={HabitsScreen}
        options={{
          title: 'Habits',
          tabBarAccessibilityLabel:
            'Habits tab - Manage your daily habits and routines',
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel:
            'Team tab - Connect with your accountability partners',
        }}
      />
    </Tab.Navigator>
  );
}
