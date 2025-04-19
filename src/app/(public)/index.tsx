import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useSSO } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export default function Page() {
  const { startSSOFlow } = useSSO();
  const data = useQuery(api.users.getAllUser);
  console.log(data);

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      console.log(
        "🚀 ~ handleGoogleLogin ~ createdSessionId:",
        createdSessionId
      );
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (error) {
      console.error(error);
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
