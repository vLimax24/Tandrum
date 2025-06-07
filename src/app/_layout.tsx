import "../global.css";
import { useEffect, useState } from "react";
import { SplashScreen, useSegments, useRouter } from "expo-router";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
  const user = useUser();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<
    boolean | null
  >(null);

  // Check if this is the first time opening the app and if tutorial is completed
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
        const tutorialCompleted =
          await AsyncStorage.getItem("tutorialCompleted");

        setIsFirstTime(firstTimeValue === null);
        setHasCompletedTutorial(tutorialCompleted === "true");
      } catch (error) {
        console.error("Error checking first time status:", error);
        // Default to first time if there's an error
        setIsFirstTime(true);
        setHasCompletedTutorial(false);
      }
    };

    checkFirstTime();

    // Set up a listener to refresh the state when the app comes to foreground
    const checkAgain = () => checkFirstTime();

    // You might want to add app state change listener here if needed
    // For now, we'll rely on the auth state changes to trigger re-evaluation
  }, []);

  // Re-check AsyncStorage when authentication state changes
  useEffect(() => {
    if (isSignedIn && isFirstTime !== null) {
      const recheckStorage = async () => {
        try {
          const firstTimeValue = await AsyncStorage.getItem("isFirstTime");
          const tutorialCompleted =
            await AsyncStorage.getItem("tutorialCompleted");

          setIsFirstTime(
            firstTimeValue === null ? false : firstTimeValue !== "true"
          );
          setHasCompletedTutorial(tutorialCompleted === "true");
        } catch (error) {
          console.error("Error rechecking storage:", error);
        }
      };
      recheckStorage();
    }
  }, [isSignedIn]);

  // Handle routing based on authentication and tutorial state
  useEffect(() => {
    if (!isLoaded || isFirstTime === null || hasCompletedTutorial === null)
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const inPublicGroup = segments[0] === "(public)";
    const inTutorialGroup = segments[0] === "(tutorial)";

    // If user is signed in, always redirect to dashboard regardless of tutorial state
    if (isSignedIn) {
      if (!inAuthGroup) {
        router.replace("/(auth)/(tabs)/home");
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
  }, [isLoaded, isSignedIn, isFirstTime, hasCompletedTutorial, segments]);

  useEffect(() => {
    if (fontsLoaded && isFirstTime !== null && hasCompletedTutorial !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isFirstTime, hasCompletedTutorial]);

  return <Slot />;
};

export default function Layout() {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
              <DuoProvider>
                <InitialLayout />
              </DuoProvider>
            </ConvexProviderWithClerk>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
