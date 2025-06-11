import "../global.css";
import { useEffect, useState } from "react";
import { SplashScreen, useSegments, useRouter } from "expo-router";
import { Slot } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { tokenCache } from "@/utils/cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { DuoProvider } from "@/hooks/useDuo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { AppState } from "react-native";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

SplashScreen.preventAutoHideAsync();

if (!clerkPublishableKey) {
  throw new Error("CLERK_PUBLISHABLE_KEY is not set");
}

const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { user } = useUser();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<
    boolean | null
  >(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  // Get onboarding status from server
  const onboardingStatus = useQuery(
    api.users.getOnboardingStatus,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );

  // Function to check AsyncStorage values (only for tutorial)
  const checkStorageValues = async () => {
    try {
      const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
      const tutorialCompleted = await AsyncStorage.getItem("tutorialCompleted");

      setIsFirstTime(
        firstTimeValue === null ? true : firstTimeValue === "true"
      );
      setHasCompletedTutorial(tutorialCompleted === "true");
    } catch (error) {
      console.error("Error checking storage:", error);
      setIsFirstTime(true);
      setHasCompletedTutorial(false);
    }
  };

  // Check storage values on initial mount
  useEffect(() => {
    checkStorageValues();
  }, []);

  // Show loading screen immediately when user signs in
  useEffect(() => {
    if (isSignedIn && hasCompletedTutorial && !showLoadingScreen) {
      setShowLoadingScreen(true);
    }
  }, [isSignedIn, hasCompletedTutorial]);

  // Re-check storage when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      checkStorageValues();
    }
  }, [isSignedIn]);

  // Main navigation logic
  useEffect(() => {
    if (!isLoaded || isFirstTime === null || hasCompletedTutorial === null) {
      return;
    }

    const segment0 = segments[0];
    const segment1 = segments.at(1) ?? "";
    const currentPath = segments.join("/");

    const inAuthGroup = segment0 === "(auth)";
    const inPublicGroup = segment0 === "(public)";

    // If it's the first time (tutorial not completed)
    if (isFirstTime || !hasCompletedTutorial) {
      if (!inAuthGroup || segment1 !== "(tutorial)") {
        router.replace("/(auth)/(tutorial)/");
      }
      return;
    }

    // If tutorial is finished but user is not signed in
    if (hasCompletedTutorial && !isSignedIn) {
      if (!inPublicGroup) {
        router.replace("/(public)/");
      }
      return;
    }

    // If user is signed in, check onboarding status
    if (isSignedIn && onboardingStatus !== undefined) {
      // Hide loading screen once we have onboarding status
      if (showLoadingScreen) {
        setShowLoadingScreen(false);
      }

      // If user exists and has completed onboarding (or is a returning user without onboarding data)
      if (
        onboardingStatus.exists &&
        (onboardingStatus.onboardingCompleted ||
          onboardingStatus.onboardingCompleted === undefined)
      ) {
        if (!inAuthGroup || segment1 !== "(tabs)") {
          router.replace("/(auth)/(tabs)/home");
        }
        return;
      }

      // If user exists but hasn't completed onboarding
      if (
        onboardingStatus.exists &&
        onboardingStatus.onboardingCompleted === false
      ) {
        if (!inAuthGroup || segment1 !== "(onboarding)") {
          router.replace("/(auth)/(onboarding)");
        }
        return;
      }

      // If user doesn't exist in database yet, go to onboarding
      if (!onboardingStatus.exists) {
        if (!inAuthGroup || segment1 !== "(onboarding)") {
          router.replace("/(auth)/(onboarding)");
        }
        return;
      }
    }
  }, [
    isLoaded,
    isFirstTime,
    hasCompletedTutorial,
    onboardingStatus,
    isSignedIn,
    segments,
    showLoadingScreen,
  ]);

  useEffect(() => {
    if (
      fontsLoaded &&
      isFirstTime !== null &&
      hasCompletedTutorial !== null &&
      (isSignedIn ? onboardingStatus !== undefined : true) &&
      !showLoadingScreen
    ) {
      SplashScreen.hideAsync();
    }
  }, [
    fontsLoaded,
    isFirstTime,
    hasCompletedTutorial,
    onboardingStatus,
    isSignedIn,
    showLoadingScreen,
  ]);

  // Show loading screen if needed
  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return <Slot />;
};

export default function Layout() {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <DuoProvider>
                  <InitialLayout />
                </DuoProvider>
              </ConvexProviderWithClerk>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
