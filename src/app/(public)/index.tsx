import React, { useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useSSO, useUser } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertModal } from '@/components/AlertModal';

export default function AuthPage() {
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const clerkId = user?.id;

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : 'skip',
  );

  const [alertModal, setAlertModal] = useState<{
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

  // Add helper functions for alert modal (add these before handleGoogleLogin)
  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [{ text: 'OK', style: 'default' }],
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap,
    iconColor?: string,
  ) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const storeConvexUser = async () => {
      if (convexUser) {
        try {
          await AsyncStorage.setItem('convexUser', JSON.stringify(convexUser));
        } catch (e) {
          console.error('Failed to save Convex user to AsyncStorage', e);
        }
      }
    };
    storeConvexUser();
  }, [convexUser]);

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        // Set tutorial completion flags to ensure proper flow
        await AsyncStorage.setItem('isFirstTime', 'false');
        await AsyncStorage.setItem('tutorialCompleted', 'true');
      }
    } catch (error) {
      showAlert(
        'Login failed',
        error.message || 'An error occurred during login',
        [{ text: 'OK', style: 'default' }],
        'alert-circle',
        '#ef4444',
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Image
            source={require('../../assets/tree-2.png')}
            style={{ width: 350, height: 350, resizeMode: 'contain' }}
          />
          <Text className="text-3xl font-bold text-gray-800 text-center mb-4 font-mainRegular">
            Welcome Back!
          </Text>
          <Text className="text-lg text-gray-600 text-center font-mainRegular">
            Sign in to continue your learning journey
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary py-4 px-8 w-full max-w-sm items-center rounded-2xl shadow-lg"
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
        >
          <Text className="text-white font-semibold text-lg font-mainRegular">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        icon={alertModal.icon}
        iconColor={alertModal.iconColor}
        onClose={closeAlert}
      />
    </View>
  );
}
