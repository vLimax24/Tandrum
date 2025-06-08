import "../global.css";
import { useEffect, useState } from "react";
import { SplashScreen, useSegments, useRouter } from "expo-router";
import { Slot } from "expo-router";
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
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );

  // Check if this is the first time opening the app and if tutorial is completed
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
        const tutorialCompleted =
          await AsyncStorage.getItem("tutorialCompleted");
        const onboardingDone = await AsyncStorage.getItem(
          "onboardingCompleted"
        );

        setIsFirstTime(firstTimeValue === null);
        setHasCompletedTutorial(tutorialCompleted === "true");
        setOnboardingCompleted(onboardingDone === "true");
      } catch (error) {
        console.error("Error checking first time status:", error);
        // Default to first time if there's an error
        setIsFirstTime(true);
        setHasCompletedTutorial(false);
        setOnboardingCompleted(false);
      }
    };

    checkFirstTime();
  }, []);

  // Re-check AsyncStorage when authentication state changes
  useEffect(() => {
    if (isSignedIn && isFirstTime !== null) {
      const recheckStorage = async () => {
        try {
          const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
          const tutorialCompleted =
            await AsyncStorage.getItem("tutorialCompleted");
          const onboardingDone = await AsyncStorage.getItem(
            "onboardingCompleted"
          );

          setIsFirstTime(
            firstTimeValue === null ? false : firstTimeValue !== "true"
          );
          setHasCompletedTutorial(tutorialCompleted === "true");
          setOnboardingCompleted(onboardingDone === "true");
        } catch (error) {
          console.error("Error rechecking storage:", error);
        }
      };
      recheckStorage();
    }
  }, [isSignedIn]);

  // Handle routing based on authentication, tutorial, and onboarding state
  useEffect(() => {
    if (
      !isLoaded ||
      isFirstTime === null ||
      hasCompletedTutorial === null ||
      onboardingCompleted === null
    )
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const inPublicGroup = segments[0] === "(public)";
    const inTutorialGroup = segments[0] === "(tutorial)";
    const inOnboardingGroup = segments.includes("(onboarding)");

    // If user is signed in
    if (isSignedIn) {
      // Wait for convexUser to load
      if (convexUser === undefined) {
        return; // Still loading
      }

      // Check if user has completed onboarding
      const hasCompletedOnboarding = onboardingCompleted && convexUser;

      if (!hasCompletedOnboarding && !inOnboardingGroup) {
        router.replace("/(auth)/(onboarding)");
        return;
      }

      // User has completed onboarding, go to main app
      if (hasCompletedOnboarding && !inAuthGroup) {
        router.replace("/(auth)/(tabs)/home");
        return;
      }

      // If user is in onboarding but has already completed it, redirect to main app
      if (hasCompletedOnboarding && inOnboardingGroup) {
        router.replace("/(auth)/(tabs)/home");
        return;
      }

      return;
    }

    // User is not signed in
    // If it's first time and tutorial not completed, show tutorial
    if (isFirstTime && !hasCompletedTutorial && !inTutorialGroup) {
      router.replace("/(tutorial)");
      return;
    }

    // If tutorial is completed or not first time, show login
    if ((hasCompletedTutorial || !isFirstTime) && !inPublicGroup) {
      router.replace("/(public)");
    }
    // If they're in auth group but not signed in, redirect to public
    else if (inAuthGroup) {
      router.replace("/(public)");
    }
  }, [
    isLoaded,
    isSignedIn,
    isFirstTime,
    hasCompletedTutorial,
    onboardingCompleted,
    segments,
    convexUser,
  ]);
  useEffect(() => {
    if (
      fontsLoaded &&
      isFirstTime !== null &&
      hasCompletedTutorial !== null &&
      onboardingCompleted !== null
    ) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isFirstTime, hasCompletedTutorial, onboardingCompleted]);

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
