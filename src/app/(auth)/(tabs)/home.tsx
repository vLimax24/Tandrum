import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-expo';
import { api } from '../../../../convex/_generated/api';
import { getLevelData } from '@/utils/level';
import { LinearGradient } from 'expo-linear-gradient';
import LevelDisplay from '@/components/LevelDisplay';
import { useDuo } from '@/hooks/useDuo';
import { NewDuoModal } from '@/components/Modals/NewDuoModal';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { images } from '@/utils/images';
import { createTheme } from '@/utils/theme';
import { useTheme } from '@/contexts/themeContext';
import LoadingState from '@/components/LoadingState';
import { useNavigation } from '@react-navigation/native';
import type { TabParamList } from '@/types/navigation';
import type { NavigationProp } from '@react-navigation/native';
import { AlertModal } from '@/components/Modals/AlertModal';
import { useI18n, SupportedLanguage } from '@/contexts/i18nContext';

const Page = () => {
  const { user } = useUser();
  const clerkId = user?.id;
  const { language, setLanguage, t } = useI18n();

  const navigation = useNavigation<NavigationProp<TabParamList>>();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : 'skip',
  );
  const isUserInConnection = useQuery(
    api.duoConnections.isUserInConnection,
    convexUser ? { userId: convexUser._id } : 'skip',
  );

  const userConnections = useQuery(
    api.duoConnections.getConnectionsForUser,
    convexUser ? { userId: convexUser._id } : 'skip',
  );

  const [modalVisible, setModalVisible] = useState(false);

  const incomingInvite = useQuery(
    api.duoInvites.getIncomingInvite,
    convexUser ? { userId: convexUser._id } : 'skip',
  );

  const acceptInvite = useMutation(api.duoInvites.respondToInvite);
  const { setSelectedIndex } = useDuo();

  const { isDarkMode, toggleTheme } = useTheme();

  const theme = createTheme(isDarkMode);

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

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    icon?: keyof typeof Ionicons.glyphMap,
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

  useEffect(() => {
    if (incomingInvite) {
      showAlert(
        t('home.invites.title'),
        t('home.invites.message'),
        [
          {
            text: t('home.invites.reject'),
            style: 'destructive',
            onPress: () =>
              acceptInvite({ inviteId: incomingInvite._id, accept: false }),
          },
          {
            text: t('home.invites.accept'),
            onPress: () =>
              acceptInvite({ inviteId: incomingInvite._id, accept: true }),
          },
        ],
        'mail',
        theme.colors.primary,
      );
    }
  }, [incomingInvite, t]);

  if (!convexUser || isUserInConnection === undefined) {
    return <LoadingState screen="home" />;
  }

  // Calculate summary stats
  const totalTrustScore =
    userConnections?.reduce((sum, conn) => sum + (conn.trust_score || 0), 0) ||
    0;
  const totalStreak =
    userConnections?.reduce((sum, conn) => sum + (conn.streak || 0), 0) || 0;
  const avgLevel = userConnections?.length
    ? Math.floor(
        userConnections.reduce(
          (sum, conn) => sum + getLevelData(conn.trust_score).level,
          0,
        ) / userConnections.length,
      )
    : 0;
  const activeDuos = userConnections?.length || 0;

  const handleStartPartnership = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  // Stat Card Component
  const StatCard = ({
    icon,
    value,
    label,
    color,
    bgColor,
    iconColor,
    iconName,
    chipname,
  }) => (
    <BlurView
      intensity={35}
      tint={isDarkMode ? 'dark' : 'light'}
      className="flex-1 min-w-[45%] aspect-square rounded-3xl overflow-hidden"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 rounded-3xl p-5 border"
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center border"
            style={{
              backgroundColor: bgColor,
              borderColor: `${iconColor}30`,
            }}
          >
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>
          <View
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: bgColor,
              borderColor: `${iconColor}30`,
            }}
          >
            <Text
              className="text-xs font-bold tracking-wider"
              style={{
                color: iconColor,
                fontFamily: 'font-mainRegular',
              }}
            >
              {chipname}
            </Text>
          </View>
        </View>
        <Text
          className="text-3xl font-bold mb-1"
          style={{
            color: theme.colors.text.primary,
            fontFamily: 'font-mainRegular',
          }}
        >
          {value}
        </Text>
        <Text
          className="text-sm font-semibold"
          style={{
            color: theme.colors.text.secondary,
            fontFamily: 'font-mainRegular',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <LinearGradient
      colors={theme.colors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90, paddingTop: 40 }}
        >
          {/* Header Section */}
          <View className="px-6 pt-4 pb-8 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-medium"
                  style={{
                    color: theme.colors.text.secondary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.header.welcomeBack')}
                </Text>
                <Text
                  className="text-3xl font-bold"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {convexUser.name || t('home.header.defaultName')}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                {/* Theme Toggle */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  className="w-12 h-12 rounded-2xl items-center justify-center border"
                  style={{
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.cardBorder,
                  }}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={20}
                    tint={isDarkMode ? 'dark' : 'light'}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <Ionicons
                    name={isDarkMode ? 'sunny' : 'moon'}
                    size={20}
                    color={isDarkMode ? '#fbbf24' : theme.colors.text.secondary}
                  />
                </TouchableOpacity>

                {/* Profile Avatar */}
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-12 h-12 items-center justify-center"
                  style={{ borderRadius: 12 }}
                >
                  <Ionicons name="people" size={20} color="white" />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Dashboard Stats Cards */}
          <View className="px-6 mb-8">
            <View className="flex-row flex-wrap justify-between gap-4">
              {/* Active Duos */}
              <StatCard
                icon="users"
                value={activeDuos}
                label={t('home.stats.activeDuos')}
                color="#3B82F6"
                bgColor="rgba(59, 130, 246, 0.15)"
                iconColor="#3B82F6"
                iconName="people"
                chipname={t('home.stats.chips.active')}
              />

              {/* Total Trust Score */}
              <StatCard
                icon="trending"
                value={totalTrustScore}
                label={t('home.stats.totalXP')}
                color={theme.colors.primary}
                bgColor={`${theme.colors.primary}26`}
                iconColor={theme.colors.primary}
                iconName="trending-up"
                chipname={t('home.stats.chips.trust')}
              />

              {/* Combined Streak */}
              <StatCard
                icon="fire"
                value={totalStreak}
                label={t('home.stats.combinedDays')}
                color="#F97316"
                bgColor="rgba(249, 115, 22, 0.15)"
                iconColor="#F97316"
                iconName="flame"
                chipname={t('home.stats.chips.streak')}
              />

              {/* Average Level */}
              <StatCard
                icon="star"
                value={avgLevel}
                label={t('home.stats.avgLevel')}
                color="#8B5CF6"
                bgColor="rgba(139, 92, 246, 0.15)"
                iconColor="#8B5CF6"
                iconName="star"
                chipname={t('home.stats.chips.level')}
              />
            </View>
          </View>

          {/* Active Partnerships Section */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-5">
              <Text
                className="text-xl font-bold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: 'font-mainRegular',
                }}
              >
                {t('home.partnerships.title')}
              </Text>
              {userConnections && userConnections.length > 0 && (
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(16, 185, 129, 0.2)'
                      : '#d1fae5',
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: isDarkMode ? '#34d399' : '#059669',
                      fontFamily: 'font-mainRegular',
                    }}
                  >
                    {t('home.partnerships.activeCount', {
                      count: userConnections.length,
                    })}
                  </Text>
                </View>
              )}
            </View>

            {userConnections && userConnections.length > 0 ? (
              <View className="gap-4">
                {userConnections.map((conn, index) => {
                  return (
                    <TouchableOpacity
                      key={conn._id}
                      activeOpacity={0.8}
                      className="rounded-3xl overflow-hidden border"
                      style={{
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      }}
                      onPress={() => {
                        setSelectedIndex(index);
                        navigation.navigate('tree');
                      }}
                    >
                      <BlurView
                        intensity={20}
                        tint={isDarkMode ? 'dark' : 'light'}
                        className="absolute inset-0 rounded-3xl"
                      />
                      {/* Header Gradient */}
                      <LinearGradient
                        colors={[
                          theme.colors.primary,
                          theme.colors.primaryLight,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-6 py-5"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-white/20">
                              <Text
                                className="text-lg font-bold text-white"
                                style={{
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {conn.partnerName?.charAt(0) || '?'}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-lg font-bold text-white"
                                style={{
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {conn.partnerName}
                              </Text>
                              <Text
                                className="text-sm font-medium text-white/80"
                                style={{
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {t('home.partnerships.partnershipNumber', {
                                  number: index + 1,
                                })}
                              </Text>
                            </View>
                          </View>
                          <View className="w-14 h-14 rounded-2xl items-center justify-center bg-white/10">
                            <Image
                              source={images[conn.treeState]}
                              className="w-8 h-8"
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      </LinearGradient>

                      {/* Content */}
                      <View className="px-6 py-5">
                        {/* Level Progress */}
                        <LevelDisplay
                          duo={conn}
                          showDetailedStats={false}
                          compact={true}
                        />

                        {/* Stats Grid */}
                        <View className="mt-4">
                          {/* Top Row - Day Streak and XP */}
                          <View className="flex-row gap-3 mb-3">
                            {/* Day Streak Card */}
                            <View
                              className="flex-1 items-center py-6 px-4 rounded-2xl"
                              style={{
                                borderWidth: 1,
                                borderColor: theme.colors.cardBorder,
                              }}
                            >
                              <View
                                className="w-14 h-14 rounded-full items-center justify-center mb-4"
                                style={{
                                  backgroundColor: theme.colors.primary + '15',
                                }}
                              >
                                <Ionicons
                                  name="flame"
                                  size={28}
                                  color={theme.colors.primary}
                                />
                              </View>
                              <Text
                                className="font-bold text-3xl mb-2"
                                style={{
                                  color: theme.colors.text.primary,
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {conn.streak || 0}
                              </Text>
                              <Text
                                className="text-sm font-medium text-center"
                                style={{
                                  color: theme.colors.text.tertiary,
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {t('home.partnerships.dayStreak')}
                              </Text>
                            </View>

                            {/* XP Card */}
                            <View
                              className="flex-1 items-center py-6 px-4 rounded-2xl"
                              style={{
                                borderWidth: 1,
                                borderColor: theme.colors.cardBorder,
                              }}
                            >
                              <View
                                className="w-14 h-14 rounded-full items-center justify-center mb-4"
                                style={{
                                  backgroundColor: theme.colors.primary + '15',
                                }}
                              >
                                <Ionicons
                                  name="trending-up"
                                  size={28}
                                  color={theme.colors.primary}
                                />
                              </View>
                              <Text
                                className="font-bold text-3xl mb-2"
                                style={{
                                  color: theme.colors.text.primary,
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {(() => {
                                  const score = conn.trust_score || 0;
                                  if (score >= 100000) {
                                    return `${Math.round(score / 1000)}k`;
                                  }
                                  return score.toLocaleString('de-DE');
                                })()}
                              </Text>
                              <Text
                                className="text-sm font-medium text-center"
                                style={{
                                  color: theme.colors.text.tertiary,
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {t('home.partnerships.experience')}
                              </Text>
                            </View>
                          </View>

                          {/* Bottom Row - Tree Stage (Full Width) */}
                          <View
                            className="flex-row items-center p-6 rounded-2xl"
                            style={{
                              borderWidth: 1,
                              borderColor: theme.colors.cardBorder,
                            }}
                          >
                            <View
                              className="w-16 h-16 rounded-full items-center justify-center mr-5"
                              style={{
                                backgroundColor: theme.colors.primary + '15',
                              }}
                            >
                              <Image
                                source={images[conn.treeState]}
                                className="w-8 h-8"
                                resizeMode="contain"
                              />
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-sm font-medium mb-1"
                                style={{
                                  color: theme.colors.text.tertiary,
                                  fontFamily: 'font-mainRegular',
                                }}
                              >
                                {t('home.partnerships.treeStage')}
                              </Text>
                              <Text
                                className="font-bold text-2xl"
                                style={{
                                  color: theme.colors.text.primary,
                                  fontFamily: 'font-mainRegular',
                                }}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                                minimumFontScale={0.8}
                              >
                                {t(
                                  `home.partnerships.treeLabels.${conn.treeState}`,
                                ) ||
                                  conn.treeState ||
                                  t('home.partnerships.treeLabels.seed')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View
                className="rounded-3xl border p-8 items-center"
                style={{
                  borderColor: theme.colors.cardBorder,
                  backgroundColor: theme.colors.cardBackground,
                }}
              >
                <BlurView
                  intensity={20}
                  tint={isDarkMode ? 'dark' : 'light'}
                  className="absolute inset-0 rounded-3xl"
                />
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(100, 116, 139, 0.2)'
                      : '#f1f5f9',
                  }}
                >
                  <Ionicons
                    size={30}
                    name="leaf"
                    color={theme.colors.primaryLight}
                  />
                </View>
                <Text
                  className="text-xl font-bold text-center mb-2"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.partnerships.emptyState.title')}
                </Text>
                <Text
                  className="text-center text-base leading-6"
                  style={{
                    color: theme.colors.text.secondary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.partnerships.emptyState.subtitle')}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="px-6 gap-3">
            <TouchableOpacity
              onPress={handleStartPartnership}
              activeOpacity={0.8}
              className="overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-5 px-8 items-center justify-center flex-row"
              >
                <View className="w-6 h-6 bg-white/20 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="add" size={16} color="white" />
                </View>
                <Text
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.actions.startNewPartnership')}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="white"
                  className="ml-3"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 rounded-2xl border px-4 py-4 items-center flex-row justify-center"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                }}
                onPress={() => navigation.navigate('tree')}
              >
                <BlurView
                  intensity={20}
                  tint={isDarkMode ? 'dark' : 'light'}
                  className="absolute inset-0 rounded-2xl"
                />
                <Ionicons
                  name="leaf"
                  size={18}
                  color={theme.colors.primary}
                  className="mr-2"
                />
                <Text
                  className="font-semibold text-base"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.actions.viewTrees')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-1 rounded-2xl border px-4 py-4 items-center flex-row justify-center"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                }}
                onPress={() => navigation.navigate('habits')}
              >
                <BlurView
                  intensity={20}
                  tint={isDarkMode ? 'dark' : 'light'}
                  className="absolute inset-0 rounded-2xl"
                />
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#3B82F6"
                  className="mr-2"
                />
                <Text
                  className="font-semibold text-base"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: 'font-mainRegular',
                  }}
                >
                  {t('home.actions.myHabits')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {convexUser && (
        <NewDuoModal
          visible={modalVisible}
          onClose={handleModalClose}
          userId={convexUser._id}
        />
      )}

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

export default Page;
