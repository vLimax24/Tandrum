// src/components/LoadingScreen.tsx
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <View
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            backgroundColor: "rgba(87, 182, 134, 0.04)",
            top: -150,
            right: -150,
          }}
        />
        <View
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            backgroundColor: "rgba(139, 92, 246, 0.03)",
            bottom: -100,
            left: -100,
          }}
        />
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-8">
          {/* Hero Icon */}
          <View
            className="relative items-center justify-center mb-6"
            style={{ width: 120, height: 120 }}
          >
            <View
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                backgroundColor: "rgba(87, 182, 134, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(87, 182, 134, 0.2)",
              }}
            />
            <LinearGradient
              colors={["#57b686", "#4ade80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#57b686",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={36} color="white" />
            </LinearGradient>
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-2 font-mainRegular">
            Setting up your account...
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8 font-mainRegular">
            Please wait while we prepare your personalized experience
          </Text>

          <ActivityIndicator size="large" color="#57b686" />
        </View>
      </View>
    </SafeAreaView>
  );
}
