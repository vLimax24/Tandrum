import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Share,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/types/navigation";
import { AlertModal } from "@/components/AlertModal";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [partnerUpdates, setPartnerUpdates] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = createTheme(isDarkMode);

  const { signOut } = useAuth();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: any[];
    icon?: any;
    iconColor?: string;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
    icon?: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap,
    iconColor?: string
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  };

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
    toggleTheme();
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
        message: "Join me on Tandrum! Let's build amazing habits together 🌱✨",
        url: "https://tandrum.app",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRateApp = () => {
    showAlert(
      "Love Tandrum? 💚",
      "Your review helps us grow our community of habit builders!",
      [
        { text: "Maybe Later", style: "cancel" },
        {
          text: "Rate Now ⭐",
          onPress: () => {
            Linking.openURL("https://apps.apple.com/app/tandrum");
          },
        },
      ],
      "star",
      "#F59E0B"
    );
  };

  const handleContactSupport = () => {
    showAlert(
      "We're Here to Help! 🤝",
      "How would you like to reach our support team?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Email Support 📧",
          onPress: () => Linking.openURL("mailto:support@tandrum.app"),
        },
        {
          text: "Live Chat 💬",
          onPress: () =>
            showAlert(
              "Coming Soon!",
              "Live chat will be available in the next update! 🚀",
              [{ text: "OK", style: "default" }],
              "chatbubble-ellipses",
              "#10B981"
            ),
        },
      ],
      "help-circle",
      "#10B981"
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://tandrum.app/privacy");
  };

  const handleTermsOfService = () => {
    Linking.openURL("https://tandrum.app/terms");
  };

  const handleDataExport = () => {
    showAlert(
      "Export Your Journey 📊",
      "We'll prepare your habit data and progress history. You'll receive it within 24 hours!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Export 📤",
          onPress: () =>
            showAlert(
              "Export Requested! ✅",
              "Your data export is being prepared. Check your email within 24 hours.",
              [{ text: "OK", style: "default" }],
              "checkmark-circle",
              "#10B981"
            ),
        },
      ],
      "download",
      "#059669"
    );
  };

  const handleDeleteAccount = () => {
    showAlert(
      "Delete Account? 😢",
      "We're sorry to see you go! This will permanently remove your account and all progress data. This action cannot be undone.",
      [
        { text: "Keep My Account", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => {
            showAlert(
              "Final Confirmation ⚠️",
              "This will permanently delete your account, habits, and all progress data. Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "I Understand, Delete Account",
                  style: "destructive",
                  onPress: confirmDeleteAccount,
                },
              ],
              "warning",
              "#EF4444"
            );
          },
        },
      ],
      "trash",
      "#EF4444"
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;

    try {
      showAlert(
        "Deleting Account...",
        "Please wait while we process your request...",
        [],
        "hourglass",
        "#6B7280"
      );

      await AsyncStorage.multiRemove([
        "isFirstTime",
        "tutorialCompleted",
        "onboardingCompleted",
        "convexUser",
      ]);

      await deleteAccountMutation({ clerkId: user.id });
      await user.delete();
      await signOut();
      await AsyncStorage.setItem("isFirstTime", "true");
      await AsyncStorage.setItem("tutorialCompleted", "false");

      showAlert(
        "Account Deleted ✅",
        "Your account has been successfully deleted. Thank you for being part of our community.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/(tutorial)/");
            },
          },
        ],
        "checkmark-circle",
        "#10B981"
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      showAlert(
        "Oops! Something went wrong 😕",
        "We couldn't delete your account right now. Please try again or contact our support team.",
        [{ text: "OK" }],
        "alert-circle",
        "#EF4444"
      );
    }
  };

  const SettingItem = ({
    title,
    subtitle,
    icon,
    iconColor,
    rightElement,
    onPress,
    isLast = false,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    iconColor: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className="flex-row items-center py-5 px-6"
        activeOpacity={onPress ? 0.7 : 1}
        style={{
          backgroundColor: "transparent",
        }}
      >
        <View
          className="w-11 h-11 rounded-2xl justify-center items-center mr-4"
          style={{ backgroundColor: theme.colors.glass }}
        >
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold font-mainRegular"
            style={{ color: theme.colors.text.primary }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-sm mt-1 font-mainRegular"
              style={{ color: theme.colors.text.secondary }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement ||
          (onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text.tertiary}
            />
          ))}
      </TouchableOpacity>
      {!isLast && (
        <View
          className="h-px mx-6"
          style={{ backgroundColor: theme.colors.cardBorder }}
        />
      )}
    </>
  );

  const SectionHeader = ({
    title,
    icon,
    gradientColors,
    textColor,
  }: {
    title: string;
    icon: string;
    gradientColors: [string, string];
    textColor: string;
  }) => (
    <View className="mx-5 mb-2 mt-6">
      <BlurView
        intensity={20}
        tint={isDarkMode ? "dark" : "light"}
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: theme.colors.cardBorder }}
      >
        <LinearGradient colors={gradientColors} className="px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View
              className="w-8 h-8 rounded-xl justify-center items-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name={icon as any} size={18} color={textColor} />
            </View>
            <Text
              className="text-base font-bold font-mainRegular"
              style={{ color: textColor }}
            >
              {title}
            </Text>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );

  const SettingCard = ({ children }: { children: React.ReactNode }) => (
    <View className="mx-5 mb-4">
      <BlurView
        intensity={20}
        tint={isDarkMode ? "dark" : "light"}
        className="rounded-3xl overflow-hidden border"
        style={{
          borderColor: theme.colors.cardBorder,
          backgroundColor: theme.colors.cardBackground,
        }}
      >
        {children}
      </BlurView>
    </View>
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background[0] }}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <LinearGradient colors={theme.colors.background} className="flex-1">
        <SafeAreaView className="flex-1">
          {/* Header with Glassmorphism */}
          <BlurView
            intensity={30}
            tint={isDarkMode ? "dark" : "light"}
            className="border-b border-opacity-20"
            style={{ borderBottomColor: theme.colors.cardBorder }}
          >
            <View className="flex-row items-center px-6 py-4 gap-4">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Tabs", { screen: "profile" })
                }
                className="w-11 h-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.colors.glass }}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
              <View className="flex-1">
                <Text
                  className="text-2xl font-bold font-mainRegular"
                  style={{ color: theme.colors.text.primary }}
                >
                  Settings
                </Text>
                <Text
                  className="text-sm font-mainRegular mt-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Customize your Tandrum experience 🎯
                </Text>
              </View>
            </View>
          </BlurView>

          <ScrollView
            className="flex-1 pt-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Notifications Section */}
            <SectionHeader
              title="Notifications & Reminders"
              icon="notifications-outline"
              gradientColors={["#3B82F6", "#1D4ED8"]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title="Push Notifications"
                subtitle="Stay updated with habit reminders and progress"
                icon="notifications"
                iconColor="#3B82F6"
                rightElement={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: theme.colors.primary,
                    }}
                    thumbColor={notificationsEnabled ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
              />
              <SettingItem
                title="Daily Habit Reminders"
                subtitle="Gentle nudges to keep your streaks alive"
                icon="alarm"
                iconColor="#10B981"
                rightElement={
                  <Switch
                    value={dailyReminders}
                    onValueChange={handleDailyRemindersToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#10B981",
                    }}
                    thumbColor={dailyReminders ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
              />
              <SettingItem
                title="Weekly Progress Reports"
                subtitle="Celebrate your wins and plan ahead"
                icon="stats-chart"
                iconColor="#8B5CF6"
                rightElement={
                  <Switch
                    value={weeklyReports}
                    onValueChange={handleWeeklyReportsToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#8B5CF6",
                    }}
                    thumbColor={weeklyReports ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
              />
              <SettingItem
                title="Partner Activity Updates"
                subtitle="Stay connected with your habit buddy"
                icon="people"
                iconColor="#F59E0B"
                rightElement={
                  <Switch
                    value={partnerUpdates}
                    onValueChange={handlePartnerUpdatesToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#F59E0B",
                    }}
                    thumbColor={partnerUpdates ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
                isLast
              />
            </SettingCard>

            {/* Experience Section */}
            <SectionHeader
              title="App Experience"
              icon="color-palette-outline"
              gradientColors={[theme.colors.primary, theme.colors.primaryLight]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title="Dark Mode"
                subtitle="Easy on the eyes, perfect for evening habits"
                icon="moon"
                iconColor="#6B7280"
                rightElement={
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleDarkModeToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#6B7280",
                    }}
                    thumbColor={isDarkMode ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
              />
              <SettingItem
                title="Sound Feedback"
                subtitle="Satisfying audio cues for completed habits"
                icon="volume-high"
                iconColor="#EF4444"
                rightElement={
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleSoundToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#EF4444",
                    }}
                    thumbColor={soundEnabled ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
              />
              <SettingItem
                title="Haptic Feedback"
                subtitle="Feel the satisfaction with every tap"
                icon="phone-portrait"
                iconColor="#06B6D4"
                rightElement={
                  <Switch
                    value={vibrationEnabled}
                    onValueChange={handleVibrationToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: "#06B6D4",
                    }}
                    thumbColor={vibrationEnabled ? "#FFFFFF" : "#9CA3AF"}
                  />
                }
                isLast
              />
            </SettingCard>

            {/* Community & Support Section */}
            <SectionHeader
              title="Community & Support"
              icon="heart-outline"
              gradientColors={["#8B5CF6", "#7C3AED"]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title="Share Tandrum"
                subtitle="Invite friends to build habits together"
                icon="share"
                iconColor="#3B82F6"
                onPress={handleShareApp}
              />
              <SettingItem
                title="Rate Our App"
                subtitle="Help us grow the Tandrum community"
                icon="star"
                iconColor="#F59E0B"
                onPress={handleRateApp}
              />
              <SettingItem
                title="Get Support"
                subtitle="We're here to help you succeed"
                icon="help-circle"
                iconColor="#10B981"
                onPress={handleContactSupport}
                isLast
              />
            </SettingCard>

            {/* Legal & Privacy Section */}
            <SectionHeader
              title="Privacy & Legal"
              icon="shield-checkmark-outline"
              gradientColors={["#059669", "#047857"]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title="Privacy Policy"
                subtitle="How we protect your personal data"
                icon="shield-checkmark"
                iconColor="#8B5CF6"
                onPress={handlePrivacyPolicy}
              />
              <SettingItem
                title="Terms of Service"
                subtitle="Our commitment to you"
                icon="document-text"
                iconColor="#6B7280"
                onPress={handleTermsOfService}
              />
              <SettingItem
                title="Export My Data"
                subtitle="Download your complete habit journey"
                icon="download"
                iconColor="#059669"
                onPress={handleDataExport}
                isLast
              />
            </SettingCard>

            {/* Account Section */}
            <SectionHeader
              title="Account Management"
              icon="person-outline"
              gradientColors={["#EF4444", "#DC2626"]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title="Delete My Account"
                subtitle="Permanently remove your account and data"
                icon="trash"
                iconColor="#EF4444"
                onPress={handleDeleteAccount}
                isLast
              />
            </SettingCard>

            {/* App Info */}
            <View className="items-center py-8 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="leaf" size={20} color={theme.colors.primary} />
                <Text
                  className="font-bold font-mainRegular"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Tandrum v1.0.0
                </Text>
              </View>
              <Text
                className="text-xs font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                Building habits together, one day at a time
              </Text>
              <Text
                className="text-xs font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                © 2024 Tandrum • Made with 💚
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Custom Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={closeAlert}
      />
    </View>
  );
}
