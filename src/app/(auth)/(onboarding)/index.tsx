// src/app/(auth)/(onboarding)/index.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  const handleGetStarted = () => {
    router.push("/(auth)/(onboarding)/username");
  };

  return (
    <View className="flex-1 bg-[#fafbfc]">
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Subtle background pattern */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={["rgba(16, 185, 129, 0.02)", "rgba(6, 182, 212, 0.01)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        {/* Subtle accent orbs */}
        <View
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            backgroundColor: "rgba(16, 185, 129, 0.03)",
            top: height * 0.15,
            right: -60,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            backgroundColor: "rgba(6, 182, 212, 0.03)",
            bottom: height * 0.25,
            left: -40,
          }}
        />
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-6 relative z-10">
        {/* Hero section with clean card design */}
        <View
          className="items-center mb-8 rounded-2xl p-8 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 8,
            width: width - 48,
          }}
        >
          {/* Clean icon container */}
          <View className="items-center mb-8">
            <View
              className="bg-primary rounded-2xl p-6"
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Image
                source={require("@/assets/tree-1.png")}
                style={{ width: 64, height: 64, resizeMode: "contain" }}
              />
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-3 tracking-tight">
            Willkommen{user?.firstName ? `, ${user.firstName}` : ""}!
          </Text>

          <Text className="text-base text-gray-600 text-center leading-6 mb-8 font-medium">
            Lass uns dein Profil einrichten, damit du mit deinem Lernpartner
            durchstarten kannst.
          </Text>

          {/* Clean feature highlights */}
          <View className="w-full space-y-3">
            {[
              {
                icon: "👤",
                title: "Persönliches Profil",
                description: "Wähle deinen Namen und Avatar",
              },
              {
                icon: "🤝",
                title: "Duo Learning",
                description: "Lerne gemeinsam mit einem Partner",
              },
              {
                icon: "🌱",
                title: "Fortschritt verfolgen",
                description: "Sieh dein Wachstum in Echtzeit",
              },
            ].map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 rounded-xl bg-[#f9f9f9]"
              >
                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4 shadow-sm">
                  <Text className="text-lg">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Clean bottom action */}
      <View className="pb-12 px-6 relative z-10">
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 px-6 active:scale-98"
          activeOpacity={0.9}
          onPress={handleGetStarted}
          style={{
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-white font-semibold text-base text-center tracking-wide">
            Los geht's
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-sm mt-4">
          Nur noch 2 schnelle Schritte
        </Text>
      </View>
    </View>
  );
}
