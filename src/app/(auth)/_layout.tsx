// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // This <Stack /> will automatically render whatever is inside `app/(auth)/…`
  return <Stack screenOptions={{ headerShown: false }} />;
}
