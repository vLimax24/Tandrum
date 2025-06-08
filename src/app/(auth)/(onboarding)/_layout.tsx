// src/app/(auth)/(onboarding)/_layout.tsx
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="username" />
      <Stack.Screen name="avatar" />
    </Stack>
  );
}
