// src/app/(auth)/(tabs)/edit-profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { avatarOptions } from "@/utils/avatarImages";

const { width } = Dimensions.get("window");
const avatarSize = (width - 80) / 3 - 12;

export default function EditProfileScreen() {
  // Updated state and tracking for changes
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  // Track original values to detect changes
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState<number | null>(null);

  const router = useRouter();
  const { user } = useUser();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnims = React.useRef(
    avatarOptions.map(() => new Animated.Value(1))
  ).current;

  const updateUser = useMutation(api.users.updateUserInfo);
  const checkUsername = useQuery(
    api.users.checkUsernameAvailability,
    username.length >= 3 ? { username, excludeClerkId: user?.id } : "skip"
  );

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
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
      const currentUsername = convexUser.name || "";
      const currentBio = convexUser.bio || "";

      setUsername(currentUsername);
      setBio(currentBio);
      setOriginalUsername(currentUsername);
      setOriginalBio(currentBio);

      // Find current avatar
      const currentAvatarKey = convexUser.avatar;
      const currentAvatar = avatarOptions.find(
        (a) => a.key === currentAvatarKey
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
      setUsernameError("");
      setIsUsernameValid(true);
      return;
    }

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      setIsUsernameValid(false);
      return;
    }

    if (username.length > 20) {
      setUsernameError("Username must be less than 20 characters");
      setIsUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      setIsUsernameValid(false);
      return;
    }

    if (checkUsername !== undefined) {
      if (!checkUsername.available) {
        setUsernameError("Username is already taken");
        setIsUsernameValid(false);
      } else {
        setUsernameError("");
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
        ? avatarOptions.find((a) => a.id === selectedAvatar)?.key || "avatar_1"
        : convexUser?.avatar || "avatar_1";

      await updateUser({
        clerkId: user.id,
        name: username.trim(),
        profileImage: selectedAvatarKey,
        bio: bio.trim(), // Add bio to the update
      });

      Alert.alert("Success", "Your profile has been updated successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(auth)/(tabs)/profile"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSave =
    username.trim().length >= 3 && isUsernameValid && !isLoading && hasChanges;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={["#ffffff", "#f8fafc"]}
        className="border-b border-gray-200"
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/(tabs)/profile")}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 font-mainRegular">
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            className={`px-4 py-2 rounded-full ${
              canSave ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`font-semibold font-mainRegular ${
                  canSave ? "text-white" : "text-gray-500"
                }`}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Picture Section */}
        <View className="bg-white mx-6 mt-6 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-blue-50 px-6 py-4 border-b border-blue-100 rounded-t-2xl">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center mr-3">
                <Ionicons name="camera" size={16} color="white" />
              </View>
              <Text className="text-blue-800 font-mainRegular text-lg font-bold">
                Profile Picture
              </Text>
            </View>
          </View>

          <View className="p-6">
            {/* Current Avatar Preview */}
            {selectedAvatar && (
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full border-3 border-blue-500 p-1 mb-3">
                  <Image
                    source={
                      avatarOptions.find((a) => a.id === selectedAvatar)?.source
                    }
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                </View>
                <Text className="text-base font-mainRegular font-semibold text-gray-800">
                  {avatarOptions.find((a) => a.id === selectedAvatar)?.name}{" "}
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
                    style={[
                      {
                        borderRadius: 12,
                        overflow: "hidden",
                        width: avatarSize,
                        height: avatarSize,
                      },
                      selectedAvatar === avatar.id
                        ? {
                            borderWidth: 2,
                            borderColor: "#3b82f6",
                          }
                        : {
                            borderWidth: 2,
                            borderColor: "#e5e7eb",
                          },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={avatar.source}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />

                    {/* Selection Indicator */}
                    {selectedAvatar === avatar.id && (
                      <View className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>

        {/* Username Section */}
        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-green-50 px-6 py-4 border-b border-green-100 rounded-t-2xl">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-500 rounded-full justify-center items-center mr-3">
                <Ionicons name="person" size={16} color="white" />
              </View>
              <Text className="text-green-800 font-mainRegular text-lg font-bold">
                Username
              </Text>
            </View>
          </View>

          <View className="p-6">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              className={`border-2 rounded-xl px-4 py-3 font-mainRegular text-base ${
                usernameError
                  ? "border-red-300 bg-red-50"
                  : isUsernameValid && username.length > 0
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-white"
              }`}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {usernameError ? (
              <Text className="text-red-600 font-mainRegular text-sm mt-2 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                <Text className="ml-1 font-mainRegular">{usernameError}</Text>
              </Text>
            ) : isUsernameValid && username.length > 0 ? (
              <Text className="text-green-600 font-mainRegular text-sm mt-2 flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text className="ml-1 font-mainRegular">
                  Username is available
                </Text>
              </Text>
            ) : null}

            <Text className="text-gray-500 font-mainRegular text-xs mt-2">
              3-20 characters, letters, numbers and underscores only
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-purple-50 px-6 py-4 border-b border-purple-100 rounded-t-2xl">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-3">
                <Ionicons name="document-text" size={16} color="white" />
              </View>
              <Text className="text-purple-800 text-lg font-bold font-mainRegular">
                Bio
              </Text>
              <Text className="text-purple-600 text-sm ml-2 font-mainRegular">
                (Optional)
              </Text>
            </View>
          </View>

          <View className="p-6">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself..."
              className="border-2 border-gray-300 font-mainRegular rounded-xl px-4 py-3 text-base bg-white"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />

            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-500 font-mainRegular text-xs max-w-[80%]">
                Share your interests, goals, or anything you'd like others to
                know
              </Text>
              <Text className="text-gray-400 font-mainRegular text-xs">
                {bio.length}/200
              </Text>
            </View>
          </View>
        </View>

        {/* Account Info Section */}
        <View className="bg-white mx-6 mt-4 rounded-2xl border border-gray-200 shadow-sm">
          <View className="bg-gray-50 px-6 py-4 border-b border-gray-100 rounded-t-2xl">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-500 rounded-full justify-center items-center mr-3">
                <Ionicons name="information-circle" size={16} color="white" />
              </View>
              <Text className="text-gray-800 font-mainRegular text-lg font-bold">
                Account Information
              </Text>
            </View>
          </View>

          <View className="p-6 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium font-mainRegular">
                Email
              </Text>
              <Text className="text-gray-900 font-semibold font-mainRegular">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>

            <View className="h-px bg-gray-200" />

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium font-mainRegular">
                Member Since
              </Text>
              <Text className="text-gray-900 font-semibold font-mainRegular">
                {convexUser
                  ? new Date(convexUser.joined_at).toLocaleDateString()
                  : "—"}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
