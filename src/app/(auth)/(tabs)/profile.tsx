import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id,
  });

  useEffect(() => {
    if (!user) {
      router.replace("/(public)/login");
    }
  }, [user]);

  if (!user || !convexUser) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(public)");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      <View className="items-center mb-6">
        <Image
          source={{ uri: user.imageUrl }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-xl font-semibold">{user.fullName}</Text>
        <Text className="text-gray-500">
          {user.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-400">Joined</Text>
        <Text className="text-lg">
          {new Date(convexUser.joined_at).toLocaleDateString()}
        </Text>

        <Text className="text-gray-400 mt-4">Timezone</Text>
        <Text className="text-lg">{convexUser.timezone}</Text>

        <Text className="text-gray-400 mt-4">Language</Text>
        <Text className="text-lg">{convexUser.language}</Text>

        {convexUser.bio && (
          <>
            <Text className="text-gray-400 mt-4">Bio</Text>
            <Text className="text-lg">{convexUser.bio}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 py-3 rounded-xl items-center mt-auto"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
