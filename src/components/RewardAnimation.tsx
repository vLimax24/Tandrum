import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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
  bothCompleted = false,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(60)).current;
  const itemScaleAnim = useRef(new Animated.Value(0)).current;
  const itemFloatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    [...Array(8)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible && rewards && bothCompleted) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideUpAnim.setValue(60);
      itemScaleAnim.setValue(0);
      itemFloatAnim.setValue(0);
      glowAnim.setValue(0);
      sparkleAnims.forEach((anim) => anim.setValue(0));

      // Start animation sequence
      Animated.sequence([
        // Initial entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
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
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),

        // Sparkle effects
        Animated.stagger(
          100,
          sparkleAnims.map((anim) =>
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          )
        ),

        // Item animation if present
        ...(rewards.item
          ? [
              Animated.parallel([
                Animated.spring(itemScaleAnim, {
                  toValue: 1,
                  tension: 120,
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
        Animated.delay(10000),

        // Exit animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete();
      });
    }
  }, [visible, rewards, bothCompleted]);

  if (!visible || !rewards || !bothCompleted) return null;

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          primary: "#10b981",
          secondary: "#34d399",
          background: "rgba(16, 185, 129, 0.1)",
          glow: "rgba(16, 185, 129, 0.3)",
        };
      case "uncommon":
        return {
          primary: "#3b82f6",
          secondary: "#60a5fa",
          background: "rgba(59, 130, 246, 0.1)",
          glow: "rgba(59, 130, 246, 0.3)",
        };
      case "rare":
        return {
          primary: "#8b5cf6",
          secondary: "#a78bfa",
          background: "rgba(139, 92, 246, 0.1)",
          glow: "rgba(139, 92, 246, 0.3)",
        };
      case "epic":
        return {
          primary: "#f59e0b",
          secondary: "#fbbf24",
          background: "rgba(245, 158, 11, 0.1)",
          glow: "rgba(245, 158, 11, 0.3)",
        };
      case "legendary":
        return {
          primary: "#ef4444",
          secondary: "#f87171",
          background: "rgba(239, 68, 68, 0.1)",
          glow: "rgba(239, 68, 68, 0.3)",
        };
      default:
        return {
          primary: "#6b7280",
          secondary: "#9ca3af",
          background: "rgba(107, 114, 128, 0.1)",
          glow: "rgba(107, 114, 128, 0.3)",
        };
    }
  };

  const itemFloat = itemFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const rarityColors = rewards.item
    ? getRarityColors(rewards.item.rarity)
    : null;

  // Glassmorphism backdrop component
  const GlassmorphismBackdrop = () => (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: fadeAnim,
      }}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        />
      )}
    </Animated.View>
  );

  return (
    <View className="absolute inset-0 z-50 items-center justify-center">
      <GlassmorphismBackdrop />

      {/* Main Container with Glassmorphism */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
          opacity: fadeAnim,
        }}
        className="mx-8 max-w-sm w-full"
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={100}
            tint="light"
            style={{
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.25)", "rgba(255, 255, 255, 0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 32 }}
            >
              <RewardContent />
            </LinearGradient>
          </BlurView>
        ) : (
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 32,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 20,
            }}
          >
            <RewardContent />
          </LinearGradient>
        )}
      </Animated.View>

      {/* Sparkle Effects */}
      {sparkleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#fff",
            opacity: anim,
            transform: [
              {
                translateX:
                  Math.cos((index * 45 * Math.PI) / 180) * (120 + index * 20),
              },
              {
                translateY:
                  Math.sin((index * 45 * Math.PI) / 180) * (120 + index * 20),
              },
              { scale: anim },
            ],
          }}
        />
      ))}
    </View>
  );

  function RewardContent() {
    return (
      <>
        {/* Success Header */}
        <View className="items-center mb-6">
          <Animated.View
            style={{
              transform: [{ scale: glowScale }],
              opacity: glowAnim,
            }}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
            >
              <Text className="text-white text-2xl">🎉</Text>
            </LinearGradient>
          </Animated.View>

          <Text className="text-gray-800 text-xl font-bold text-center mb-2">
            Perfect Teamwork!
          </Text>
          <Text className="text-gray-600 text-sm text-center leading-5">
            You both completed this habit together
          </Text>
        </View>

        {/* XP Reward */}
        <View className="items-center mb-6">
          <LinearGradient
            colors={["#3b82f6", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl px-8 py-4"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white text-2xl font-bold text-center">
              +{rewards.xp} XP
            </Text>
          </LinearGradient>
          <Text className="text-gray-500 text-xs mt-3 font-medium text-center">
            Added to Trust Score
          </Text>
        </View>

        {/* Item Reward */}
        {rewards.item && rarityColors && (
          <Animated.View
            style={{
              transform: [{ scale: itemScaleAnim }, { translateY: itemFloat }],
            }}
            className="items-center"
          >
            <LinearGradient
              colors={[rarityColors.primary, rarityColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-6 border border-white/30"
              style={{
                shadowColor: rarityColors.primary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <Text className="text-5xl text-center mb-3">
                {rewards.item.icon}
              </Text>

              <View className="bg-white/20 rounded-full px-3 py-1 mb-2">
                <Text className="text-white text-xs font-bold text-center uppercase tracking-wider">
                  {rewards.item.rarity}
                </Text>
              </View>

              <Text className="text-white text-base font-bold text-center">
                {rewards.item.name}
              </Text>
            </LinearGradient>

            {/* Floating particles for epic+ items */}
            {["epic", "legendary"].includes(rewards.item.rarity) && (
              <View className="absolute inset-0 items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      position: "absolute",
                      width: 3,
                      height: 3,
                      backgroundColor: rarityColors.secondary,
                      borderRadius: 1.5,
                      opacity: itemScaleAnim,
                      transform: [
                        {
                          translateX:
                            Math.cos((i * 30 * Math.PI) / 180) *
                            (80 + Math.sin(i) * 20),
                        },
                        {
                          translateY:
                            Math.sin((i * 30 * Math.PI) / 180) *
                            (80 + Math.cos(i) * 20),
                        },
                        {
                          scale: itemScaleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.5 + Math.random() * 0.5],
                          }),
                        },
                      ],
                    }}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </>
    );
  }
};
