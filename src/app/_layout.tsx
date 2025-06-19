import '../global.css';
import { useEffect } from 'react';
import { SplashScreen, useSegments, useRouter } from 'expo-router';
import { Slot } from 'expo-router';
import LoadingScreen from '@/components/LoadingScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  useUser,
} from '@clerk/clerk-expo';
import { tokenCache } from '@/utils/cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { DuoProvider } from '@/hooks/useDuo';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { ThemeProvider } from '@/contexts/themeContext';
import { useNavigationStore } from '@/stores/NavigationStore';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

SplashScreen.preventAutoHideAsync();

if (!clerkPublishableKey) {
  throw new Error('CLERK_PUBLISHABLE_KEY is not set');
}

const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const { hasCompletedTutorial, isInitialized, initialize } =
    useNavigationStore();

  // Get onboarding status from server only when user is signed in
  const onboardingStatus = useQuery(
    api.users.getOnboardingStatus,
    isSignedIn && user?.id ? { clerkId: user.id } : 'skip',
  );

  // Initialize the store on first load
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Main navigation logic
  useEffect(() => {
    // Wait for all necessary data to be loaded
    if (!isLoaded || !fontsLoaded || !isInitialized) {
      return;
    }

    const segment0 = segments[0];
    const segment1 = segments.at(1) ?? '';
    const inAuthGroup = segment0 === '(auth)';

    // 1. Tutorial flow - if tutorial not completed, show tutorial
    if (!hasCompletedTutorial) {
      if (!inAuthGroup || segment1 !== '(tutorial)') {
        router.replace('/(auth)/(tutorial)/');
      }
      return;
    }

    // 2. Not signed in but tutorial completed - stay on tutorial (auth screen)
    if (!isSignedIn) {
      if (!inAuthGroup || segment1 !== '(tutorial)') {
        router.replace('/(auth)/(tutorial)/');
      }
      return;
    }

    // 3. Signed in - check onboarding status
    if (isSignedIn && onboardingStatus !== undefined) {
      // New user or user who hasn't completed onboarding
      if (
        !onboardingStatus.exists ||
        onboardingStatus.onboardingCompleted === false
      ) {
        if (!inAuthGroup || segment1 !== '(onboarding)') {
          router.replace('/(auth)/(onboarding)');
        }
        return;
      }

      // Existing user who completed onboarding
      if (
        onboardingStatus.exists &&
        (onboardingStatus.onboardingCompleted === true ||
          onboardingStatus.onboardingCompleted === undefined)
      ) {
        if (!inAuthGroup || segment1 !== '(tabs)') {
          router.replace('/(auth)/(tabs)/home');
        }
        return;
      }
    }
  }, [
    isLoaded,
    fontsLoaded,
    isInitialized,
    hasCompletedTutorial,
    isSignedIn,
    onboardingStatus,
    segments,
    router,
  ]);

  // Hide splash screen when everything is ready
  useEffect(() => {
    const shouldHideSplash =
      fontsLoaded &&
      isLoaded &&
      isInitialized &&
      (isSignedIn ? onboardingStatus !== undefined : true);

    if (shouldHideSplash) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded, isInitialized, isSignedIn, onboardingStatus]);

  // Show loading screen only during SSO flow
  const showLoadingScreen = isSignedIn && onboardingStatus === undefined;

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
              <ThemeProvider>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                  <DuoProvider>
                    <InitialLayout />
                  </DuoProvider>
                </ConvexProviderWithClerk>
              </ThemeProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
