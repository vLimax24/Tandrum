import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
  const { user, isLoaded } = useUser();
  const { signOut, isSignedIn } = useAuth();
  const router = useRouter();

  // Only run the query if user exists and has an id
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Use useFocusEffect to check auth state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure navigation is ready
      const checkAuth = () => {
        if (isLoaded && (!user || !isSignedIn)) {
          try {
            router.replace("/(public)/login");
          } catch (error) {
            // Retry after a short delay
            setTimeout(checkAuth, 100);
          }
        }
      };

      checkAuth();
    }, [user, isSignedIn, isLoaded, router])
  );

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
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all AsyncStorage data first
              await AsyncStorage.multiRemove([
                "isFirstTime",
                "tutorialCompleted",
                "onboardingCompleted",
                "convexUser",
              ]);

              // Sign out from Clerk
              await signOut();

              // The useFocusEffect will handle navigation when auth state changes
              // This prevents navigation timing issues
            } catch (error) {
              console.error("Sign out error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push("/(auth)/(tabs)/edit-profile");
  };

  const handleSettings = () => {
    router.push("(auth)/settings");
  };

  const formatJoinDate = (date) => {
    const joinDate = new Date(date);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(joinDate.getTime())) {
      return "Recently joined";
    }

    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "1 day ago";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#dbeafe"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section with Gradient Background */}
        <View className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 pt-16 pb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white opacity-20" />
            <View className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white opacity-15" />
            <View className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white opacity-10" />
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={handleSettings}
            className="absolute top-16 right-6 w-10 h-10 bg-white bg-opacity-20 rounded-full justify-center items-center border border-white border-opacity-30"
          >
            <Text className="text-white text-lg">⚙️</Text>
          </TouchableOpacity>

          {/* Profile Header */}
          <View className="items-center">
            <View className="relative mb-6">
              <Image
                source={{ uri: user.imageUrl }}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
              />
              <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white justify-center items-center">
                <View className="w-3 h-3 bg-white rounded-full" />
              </View>
            </View>

            <Text className="text-[#303030] text-2xl font-bold mb-1">
              {convexUser.name}
            </Text>
            <Text className="text-[#303030] text-base mb-4">
              {user.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-6 py-6 flex-col gap-3">
          {/* Account Information Card */}
          <View className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <View className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center mr-3">
                  <Text className="text-white text-sm font-bold">👤</Text>
                </View>
                <Text className="text-blue-800 text-lg font-bold flex-1">
                  Account Information
                </Text>
                <View className="bg-blue-500 px-2 py-1 rounded-lg">
                  <Text className="text-white text-xs font-bold">VERIFIED</Text>
                </View>
              </View>
            </View>

            <View className="p-6 space-y-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 text-sm font-medium">
                  Member Since
                </Text>
                <View className="items-end">
                  <Text className="text-gray-900 text-base font-semibold">
                    {new Date(convexUser.joined_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {formatJoinDate(convexUser.joined_at.toString())}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 text-sm font-medium">
                  Account Status
                </Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-600 text-sm font-semibold">
                    Active
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferences Card */}
          <View className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <View className="bg-purple-50 px-6 py-4 border-b border-purple-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-3">
                  <Text className="text-white text-sm font-bold">⚙️</Text>
                </View>
                <Text className="text-purple-800 text-lg font-bold">
                  Preferences
                </Text>
              </View>
            </View>

            <View className="p-6 space-y-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 text-sm font-medium">
                  Timezone
                </Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {convexUser.timezone}
                </Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600 text-sm font-medium">
                  Language
                </Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {convexUser.language}
                </Text>
              </View>
            </View>
          </View>

          {/* Bio Card (if exists) */}
          {convexUser.bio && (
            <View className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <View className="bg-green-50 px-6 py-4 border-b border-green-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-green-500 rounded-full justify-center items-center mr-3">
                    <Text className="text-white text-sm font-bold">📝</Text>
                  </View>
                  <Text className="text-green-800 text-lg font-bold">
                    About Me
                  </Text>
                </View>
              </View>

              <View className="p-6">
                <Text className="text-gray-700 text-base leading-relaxed">
                  {convexUser.bio}
                </Text>
              </View>
            </View>
          )}

          {/* Quick Actions Card */}
          <View className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <View className="bg-orange-50 px-6 py-4 border-b border-orange-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-500 rounded-full justify-center items-center mr-3">
                  <Text className="text-white text-sm font-bold">⚡</Text>
                </View>
                <Text className="text-orange-800 text-lg font-bold">
                  Quick Actions
                </Text>
              </View>
            </View>

            <View className="p-6">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleEditProfile}
                  className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl py-4 px-4 items-center"
                >
                  <Text className="text-blue-600 text-base font-semibold mb-1">
                    Edit Profile
                  </Text>
                  <Text className="text-blue-500 text-xs text-center">
                    Update your information
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSettings}
                  className="flex-1 bg-purple-50 border border-purple-200 rounded-2xl py-4 px-4 items-center"
                >
                  <Text className="text-purple-600 text-base font-semibold mb-1">
                    Settings
                  </Text>
                  <Text className="text-purple-500 text-xs text-center">
                    Manage preferences
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Out Section */}
          <View className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">
            <View className="p-6">
              <TouchableOpacity
                onPress={handleSignOut}
                className="bg-red-500 rounded-2xl py-4 px-6 shadow-lg flex-row items-center justify-center"
                style={{
                  shadowColor: "#dc2626",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-white text-base font-semibold mr-2">
                  Sign Out
                </Text>
              </TouchableOpacity>

              <Text className="text-gray-500 text-xs text-center mt-3">
                You can always sign back in with your credentials
              </Text>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Profile;
