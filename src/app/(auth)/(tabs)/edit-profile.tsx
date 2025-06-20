// src/app/(auth)/(tabs)/edit-profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { api } from 'convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { avatarOptions } from '@/utils/avatarImages';
import { useTheme } from '@/contexts/themeContext';
import { createTheme } from '@/utils/theme';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';
import { AlertModal } from '@/components/Modals/AlertModal';

const { width } = Dimensions.get('window');
const avatarSize = (width - 80) / 3 - 12;

export default function EditProfileScreen() {
  // Theme integration
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = createTheme(isDarkMode);

  // Updated state and tracking for changes
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{
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

  // Track original values to detect changes
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [originalAvatar, setOriginalAvatar] = useState<number | null>(null);

  const router = useRouter();
  const { user } = useUser();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnims = React.useRef(
    avatarOptions.map(() => new Animated.Value(1)),
  ).current;

  const updateUser = useMutation(api.users.updateUserInfo);
  const checkUsername = useQuery(
    api.users.checkUsernameAvailability,
    username.length >= 3 ? { username, excludeClerkId: user?.id } : 'skip',
  );

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : 'skip',
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Initialize form with current user data
  useEffect(() => {
    if (convexUser) {
      const currentUsername = convexUser.name || '';
      const currentBio = convexUser.bio || '';

      setUsername(currentUsername);
      setBio(currentBio);
      setOriginalUsername(currentUsername);
      setOriginalBio(currentBio);

      // Find current avatar
      const currentAvatarKey = convexUser.avatar;
      const currentAvatar = avatarOptions.find(
        (a) => a.key === currentAvatarKey,
      );
      if (currentAvatar) {
        setSelectedAvatar(currentAvatar.id);
        setOriginalAvatar(currentAvatar.id);
      }
    }
  }, [convexUser]);

  // Username validation
  useEffect(() => {
    if (username.length === 0) {
      setUsernameError('');
      setIsUsernameValid(true);
      return;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setIsUsernameValid(false);
      return;
    }

    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      setIsUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        'Username can only contain letters, numbers, and underscores',
      );
      setIsUsernameValid(false);
      return;
    }

    if (checkUsername !== undefined) {
      if (!checkUsername.available) {
        setUsernameError('Username is already taken');
        setIsUsernameValid(false);
      } else {
        setUsernameError('');
        setIsUsernameValid(true);
      }
    }
  }, [username, checkUsername]);

  const hasChanges =
    username.trim() !== originalUsername ||
    bio !== originalBio ||
    selectedAvatar !== originalAvatar;

  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatar(avatarId);

    // Animate the selected avatar
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: avatarOptions[index].id === avatarId ? 1.1 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    });
  };

  const handleSave = async () => {
    if (!user || !isUsernameValid || !username.trim() || !hasChanges) return;

    setIsLoading(true);
    try {
      const selectedAvatarKey = selectedAvatar
        ? avatarOptions.find((a) => a.id === selectedAvatar)?.key || 'avatar_1'
        : convexUser?.avatar || 'avatar_1';

      await updateUser({
        clerkId: user.id,
        name: username.trim(),
        profileImage: selectedAvatarKey,
        bio: bio.trim(),
      });

      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Your profile has been updated successfully!',
        icon: 'checkmark-circle',
        iconColor: theme.colors.primary,
        buttons: [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Tabs', { screen: 'profile' }),
            style: 'default',
          },
        ],
      });
    } catch (error) {
      // Updated to use custom AlertModal instead of native Alert
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        icon: 'alert-circle',
        iconColor: '#ef4444',
        buttons: [
          {
            text: 'OK',
            style: 'default',
          },
        ],
      });
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSave =
    username.trim().length >= 3 && isUsernameValid && !isLoading && hasChanges;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background[0] }}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <LinearGradient colors={theme.colors.background} className="flex-1">
        {/* Enhanced Header with Glassmorphism */}
        <SafeAreaView className="relative">
          <BlurView
            intensity={30}
            tint={isDarkMode ? 'dark' : 'light'}
            className="border-b border-opacity-20"
            style={{ borderBottomColor: theme.colors.cardBorder }}
          >
            <View className="flex-row items-center justify-between px-6 py-4">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Tabs', { screen: 'profile' })
                }
                className="w-11 h-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.colors.glass }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>

              <View className="items-center">
                <Text
                  className="text-xl font-bold font-mainRegular"
                  style={{ color: theme.colors.text.primary }}
                >
                  Edit Profile
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!canSave}
                  className="px-5 py-2.5 rounded-2xl flex-row items-center gap-2"
                  style={{
                    backgroundColor: canSave
                      ? theme.colors.primary
                      : theme.colors.glass,
                    opacity: canSave ? 1 : 0.6,
                  }}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={canSave ? 'white' : theme.colors.text.tertiary}
                      />
                      <Text
                        className="font-semibold font-mainRegular"
                        style={{
                          color: canSave ? 'white' : theme.colors.text.tertiary,
                        }}
                      >
                        Save
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </SafeAreaView>

        <Animated.ScrollView
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 75 }}
        >
          {/* Profile Picture Section */}
          <View className="mx-6 mt-6">
            <BlurView
              intensity={60}
              tint={isDarkMode ? 'dark' : 'light'}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              {/* Section Header */}
              <View className="px-6 py-5">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-2xl justify-center items-center"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Ionicons name="person-circle" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Avatar Selection
                    </Text>
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Choose your visual identity
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-6 pb-6">
                {/* Current Avatar Preview */}
                {selectedAvatar && (
                  <View className="items-center mb-8">
                    <View
                      className="w-24 h-24 rounded-3xl p-1 mb-4"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Image
                        source={
                          avatarOptions.find((a) => a.id === selectedAvatar)
                            ?.source
                        }
                        className="w-full h-full rounded-[17]"
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      className="text-base font-semibold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {avatarOptions.find((a) => a.id === selectedAvatar)?.name}{' '}
                      Avatar
                    </Text>
                  </View>
                )}

                {/* Avatar Grid */}
                <View className="flex-row flex-wrap justify-between">
                  {avatarOptions.map((avatar, index) => (
                    <Animated.View
                      key={avatar.id}
                      style={{
                        transform: [{ scale: scaleAnims[index] }],
                      }}
                      className="mb-4"
                    >
                      <TouchableOpacity
                        onPress={() => handleAvatarSelect(avatar.id)}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          width: avatarSize,
                          height: avatarSize,
                          borderWidth: 2,
                          borderColor:
                            selectedAvatar === avatar.id
                              ? theme.colors.primary
                              : theme.colors.cardBorder,
                        }}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={avatar.source}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />

                        {/* Selection Indicator */}
                        {selectedAvatar === avatar.id && (
                          <View
                            className="absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="white"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </BlurView>
          </View>

          {/* Username Section */}
          <View className="mx-6 mt-4">
            <BlurView
              intensity={60}
              tint={isDarkMode ? 'dark' : 'light'}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              {/* Section Header */}
              <View className="px-6 py-5">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-2xl justify-center items-center"
                    style={{ backgroundColor: theme.colors.primaryLight }}
                  >
                    <Ionicons name="at" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Username
                    </Text>
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Your unique tandrum identity
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-6 pb-6">
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={theme.colors.text.tertiary}
                  className="rounded-2xl px-4 py-4 font-mainRegular text-base"
                  style={{
                    backgroundColor: theme.colors.glass,
                    borderWidth: 2,
                    borderColor: usernameError
                      ? '#ef4444'
                      : isUsernameValid && username.length > 0
                        ? theme.colors.primary
                        : theme.colors.cardBorder,
                    color: theme.colors.text.primary,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {usernameError ? (
                  <View className="flex-row items-center gap-2 mt-3">
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text className="text-red-500 font-mainRegular text-sm flex-1">
                      {usernameError}
                    </Text>
                  </View>
                ) : isUsernameValid && username.length > 0 ? (
                  <View className="flex-row items-center gap-2 mt-3">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      className="font-mainRegular text-sm flex-1"
                      style={{ color: theme.colors.primary }}
                    >
                      Username is available
                    </Text>
                  </View>
                ) : null}

                <Text
                  className="font-mainRegular text-xs mt-2"
                  style={{ color: theme.colors.text.tertiary }}
                >
                  3-20 characters, letters, numbers and underscores only
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Bio Section */}
          <View className="mx-6 mt-4">
            <BlurView
              intensity={60}
              tint={isDarkMode ? 'dark' : 'light'}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              {/* Section Header */}
              <View className="px-6 py-5">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-2xl justify-center items-center"
                    style={{ backgroundColor: '#8b5cf6' }}
                  >
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={18}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-lg font-bold font-mainRegular"
                        style={{ color: theme.colors.text.primary }}
                      >
                        Bio
                      </Text>
                      <Text
                        className="text-sm font-mainRegular px-2 py-1 rounded-full"
                        style={{
                          color: theme.colors.text.tertiary,
                          backgroundColor: theme.colors.glass,
                        }}
                      >
                        Optional
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Share your story with the community
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-6 pb-6">
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others about yourself, your goals, or what motivates you..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  className="rounded-2xl px-4 py-4 font-mainRegular text-base"
                  style={{
                    backgroundColor: theme.colors.glass,
                    borderWidth: 2,
                    borderColor: theme.colors.cardBorder,
                    color: theme.colors.text.primary,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />

                <View className="flex-row justify-between items-center mt-3">
                  <Text
                    className="font-mainRegular text-xs flex-1 mr-4"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    Help others connect with you through shared interests and
                    goals
                  </Text>
                  <Text
                    className="font-mainRegular text-xs"
                    style={{ color: theme.colors.text.tertiary }}
                  >
                    {bio.length}/200
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Account Info Section */}
          <View className="mx-6 mt-4">
            <BlurView
              intensity={60}
              tint={isDarkMode ? 'dark' : 'light'}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
              }}
            >
              {/* Section Header */}
              <View className="px-6 py-5">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-2xl justify-center items-center"
                    style={{ backgroundColor: '#64748b' }}
                  >
                    <Ionicons name="shield-checkmark" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold font-mainRegular"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Account Information
                    </Text>
                    <Text
                      className="text-sm font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Your tandrum journey details
                    </Text>
                  </View>
                </View>
              </View>

              <View className="px-6 pb-6 gap-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="mail"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                    <Text
                      className="font-medium font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Email
                    </Text>
                  </View>
                  <Text
                    className="font-semibold font-mainRegular flex-1 text-right"
                    style={{ color: theme.colors.text.primary }}
                    numberOfLines={1}
                  >
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>

                <View
                  className="h-px"
                  style={{ backgroundColor: theme.colors.cardBorder }}
                />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                    <Text
                      className="font-medium font-mainRegular"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Member Since
                    </Text>
                  </View>
                  <Text
                    className="font-semibold font-mainRegular"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {convexUser
                      ? new Date(convexUser.joined_at).toLocaleDateString()
                      : '—'}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Motivational Footer */}
          <View className="mx-6 mt-6 mb-4">
            <View
              className="rounded-3xl p-6"
              style={{ backgroundColor: theme.colors.glass }}
            >
              <View className="flex-row items-center gap-3 mb-3">
                <Ionicons
                  name="people"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  className="text-lg font-bold font-mainRegular flex-1"
                  style={{ color: theme.colors.text.primary }}
                >
                  Building Habits Together
                </Text>
              </View>
              <Text
                className="font-mainRegular text-base leading-6"
                style={{ color: theme.colors.text.secondary }}
              >
                Your profile helps connect you with like-minded habit builders.
                Share your journey and inspire others in the tandrum community!
                🚀
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      </LinearGradient>

      {/* Custom Alert Modal */}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
