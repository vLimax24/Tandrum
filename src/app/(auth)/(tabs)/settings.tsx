import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';
import { AlertModal } from '@/components/Modals/AlertModal';
import { useI18n, SupportedLanguage } from '@/contexts/i18nContext';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [partnerUpdates, setPartnerUpdates] = useState(true);

  const LANGUAGES = [
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
    { code: 'de' as SupportedLanguage, name: 'Deutsch', flag: '🇩🇪' },
  ];

  const { language, setLanguage, t } = useI18n();
  const [currentLanguage, setCurrentLanguage] = useState(language);

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
    title: '',
    message: '',
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

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.multiGet([
        'notifications',
        'darkMode',
        'sound',
        'vibration',
        'dailyReminders',
        'weeklyReports',
        'partnerUpdates',
      ]);

      settings.forEach(([key, value]) => {
        if (value !== null) {
          const boolValue = value === 'true';
          switch (key) {
            case 'notifications':
              setNotificationsEnabled(boolValue);
              break;
            case 'darkMode':
              setDarkModeEnabled(boolValue);
              break;
            case 'sound':
              setSoundEnabled(boolValue);
              break;
            case 'vibration':
              setVibrationEnabled(boolValue);
              break;
            case 'dailyReminders':
              setDailyReminders(boolValue);
              break;
            case 'weeklyReports':
              setWeeklyReports(boolValue);
              break;
            case 'partnerUpdates':
              setPartnerUpdates(boolValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('notifications', value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    saveSetting('darkMode', value);
    toggleTheme();
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting('sound', value);
  };

  const handleVibrationToggle = (value: boolean) => {
    setVibrationEnabled(value);
    saveSetting('vibration', value);
  };

  const handleDailyRemindersToggle = (value: boolean) => {
    setDailyReminders(value);
    saveSetting('dailyReminders', value);
  };

  const handleWeeklyReportsToggle = (value: boolean) => {
    setWeeklyReports(value);
    saveSetting('weeklyReports', value);
  };

  const handlePartnerUpdatesToggle = (value: boolean) => {
    setPartnerUpdates(value);
    saveSetting('partnerUpdates', value);
  };

  const handleLanguageChange = () => {
    showAlert(
      t('settings.language.title') || 'Language / Sprache',
      t('settings.language.subtitle') || 'Choose your preferred language',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        ...LANGUAGES.map((lang) => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: async () => {
            if (lang.code === language) return;

            try {
              await setLanguage(lang.code);
              setCurrentLanguage(lang.code);

              const confirmationMessage =
                lang.code === 'de'
                  ? 'Sprache wurde geändert!'
                  : 'Language changed!';

              showAlert(
                '✓',
                confirmationMessage,
                [{ text: 'OK', style: 'default' }],
                'checkmark-circle',
                '#10B981',
              );
            } catch (error) {
              console.error('Error changing language:', error);
              showAlert(
                'Error',
                'Failed to change language',
                [{ text: 'OK', style: 'default' }],
                'alert-circle',
                '#EF4444',
              );
            }
          },
        })),
      ],
      'language',
      '#8B5CF6',
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: t('settings.community.share.message'),
        url: 'https://tandrum.app',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    showAlert(
      t('settings.community.rate.alertTitle'),
      t('settings.community.rate.alertMessage'),
      [
        { text: t('settings.community.rate.maybeLater'), style: 'cancel' },
        {
          text: t('settings.community.rate.rateNow'),
          onPress: () => {
            Linking.openURL('https://apps.apple.com/app/tandrum');
          },
        },
      ],
      'star',
      '#F59E0B',
    );
  };

  const handleContactSupport = () => {
    showAlert(
      t('settings.community.support.alertTitle'),
      t('settings.community.support.alertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.community.support.emailSupport'),
          onPress: () => Linking.openURL('mailto:support@tandrum.app'),
        },
        {
          text: t('settings.community.support.liveChat'),
          onPress: () =>
            showAlert(
              t('settings.community.support.commingSoon'),
              t('settings.community.support.comingSoonMessage'),
              [{ text: 'OK', style: 'default' }],
              'chatbubble-ellipses',
              '#10B981',
            ),
        },
      ],
      'help-circle',
      '#10B981',
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://tandrum.app/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://tandrum.app/terms');
  };

  const handleDataExport = () => {
    showAlert(
      t('settings.privacy.dataExport.alertTitle'),
      t('settings.privacy.dataExport.alertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.privacy.dataExport.requestExport'),
          onPress: () =>
            showAlert(
              t('settings.privacy.dataExport.exportRequested'),
              t('settings.privacy.dataExport.exportRequestedMessage'),
              [{ text: 'OK', style: 'default' }],
              'checkmark-circle',
              '#10B981',
            ),
        },
      ],
      'download',
      '#059669',
    );
  };

  const handleDeleteAccount = () => {
    showAlert(
      t('settings.account.deleteAccount.alertTitle'),
      t('settings.account.deleteAccount.alertMessage'),
      [
        {
          text: t('settings.account.deleteAccount.keepAccount'),
          style: 'cancel',
        },
        {
          text: t('settings.account.deleteAccount.deleteForever'),
          style: 'destructive',
          onPress: () => {
            // Close the current alert first
            closeAlert();
            // Add a small delay to ensure the modal closes properly
            setTimeout(() => {
              showAlert(
                t('settings.account.deleteAccount.finalConfirmation'),
                t('settings.account.deleteAccount.finalConfirmationMessage'),
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => closeAlert(),
                  },
                  {
                    text: t('settings.account.deleteAccount.iUnderstand'),
                    style: 'destructive',
                    onPress: () => {
                      closeAlert();
                      // Add delay before executing delete to ensure modal closes
                      setTimeout(() => {
                        confirmDeleteAccount();
                      }, 100);
                    },
                  },
                ],
                'warning',
                '#EF4444',
              );
            }, 100);
          },
        },
      ],
      'trash',
      '#EF4444',
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      // Show loading state
      showAlert(
        t('settings.account.deleteAccount.deleting'),
        t('settings.account.deleteAccount.deletingMessage'),
        [],
        'hourglass',
        '#6B7280',
      );

      // Clear local storage first
      await AsyncStorage.multiRemove([
        'isFirstTime',
        'tutorialCompleted',
        'onboardingCompleted',
        'convexUser',
        'notifications',
        'darkMode',
        'sound',
        'vibration',
        'dailyReminders',
        'weeklyReports',
        'partnerUpdates',
      ]);

      // Delete from database
      await deleteAccountMutation({ clerkId: user.id });

      // Delete from Clerk
      await user.delete();

      // Sign out
      await signOut();

      // Reset onboarding flags
      await AsyncStorage.setItem('isFirstTime', 'true');
      await AsyncStorage.setItem('tutorialCompleted', 'false');

      // Close loading modal and show success
      closeAlert();

      setTimeout(() => {
        showAlert(
          t('settings.account.deleteAccount.deleted'),
          t('settings.account.deleteAccount.deletedMessage'),
          [
            {
              text: 'OK',
              onPress: () => {
                closeAlert();
                // Navigate to tutorial
                router.replace('/(auth)/(tutorial)/');
              },
            },
          ],
          'checkmark-circle',
          '#10B981',
        );
      }, 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      closeAlert();

      setTimeout(() => {
        showAlert(
          t('settings.account.deleteAccount.error'),
          t('settings.account.deleteAccount.errorMessage'),
          [
            {
              text: 'OK',
              onPress: () => closeAlert(),
            },
          ],
          'alert-circle',
          '#EF4444',
        );
      }, 100);
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
          backgroundColor: 'transparent',
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
    <View className="mx-5 mb-0 mt-6">
      <BlurView
        intensity={20}
        tint={isDarkMode ? 'dark' : 'light'}
        className="overflow-hidden border"
        style={{
          borderColor: theme.colors.cardBorder,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <LinearGradient
          colors={
            gradientColors.map((color) => `${color}50`) as [
              import('react-native').ColorValue,
              import('react-native').ColorValue,
            ]
          } // 20% opacity in hex
          className="px-7 py-5"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-8 h-8 rounded-xl justify-center items-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons
                name={icon as any}
                size={18}
                color={theme.colors.text.primary}
              />
            </View>
            <Text
              className="text-base font-bold font-mainRegular"
              style={{ color: theme.colors.text.primary }}
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
        tint={isDarkMode ? 'dark' : 'light'}
        className="overflow-hidden border"
        style={{
          borderColor: theme.colors.cardBorder,
          backgroundColor: theme.colors.cardBackground,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderTopWidth: 0,
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
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <LinearGradient colors={theme.colors.background} className="flex-1">
        <SafeAreaView className="flex-1">
          {/* Header with Glassmorphism */}
          <BlurView
            intensity={30}
            tint={isDarkMode ? 'dark' : 'light'}
            className="border-b border-opacity-20"
            style={{ borderBottomColor: theme.colors.cardBorder }}
          >
            <View className="flex-row items-center px-6 py-4 gap-4">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Tabs', { screen: 'profile' })
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
                  {t('settings.title')}
                </Text>
                <Text
                  className="text-sm font-mainRegular mt-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {t('settings.subtitle')}
                </Text>
              </View>
            </View>
          </BlurView>

          <ScrollView
            className="flex-1 pt-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Notifications Section */}
            <SectionHeader
              title={t('settings.notifications.section')}
              icon="notifications"
              gradientColors={['#3B82F6', '#1D4ED8']}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.notifications.pushNotifications.title')}
                subtitle={t(
                  'settings.notifications.pushNotifications.subtitle',
                )}
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
                    thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
              />
              <SettingItem
                title={t('settings.notifications.dailyReminders.title')}
                subtitle={t('settings.notifications.dailyReminders.subtitle')}
                icon="alarm"
                iconColor="#10B981"
                rightElement={
                  <Switch
                    value={dailyReminders}
                    onValueChange={handleDailyRemindersToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#10B981',
                    }}
                    thumbColor={dailyReminders ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
              />
              <SettingItem
                title={t('settings.notifications.weeklyReports.title')}
                subtitle={t('settings.notifications.weeklyReports.subtitle')}
                icon="stats-chart"
                iconColor="#8B5CF6"
                rightElement={
                  <Switch
                    value={weeklyReports}
                    onValueChange={handleWeeklyReportsToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#8B5CF6',
                    }}
                    thumbColor={weeklyReports ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
              />
              <SettingItem
                title={t('settings.notifications.partnerUpdates.title')}
                subtitle={t('settings.notifications.partnerUpdates.subtitle')}
                icon="people"
                iconColor="#F59E0B"
                rightElement={
                  <Switch
                    value={partnerUpdates}
                    onValueChange={handlePartnerUpdatesToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#F59E0B',
                    }}
                    thumbColor={partnerUpdates ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
                isLast
              />
            </SettingCard>

            <SectionHeader
              title={t('settings.language.section')}
              icon="globe"
              gradientColors={['#8B5CF6', '#7C3AED']}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.language.title')}
                subtitle={`${LANGUAGES.find((l) => l.code === currentLanguage)?.flag} ${LANGUAGES.find((l) => l.code === currentLanguage)?.name}`}
                icon="language"
                iconColor="#8B5CF6"
                onPress={handleLanguageChange}
                isLast
              />
            </SettingCard>

            {/* Experience Section */}
            <SectionHeader
              title={t('settings.experience.section')}
              icon="color-palette"
              gradientColors={[theme.colors.primary, theme.colors.primaryLight]}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.experience.darkMode.title')}
                subtitle={t('settings.experience.darkMode.subtitle')}
                icon="moon"
                iconColor="#6B7280"
                rightElement={
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleDarkModeToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#6B7280',
                    }}
                    thumbColor={isDarkMode ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
              />
              <SettingItem
                title={t('settings.experience.sound.title')}
                subtitle={t('settings.experience.sound.subtitle')}
                icon="volume-high"
                iconColor="#EF4444"
                rightElement={
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleSoundToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#EF4444',
                    }}
                    thumbColor={soundEnabled ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
              />
              <SettingItem
                title={t('settings.experience.haptic.title')}
                subtitle={t('settings.experience.haptic.subtitle')}
                icon="phone-portrait"
                iconColor="#06B6D4"
                rightElement={
                  <Switch
                    value={vibrationEnabled}
                    onValueChange={handleVibrationToggle}
                    trackColor={{
                      false: theme.colors.text.tertiary,
                      true: '#06B6D4',
                    }}
                    thumbColor={vibrationEnabled ? '#FFFFFF' : '#9CA3AF'}
                  />
                }
                isLast
              />
            </SettingCard>

            {/* Community & Support Section */}
            <SectionHeader
              title={t('settings.community.section')}
              icon="heart"
              gradientColors={['#8B5CF6', '#7C3AED']}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.community.share.title')}
                subtitle={t('settings.community.share.subtitle')}
                icon="share"
                iconColor="#3B82F6"
                onPress={handleShareApp}
              />
              <SettingItem
                title={t('settings.community.rate.title')}
                subtitle={t('settings.community.rate.subtitle')}
                icon="star"
                iconColor="#F59E0B"
                onPress={handleRateApp}
              />
              <SettingItem
                title={t('settings.community.support.title')}
                subtitle={t('settings.community.support.subtitle')}
                icon="help-circle"
                iconColor="#10B981"
                onPress={handleContactSupport}
                isLast
              />
            </SettingCard>

            {/* Legal & Privacy Section */}
            <SectionHeader
              title={t('settings.privacy.section')}
              icon="shield-checkmark"
              gradientColors={['#059669', '#047857']}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.privacy.privacyPolicy.title')}
                subtitle={t('settings.privacy.privacyPolicy.subtitle')}
                icon="shield-checkmark"
                iconColor="#8B5CF6"
                onPress={handlePrivacyPolicy}
              />
              <SettingItem
                title={t('settings.privacy.termsOfService.title')}
                subtitle={t('settings.privacy.termsOfService.subtitle')}
                icon="document-text"
                iconColor="#6B7280"
                onPress={handleTermsOfService}
              />
              <SettingItem
                title={t('settings.privacy.dataExport.title')}
                subtitle={t('settings.privacy.dataExport.subtitle')}
                icon="download"
                iconColor="#059669"
                onPress={handleDataExport}
                isLast
              />
            </SettingCard>

            {/* Account Section */}
            <SectionHeader
              title={t('settings.account.section')}
              icon="person"
              gradientColors={['#EF4444', '#DC2626']}
              textColor="#FFFFFF"
            />
            <SettingCard>
              <SettingItem
                title={t('settings.account.deleteAccount.title')}
                subtitle={t('settings.account.deleteAccount.subtitle')}
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
                  {t('settings.appInfo.version')}
                </Text>
              </View>
              <Text
                className="text-xs font-mainRegular text-center"
                style={{ color: theme.colors.text.tertiary }}
              >
                {t('settings.appInfo.tagline')}
              </Text>
              <Text
                className="text-xs font-mainRegular"
                style={{ color: theme.colors.text.tertiary }}
              >
                {t('settings.appInfo.copyright')}
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
