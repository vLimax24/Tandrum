import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { getRarityColors } from "@/utils/rarities";
import { images } from "@/utils/images";
import { useTheme } from "@/contexts/themeContext";
import { createTheme } from "@/utils/theme";

interface RewardAnimationProps {
  visible: boolean;
  rewards: {
    xp: number;
    item?: {
      itemId: string;
      name: string;
      rarity: string;
      category: string;
      icon: string;
      color: string;
    } | null;
  } | null;
  bothCompleted?: boolean;
  onComplete: () => void;
}

const { width, height } = Dimensions.get("window");

export const RewardAnimation: React.FC<RewardAnimationProps> = ({
  visible,
  rewards,
  bothCompleted = true,
  onComplete,
}) => {
  const [displayXP, setDisplayXP] = useState(0);
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  const isMountedRef = useRef(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const itemScaleAnim = useRef(new Animated.Value(0)).current;
  const itemFloatAnim = useRef(new Animated.Value(0)).current;
  const successPulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Separate ref for XP counter to avoid listener performance issues
  const xpCounterRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Optimized XP counter function using requestAnimationFrame
  const animateXPCounter = (targetXP: number, duration: number = 600) => {
    const startTime = Date.now();
    const startValue = 0;

    const updateXP = () => {
      if (!isMountedRef.current) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentXP = Math.round(
        startValue + (targetXP - startValue) * easedProgress
      );

      setDisplayXP(currentXP);
      xpCounterRef.current = currentXP;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateXP);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateXP);
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (visible && rewards) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideUpAnim.setValue(30);
      itemScaleAnim.setValue(0);
      itemFloatAnim.setValue(0);
      successPulseAnim.setValue(1);
      glowAnim.setValue(0);
      setDisplayXP(0);
      xpCounterRef.current = 0;

      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Store the animation sequence
      const animationSequence = Animated.sequence([
        // Entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),

        // Success pulse
        Animated.sequence([
          Animated.spring(successPulseAnim, {
            toValue: 1.08,
            tension: 120,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(successPulseAnim, {
            toValue: 1,
            tension: 120,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),

        // Start XP counter animation (no Animated.Value needed)
        Animated.delay(100), // Small delay before starting XP counter

        ...(rewards.item
          ? [
              Animated.parallel([
                Animated.spring(itemScaleAnim, {
                  toValue: 1,
                  tension: 100,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(itemFloatAnim, {
                      toValue: 1,
                      duration: 2000,
                      useNativeDriver: true,
                    }),
                    Animated.timing(itemFloatAnim, {
                      toValue: 0,
                      duration: 2000,
                      useNativeDriver: true,
                    }),
                  ]),
                  { iterations: 2 }
                ),
              ]),
            ]
          : []),

        // Hold for viewing
        Animated.delay(30000), // Reduced slightly since XP animation is faster

        // Exit
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      ]);

      // Start animation sequence
      animationSequence.start(({ finished }) => {
        if (finished && isMountedRef.current) {
          onComplete();
        }
      });

      // Start XP counter animation after a short delay
      const xpTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          animateXPCounter(rewards.xp);
        }
      }, 1100); // Start after entrance + pulse animations

      // Cleanup function
      return () => {
        isMountedRef.current = false;
        animationSequence.stop();
        clearTimeout(xpTimeout);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [visible, rewards]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!visible || !rewards || !bothCompleted) return null;

  const itemFloat = itemFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const rarityColors = rewards.item
    ? getRarityColors(rewards.item.rarity)
    : null;

  // Backdrop with enhanced blur
  const Backdrop = () => (
    <TouchableWithoutFeedback onPress={onComplete}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: fadeAnim,
          zIndex: 99998,
        }}
      >
        <BlurView
          intensity={isDarkMode ? 40 : 60}
          tint={isDarkMode ? "dark" : "light"}
          style={{
            flex: 1,
            backgroundColor: isDarkMode
              ? "rgba(15, 23, 42, 0.4)"
              : "rgba(248, 250, 252, 0.6)",
          }}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100000,
        elevation: 100000,
      }}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Backdrop />

      <View
        className="flex-1 justify-center items-center px-4"
        style={{ zIndex: 100000, elevation: 100000 }}
        pointerEvents="box-none"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
            opacity: fadeAnim,
            width: Math.min(width - 32, 320), // Reduced from 380 to 320
            maxHeight: height * 0.8, // Ensure it doesn't exceed 80% of screen height
          }}
        >
          {/* Main Glass Card Container */}
          <BlurView
            intensity={20}
            tint={isDarkMode ? "dark" : "light"}
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              borderWidth: 1,
              borderRadius: 24, // Reduced from 32
              overflow: "hidden",
            }}
          >
            <View className="p-5">
              {/* Reduced from p-8 to p-5 */}
              {/* Success Header with Team Icons */}
              <View className="items-center mb-5">
                {/* Reduced from mb-8 to mb-5 */}
                <Animated.View
                  style={{ transform: [{ scale: successPulseAnim }] }}
                  className="mb-4" // Reduced from mb-6 to mb-4
                >
                  {/* Team Success Icon Container */}
                  <View className="relative">
                    <View
                      style={{
                        backgroundColor: theme.colors.background[1],
                        borderColor: theme.colors.primary,
                        borderRadius: 1600,
                      }}
                      className="rounded-full p-3 border-2" // Reduced from p-4 to p-3
                    >
                      <LinearGradient
                        colors={[
                          theme.colors.primary,
                          theme.colors.primaryLight,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-12 h-12 items-center justify-center" // Reduced from w-16 h-16
                        style={{ borderRadius: 10000 }}
                      >
                        {/* Team Success Icon */}
                        <View className="flex-row items-center gap-1">
                          <View className="w-2 h-2 bg-white rounded-full" />
                          {/* Reduced from w-3 h-3 */}
                          <Text className="text-white text-base font-bold">
                            {/* Reduced from text-lg */}+
                          </Text>
                          <View className="w-2 h-2 bg-white rounded-full" />
                          {/* Reduced from w-3 h-3 */}
                        </View>
                      </LinearGradient>
                    </View>

                    {/* Floating particles effect */}
                    <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80" />
                    <View className="absolute -bottom-0 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-60" />
                  </View>
                </Animated.View>
                <Text
                  style={{ color: theme.colors.text.primary }}
                  className="text-2xl font-bold text-center mb-2 tracking-tight" // Reduced from text-3xl, mb-3
                >
                  Team Victory!
                </Text>
                <View
                  style={{ backgroundColor: theme.colors.primary }}
                  className="w-12 h-1 rounded-full mb-3" // Reduced from w-16, mb-4
                />
                <Text
                  style={{ color: theme.colors.text.secondary }}
                  className="text-sm font-medium text-center leading-5 max-w-xs" // Reduced from text-base, leading-6
                >
                  Perfect synchronization—you both crushed this habit together
                  🙌
                </Text>
              </View>
              {/* Enhanced XP Reward Section */}
              <View
                className={`items-center ${rewards.item ? "mb-5" : "mb-0"}`} // Reduced from mb-8
              >
                <View className="w-full">
                  {/* XP Header */}
                  <View className="flex-row items-center justify-center gap-2 mb-3">
                    <View
                      style={{ backgroundColor: theme.colors.primary }}
                      className="w-1.5 h-1.5 rounded-full"
                    />
                    <Text
                      style={{ color: theme.colors.text.secondary }}
                      className="text-xs font-semibold tracking-wide text-center" // Added text-center and reduced tracking
                    >
                      TRUST SCORE BOOST
                    </Text>
                    <View
                      style={{ backgroundColor: theme.colors.primary }}
                      className="w-1.5 h-1.5 rounded-full"
                    />
                  </View>

                  {/* XP Display Card */}
                  <BlurView
                    intensity={15}
                    tint={isDarkMode ? "dark" : "light"}
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(14, 165, 233, 0.08)"
                        : "rgba(240, 249, 255, 0.7)",
                      borderColor: isDarkMode
                        ? "rgba(14, 165, 233, 0.25)"
                        : "rgba(186, 230, 253, 0.6)",
                      borderWidth: 1,
                      borderRadius: 20, // Reduced from 24
                      overflow: "hidden",
                    }}
                  >
                    <View className="p-4">
                      {/* Reduced from p-6 */}
                      <LinearGradient
                        colors={["#0ea5e9", "#0284c7", "#0369a1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-xl px-6 py-4 flex-row items-center justify-center" // Reduced padding
                        style={{ borderRadius: 12 }} // Reduced from 16
                      >
                        {/* Plus Icon */}
                        <View className="bg-white w-6 h-6 rounded-full items-center justify-center mr-3">
                          {/* Reduced from w-8 h-8, mr-4 */}
                          <Text
                            style={{ color: "#0ea5e9" }}
                            className="text-base font-bold" // Reduced from text-lg
                          >
                            +
                          </Text>
                        </View>

                        {/* XP Number */}
                        <Text className="text-white text-3xl font-bold mr-3 tracking-tight">
                          {/* Reduced from text-4xl, mr-4 */}
                          {displayXP}
                        </Text>

                        {/* XP Badge */}
                        <View className="bg-white rounded-lg px-3 py-1">
                          {/* Increased px from 2 to 3 */}
                          <Text
                            style={{ color: "#0ea5e9" }}
                            className="text-xs font-bold tracking-wide" // Added tracking-wide for better spacing
                          >
                            XP
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </BlurView>
                </View>
              </View>
              {/* Enhanced Item Reward */}
              {rewards.item && rarityColors && (
                <Animated.View
                  style={{
                    transform: [
                      { scale: itemScaleAnim },
                      { translateY: itemFloat },
                    ],
                  }}
                  className="items-center"
                >
                  <View className="mb-3">
                    {/* Reduced from mb-4 */}
                    <Text
                      style={{ color: theme.colors.text.secondary }}
                      className="text-xs font-semibold text-center tracking-wider" // Reduced from text-sm
                    >
                      BONUS REWARD UNLOCKED
                    </Text>
                  </View>

                  <BlurView
                    intensity={10}
                    tint={isDarkMode ? "dark" : "light"}
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: rarityColors.border,
                      borderWidth: 2,
                      borderRadius: 20, // Reduced from 24
                      overflow: "hidden",
                    }}
                  >
                    <View className="p-4">
                      {/* Reduced from p-6 */}
                      <LinearGradient
                        colors={[rarityColors.primary, rarityColors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-xl p-4 items-center min-w-[140px]" // Reduced padding and min-width
                        style={{ borderRadius: 12 }} // Reduced from 16
                      >
                        {/* Item icon container */}
                        <View
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                          }}
                          className="w-14 h-14 rounded-full items-center justify-center mb-3" // Reduced from w-20 h-20, mb-5
                        >
                          <Image
                            source={images[rewards.item.itemId]}
                            className="w-8 h-8" // Reduced from w-12 h-12
                            style={{ resizeMode: "contain" }}
                          />
                        </View>

                        {/* Rarity badge with enhanced styling */}
                        <View className="bg-white rounded-xl px-3 py-1 mb-2">
                          {/* Reduced padding and margin */}
                          <Text
                            style={{ color: rarityColors.accent }}
                            className="text-xs font-bold tracking-wide" // Reduced tracking
                          >
                            {rewards.item.rarity.toUpperCase()}
                          </Text>
                        </View>

                        {/* Item name */}
                        <Text className="text-white text-base font-bold text-center leading-5">
                          {/* Reduced from text-lg, leading-6 */}
                          {rewards.item.name}
                        </Text>
                      </LinearGradient>
                    </View>
                  </BlurView>
                </Animated.View>
              )}
              {/* Tap to Continue Hint */}
              <View className="items-center mt-5">
                {/* Reduced from mt-8 */}
                <Text
                  style={{ color: theme.colors.text.tertiary }}
                  className="text-xs font-medium opacity-60"
                >
                  Tap anywhere to continue
                </Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
};
