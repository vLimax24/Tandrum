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
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const [storageCheckTrigger, setStorageCheckTrigger] = useState(0);

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );

  // Function to check AsyncStorage values
  const checkStorageValues = async () => {
    try {
      const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
      const tutorialCompleted = await AsyncStorage.getItem("tutorialCompleted");
      const onboardingDone = await AsyncStorage.getItem("onboardingCompleted");

      console.log("Storage check values:", {
        firstTimeValue,
        tutorialCompleted,
        onboardingDone,
      });

      setIsFirstTime(
        firstTimeValue === null ? true : firstTimeValue === "true"
      );
      setHasCompletedTutorial(tutorialCompleted === "true");
      setOnboardingCompleted(onboardingDone === "true");
    } catch (error) {
      console.error("Error checking storage:", error);
      setIsFirstTime(true);
      setHasCompletedTutorial(false);
      setOnboardingCompleted(false);
    }
  };

  // Check storage values on initial mount
  useEffect(() => {
    checkStorageValues();
  }, []);

  // Re-check storage when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      checkStorageValues();
    }
  }, [isSignedIn]);

  // Add app state change listener to re-check storage when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // Force a storage recheck when app becomes active
        checkStorageValues();
      }
    });

    return () => subscription?.remove();
  }, []);

  // Add periodic storage check while user is signed in and onboarding might be in progress
  useEffect(() => {
    if (isSignedIn && onboardingCompleted === false) {
      const interval = setInterval(() => {
        console.log("Periodic storage check...");
        checkStorageValues();
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [isSignedIn, onboardingCompleted]);

  // Handle navigation redirects
  useEffect(() => {
    if (
      !isLoaded ||
      isFirstTime === null ||
      hasCompletedTutorial === null ||
      onboardingCompleted === null
    ) {
      return;
    }

    const segment0 = segments[0];
    const segment1 = segments.at(1) ?? "";
    const segment2 = segments.at(2) ?? "";

    const inAuthGroup = segment0 === "(auth)";
    const inPublicGroup = segment0 === "(public)";
    const currentPath = segments.join("/");

    console.log("Navigation state:", {
      isFirstTime,
      hasCompletedTutorial,
      onboardingCompleted,
      isSignedIn,
      segments,
      currentPath,
      inAuthGroup,
      inPublicGroup,
    });

    // If it's the first time (tutorial not completed)
    if (isFirstTime || !hasCompletedTutorial) {
      if (!inAuthGroup || segment1 !== "(tutorial)") {
        console.log("Redirecting to tutorial");
        router.replace("/(auth)/(tutorial)/");
      }
      return;
    }

    // If tutorial is finished but user is not signed in
    if (hasCompletedTutorial && !isSignedIn) {
      if (!inPublicGroup || segment1 !== "login") {
        console.log("Redirecting to login");
        router.replace("/(public)");
      }
      return;
    }

    // If user is signed in but onboarding is not completed
    if (isSignedIn && !onboardingCompleted) {
      if (!inAuthGroup || segment1 !== "(onboarding)") {
        console.log("Redirecting to onboarding");
        router.replace("/(auth)/(onboarding)");
      }
      return;
    }

    // If user is signed in and onboarding is completed
    if (isSignedIn && onboardingCompleted) {
      if (!inAuthGroup || segment1 !== "(tabs)") {
        console.log("Redirecting to home dashboard");
        router.replace("/(auth)/(tabs)/home");
      }
      return;
    }
  }, [
    isLoaded,
    isFirstTime,
    hasCompletedTutorial,
    onboardingCompleted,
    isSignedIn,
    segments,
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
