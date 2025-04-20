import React, { useEffect } from "react";
import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { useSSO, useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Page() {
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const clerkId = user?.id;

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  useEffect(() => {
    const storeConvexUser = async () => {
      if (convexUser) {
        try {
          await AsyncStorage.setItem("convexUser", JSON.stringify(convexUser));
        } catch (e) {
          console.error("Failed to save Convex user to AsyncStorage", e);
        }
      }
    };
    storeConvexUser();
  }, [convexUser]);

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <>
      <View className="flex flex-1 items-center p-5">
        <Image
          source={require("../../assets/Baum-Klein.png")}
          style={{ width: 400, height: 400, resizeMode: "contain" }}
        />
        <TouchableOpacity
          className="bg-primary py-5 w-full items-center rounded-2xl"
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
        >
          <Text className="text-background">Continue with Google</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
    </>
  );
}
