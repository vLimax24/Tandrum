import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { avatarOptions } from '@/utils/avatarImages';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';
import { AlertModal } from '@/components/Modals/AlertModal';
import { useI18n, SupportedLanguage } from '@/contexts/i18nContext';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const { signOut, isSignedIn } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);
  const { language, setLanguage, t } = useI18n();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
    title: '',
    message: '',
    buttons: [],
  });

  // Only run the query if user exists and has an id
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : 'skip',
  );

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap,
    iconColor?: string,
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

  // Show loading state while auth is loading
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // If no user after loading, don't render anything (redirect should happen)
  if (!user) {
    return null;
  }

  // If convex user is still loading, show loading state
  if (!convexUser) {
    return null; // or a loading spinner
  }

  const handleSignOut = async () => {
    showAlert(
      t('profile.signOut.alertTitle'),
      t('profile.signOut.alertMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.signOut.button'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data first
              await AsyncStorage.multiRemove([
                'isFirstTime',
                'tutorialCompleted',
                'onboardingCompleted',
                'convexUser',
              ]);

              // Sign out from Clerk
              await signOut();

              // The useFocusEffect will handle navigation when auth state changes
              // This prevents navigation timing issues
            } catch (error) {
              console.error('Sign out error:', error);
              showAlert(
                t('common.error'),
                t('profile.signOut.errorMessage'),
                [{ text: t('common.ok'), style: 'default' }],
                'alert-circle',
                '#ef4444',
              );
            }
          },
        },
      ],
      'log-out',
      '#ef4444',
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const formatJoinDate = (date) => {
    const joinDate = new Date(date);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(joinDate.getTime())) {
      return t('profile.accountInfo.recentlyJoined');
    }

    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('profile.accountInfo.today');
    } else if (diffDays === 1) {
      return t('profile.accountInfo.oneDayAgo');
    } else if (diffDays < 30) {
      return t('profile.accountInfo.daysAgo', { count: diffDays });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return t('profile.accountInfo.monthsAgo', { count: months });
    } else {
      const years = Math.floor(diffDays / 365);
      return t('profile.accountInfo.yearsAgo', { count: years });
    }
  };

  const GlassCard = ({ children, className = '' }) => (
    <BlurView
      intensity={20}
      tint={isDarkMode ? 'dark' : 'light'}
      className={`rounded-3xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.cardBorder,
      }}
    >
      {children}
    </BlurView>
  );

  const IconContainer = ({ icon, color, bgColor }) => (
    <View
      className="w-10 h-10 rounded-2xl justify-center items-center"
      style={{ backgroundColor: bgColor }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="px-6 pt-16 pb-8 relative">
          {/* Decorative Background Elements */}
          <View className="absolute inset-0 opacity-10">
            <View
              className="absolute top-8 right-8 w-32 h-32 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View
              className="absolute bottom-4 left-4 w-24 h-24 rounded-full"
              style={{ backgroundColor: theme.colors.primaryLight }}
            />
            <View
              className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full"
              style={{ backgroundColor: theme.colors.glass }}
            />
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={handleSettings}
            className="absolute top-16 right-6 w-12 h-12 rounded-2xl justify-center items-center"
          >
            <BlurView
              intensity={15}
              tint={isDarkMode ? 'dark' : 'light'}
              className="w-full h-full rounded-2xl justify-center items-center border"
              style={{
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.cardBorder,
              }}
            >
              <Ionicons
                name="settings"
                size={22}
                color={theme.colors.text.primary}
              />
            </BlurView>
          </TouchableOpacity>

          {/* Profile Header */}
          <View className="items-center mb-8">
            <View
              className="w-28 h-28 rounded-full mb-6 overflow-hidden border-2"
              style={{ borderColor: theme.colors.primary }}
            >
              <Image
                source={
                  convexUser?.avatar
                    ? avatarOptions.find((a) => a.key === convexUser.avatar)
                        ?.source || avatarOptions[0].source
                    : avatarOptions[0].source
                }
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text
              className="text-3xl font-bold mb-2 font-mainRegular text-center"
              style={{ color: theme.colors.text.primary }}
            >
              {convexUser?.name || t('common.loading')}
            </Text>
            <Text
              className="text-base font-mainRegular text-center"
              style={{ color: theme.colors.text.secondary }}
            >
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-6 pb-6 flex gap-6">
          {/* Account Information Card */}
          <GlassCard>
            <View className="p-6">
              <View className="flex-row items-center mb-6">
                <IconContainer
                  icon="person"
                  color="#ffffff"
                  bgColor={theme.colors.primary}
                />
                <View className="ml-4 flex-1">
                  <Text
                    className="text-lg font-bold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {t('profile.accountInfo.title')}
                  </Text>
                  <Text
                    className="text-sm font-mainRegular"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {t('profile.accountInfo.subtitle')}
                  </Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${theme.colors.primary}20` }}
                >
                  <Text
                    className="text-xs font-bold font-mainRegular"
                    style={{ color: theme.colors.primary }}
                  >
                    {t('profile.accountInfo.verified')}
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm font-medium font-mainRegular"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {t('profile.accountInfo.memberSince')}
                  </Text>
                  <View className="items-end">
                    <Text
                      className="text-base font-semibold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {new Date(convexUser.joined_at).toLocaleDateString(
                        language === 'de' ? 'de-DE' : 'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </Text>
                    <Text
                      className="text-xs font-mainRegular"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      {formatJoinDate(convexUser.joined_at.toString())}
                    </Text>
                  </View>
                </View>

                <View
                  className="h-px"
                  style={{ backgroundColor: theme.colors.cardBorder }}
                />

                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm font-medium font-mainRegular"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {t('profile.accountInfo.accountStatus')}
                  </Text>
                  <View className="flex-row items-center">
                    <View
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text
                      className="text-sm font-semibold font-mainRegular"
                      style={{ color: theme.colors.primary }}
                    >
                      {t('profile.accountInfo.active')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Preferences Card */}
          <GlassCard>
            <View className="p-6">
              <View className="flex-row items-center mb-6">
                <IconContainer
                  icon="options"
                  color="#ffffff"
                  bgColor="#8b5cf6"
                />
                <View className="ml-4">
                  <Text
                    className="text-lg font-bold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {t('profile.preferences.title')}
                  </Text>
                  <Text
                    className="text-sm font-mainRegular"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {t('profile.preferences.subtitle')}
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm font-medium font-mainRegular"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {t('profile.preferences.timezone')}
                  </Text>
                  <Text
                    className="text-base font-semibold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {convexUser.timezone}
                  </Text>
                </View>

                <View
                  className="h-px"
                  style={{ backgroundColor: theme.colors.cardBorder }}
                />

                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-sm font-medium font-mainRegular"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {t('profile.preferences.language')}
                  </Text>
                  <Text
                    className="text-base font-semibold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {convexUser.language}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Bio Card (if exists) */}
          {convexUser.bio && (
            <GlassCard>
              <View className="p-6">
                <View className="flex-row items-center mb-6">
                  <IconContainer
                    icon="document-text"
                    color="#ffffff"
                    bgColor="#10b981"
                  />
                  <View className="ml-4">
                    <Text
                      className="text-lg font-bold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {t('profile.bio.title')}
                    </Text>
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.tertiary }}
                    >
                      {t('profile.bio.subtitle')}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-base leading-relaxed font-mainRegular"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {convexUser.bio}
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Quick Actions Card */}
          <GlassCard>
            <View className="p-6">
              <View className="flex-row items-center mb-6">
                <IconContainer icon="flash" color="#ffffff" bgColor="#f59e0b" />
                <View className="ml-4">
                  <Text
                    className="text-lg font-bold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {t('profile.quickActions.title')}
                  </Text>
                  <Text
                    className="text-sm font-mainRegular"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {t('profile.quickActions.subtitle')}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={handleEditProfile}
                  className="flex-1 rounded-2xl py-4 px-4 items-center border"
                  style={{
                    backgroundColor: `${theme.colors.primary}15`,
                    borderColor: `${theme.colors.primary}30`,
                  }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    className="text-base font-semibold mb-1 font-mainRegular"
                    style={{ color: theme.colors.primary }}
                  >
                    {t('profile.quickActions.editProfile')}
                  </Text>
                  <Text
                    className="text-xs text-center font-mainRegular"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {t('profile.quickActions.editProfileSubtitle')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSettings}
                  className="flex-1 rounded-2xl py-4 px-4 items-center border"
                  style={{
                    backgroundColor: '#8b5cf615',
                    borderColor: '#8b5cf630',
                  }}
                >
                  <Ionicons
                    name="settings"
                    size={20}
                    color="#8b5cf6"
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    className="text-base font-semibold mb-1 font-mainRegular"
                    style={{ color: '#8b5cf6' }}
                  >
                    {t('profile.quickActions.settings')}
                  </Text>
                  <Text
                    className="text-xs text-center font-mainRegular"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {t('profile.quickActions.settingsSubtitle')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>

          {/* Sign Out Section */}
          <GlassCard>
            <View className="p-6">
              <TouchableOpacity
                onPress={handleSignOut}
                className="rounded-2xl py-4 px-6 flex-row items-center justify-center"
                style={{ backgroundColor: '#ef4444' }}
              >
                <Ionicons
                  name="log-out"
                  size={20}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-semibold font-mainRegular">
                  {t('profile.signOut.button')}
                </Text>
              </TouchableOpacity>

              <Text
                className="text-xs text-center mt-4 font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                {t('profile.signOut.subtitle')}
              </Text>
            </View>
          </GlassCard>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </View>
      </ScrollView>

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
    </LinearGradient>
  );
};

export default Profile;
