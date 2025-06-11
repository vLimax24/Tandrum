import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Share,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [partnerUpdates, setPartnerUpdates] = useState(true);

  const router = useRouter();
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        "notifications",
        "darkMode",
        "sound",
        "vibration",
        "dailyReminders",
        "weeklyReports",
        "partnerUpdates",
      ]);

      settings.forEach(([key, value]) => {
        if (value !== null) {
          const boolValue = value === "true";
          switch (key) {
            case "notifications":
              setNotificationsEnabled(boolValue);
              break;
            case "darkMode":
              setDarkModeEnabled(boolValue);
              break;
            case "sound":
              setSoundEnabled(boolValue);
              break;
            case "vibration":
              setVibrationEnabled(boolValue);
              break;
            case "dailyReminders":
              setDailyReminders(boolValue);
              break;
            case "weeklyReports":
              setWeeklyReports(boolValue);
              break;
            case "partnerUpdates":
              setPartnerUpdates(boolValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting("notifications", value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    saveSetting("darkMode", value);
    Alert.alert(
      "Coming Soon",
      "Dark mode will be available in the next update!"
    );
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting("sound", value);
  };

  const handleVibrationToggle = (value: boolean) => {
    setVibrationEnabled(value);
    saveSetting("vibration", value);
  };

  const handleDailyRemindersToggle = (value: boolean) => {
    setDailyReminders(value);
    saveSetting("dailyReminders", value);
  };

  const handleWeeklyReportsToggle = (value: boolean) => {
    setWeeklyReports(value);
    saveSetting("weeklyReports", value);
  };

  const handlePartnerUpdatesToggle = (value: boolean) => {
    setPartnerUpdates(value);
    saveSetting("partnerUpdates", value);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Check out this amazing habit-building app! Join me on our journey to better habits.",
        url: "https://yourapp.com", // Replace with your app URL
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate Our App",
      "Would you like to rate our app on the App Store?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Rate Now",
          onPress: () => {
            // Replace with your app store URL
            Linking.openURL("https://apps.apple.com/app/your-app-id");
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "How would you like to contact our support team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Email",
          onPress: () => Linking.openURL("mailto:support@yourapp.com"),
        },
        {
          text: "Live Chat",
          onPress: () =>
            Alert.alert("Coming Soon", "Live chat will be available soon!"),
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://yourapp.com/privacy");
  };

  const handleTermsOfService = () => {
    Linking.openURL("https://yourapp.com/terms");
  };

  const handleDataExport = () => {
    Alert.alert(
      "Export Data",
      "We'll prepare your data export and send it to your email address within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Export",
          onPress: () =>
            Alert.alert(
              "Export Requested",
              "You'll receive an email with your data export within 24 hours."
            ),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Account Deletion",
              "Please contact support to delete your account."
            );
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    subtitle,
    icon,
    iconColor,
    iconBg,
    rightElement,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-4 px-6"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        className={`w-10 h-10 ${iconBg} rounded-full justify-center items-center mr-4`}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={["#ffffff", "#f8fafc"]}
        className="border-b border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/(tabs)/profile")}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-4"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View className="bg-white mx-4 mt-6 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-blue-50 px-6 py-4 border-b border-blue-100 rounded-t-2xl">
            <Text className="text-blue-800 text-lg font-bold">
              Notifications
            </Text>
          </View>

          <SettingItem
            title="Push Notifications"
            subtitle="Receive notifications for important updates"
            icon="notifications"
            iconColor="#3B82F6"
            iconBg="bg-blue-100"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={notificationsEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Daily Reminders"
            subtitle="Get reminded about your daily habits"
            icon="alarm"
            iconColor="#10B981"
            iconBg="bg-green-100"
            rightElement={
              <Switch
                value={dailyReminders}
                onValueChange={handleDailyRemindersToggle}
                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                thumbColor={dailyReminders ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Weekly Reports"
            subtitle="Receive weekly progress summaries"
            icon="stats-chart"
            iconColor="#8B5CF6"
            iconBg="bg-purple-100"
            rightElement={
              <Switch
                value={weeklyReports}
                onValueChange={handleWeeklyReportsToggle}
                trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
                thumbColor={weeklyReports ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Partner Updates"
            subtitle="Get notified about your partner's activities"
            icon="people"
            iconColor="#F59E0B"
            iconBg="bg-yellow-100"
            rightElement={
              <Switch
                value={partnerUpdates}
                onValueChange={handlePartnerUpdatesToggle}
                trackColor={{ false: "#E5E7EB", true: "#F59E0B" }}
                thumbColor={partnerUpdates ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />
        </View>

        {/* Experience Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-green-50 px-6 py-4 border-b border-green-100 rounded-t-2xl">
            <Text className="text-green-800 text-lg font-bold">Experience</Text>
          </View>

          <SettingItem
            title="Dark Mode"
            subtitle="Switch to dark theme"
            icon="moon"
            iconColor="#6B7280"
            iconBg="bg-gray-100"
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: "#E5E7EB", true: "#6B7280" }}
                thumbColor={darkModeEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Sound Effects"
            subtitle="Play sounds for interactions"
            icon="volume-high"
            iconColor="#EF4444"
            iconBg="bg-red-100"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: "#E5E7EB", true: "#EF4444" }}
                thumbColor={soundEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Haptic Feedback"
            subtitle="Vibrate on touch interactions"
            icon="phone-portrait"
            iconColor="#06B6D4"
            iconBg="bg-cyan-100"
            rightElement={
              <Switch
                value={vibrationEnabled}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: "#E5E7EB", true: "#06B6D4" }}
                thumbColor={vibrationEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            }
          />
        </View>

        {/* Support Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-purple-50 px-6 py-4 border-b border-purple-100 rounded-t-2xl">
            <Text className="text-purple-800 text-lg font-bold">
              Support & Feedback
            </Text>
          </View>

          <SettingItem
            title="Share App"
            subtitle="Tell your friends about the app"
            icon="share"
            iconColor="#3B82F6"
            iconBg="bg-blue-100"
            onPress={handleShareApp}
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Rate Us"
            subtitle="Leave a review on the App Store"
            icon="star"
            iconColor="#F59E0B"
            iconBg="bg-yellow-100"
            onPress={handleRateApp}
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Contact Support"
            subtitle="Get help with any issues"
            icon="help-circle"
            iconColor="#10B981"
            iconBg="bg-green-100"
            onPress={handleContactSupport}
          />
        </View>

        {/* Legal Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-orange-50 px-6 py-4 border-b border-orange-100 rounded-t-2xl">
            <Text className="text-orange-800 text-lg font-bold">
              Legal & Privacy
            </Text>
          </View>

          <SettingItem
            title="Privacy Policy"
            subtitle="How we handle your data"
            icon="shield-checkmark"
            iconColor="#8B5CF6"
            iconBg="bg-purple-100"
            onPress={handlePrivacyPolicy}
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Terms of Service"
            subtitle="App terms and conditions"
            icon="document-text"
            iconColor="#6B7280"
            iconBg="bg-gray-100"
            onPress={handleTermsOfService}
          />

          <View className="h-px bg-gray-100 mx-6" />

          <SettingItem
            title="Export Data"
            subtitle="Download your personal data"
            icon="download"
            iconColor="#059669"
            iconBg="bg-emerald-100"
            onPress={handleDataExport}
          />
        </View>

        {/* Account Section */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-red-50 px-6 py-4 border-b border-red-100 rounded-t-2xl">
            <Text className="text-red-800 text-lg font-bold">Account</Text>
          </View>

          <SettingItem
            title="Delete Account"
            subtitle="Permanently remove your account"
            icon="trash"
            iconColor="#EF4444"
            iconBg="bg-red-100"
            onPress={handleDeleteAccount}
          />
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
          <Text className="text-gray-400 text-xs mt-1">© 2024 Tandrum</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
