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
import { treeImages } from "@/utils/treeImages";

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

  const isMountedRef = useRef(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const itemScaleAnim = useRef(new Animated.Value(0)).current;
  const itemFloatAnim = useRef(new Animated.Value(0)).current;
  const successPulseAnim = useRef(new Animated.Value(1)).current;
  const xpCounterAnim = useRef(new Animated.Value(0)).current;

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
      xpCounterAnim.setValue(0);
      setDisplayXP(0);

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

        // XP counter
        Animated.timing(xpCounterAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),

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
        Animated.delay(6000),

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
        ]),
      ]);

      // Start animation sequence
      animationSequence.start(({ finished }) => {
        if (finished && isMountedRef.current) {
          onComplete();
        }
      });

      // Add listener for XP counter animation
      const listener = xpCounterAnim.addListener(({ value }) => {
        if (isMountedRef.current) {
          setDisplayXP(Math.round(value * rewards.xp));
        }
      });

      // Cleanup function
      return () => {
        isMountedRef.current = false;
        xpCounterAnim.removeListener(listener);
        animationSequence.stop();
      };
    }
  }, [visible, rewards]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!visible || !rewards || !bothCompleted) return null;

  const itemFloat = itemFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const rarityColors = rewards.item
    ? getRarityColors(rewards.item.rarity)
    : null;

  // Backdrop
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
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              flex: 1,
              backgroundColor: "rgba(31, 41, 55, 0.9)",
            }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(31, 41, 55, 0.95)",
            }}
          />
        )}
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
        zIndex: 100000, // Increased from 99999
        elevation: 100000, // Increased from 99999
      }}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Backdrop />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          zIndex: 100000,
          elevation: 100000,
        }}
        pointerEvents="box-none"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
            opacity: fadeAnim,
            width: Math.min(width - 48, 320),
          }}
        >
          {/* Card Container */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#1e293b",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.15,
              shadowRadius: 25,
              elevation: 20,
            }}
          >
            {/* Success Header */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Animated.View
                style={{
                  transform: [{ scale: successPulseAnim }],
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#f0fdf4",
                    borderRadius: 32,
                    padding: 8,
                    borderWidth: 2,
                    borderColor: "#bbf7d0",
                  }}
                >
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#ffffff",
                        fontWeight: "800",
                      }}
                      className="font-mainRegular"
                    >
                      ✓
                    </Text>
                  </LinearGradient>
                </View>
              </Animated.View>

              <Text
                style={{
                  color: "#0f172a",
                  fontSize: 22,
                  fontWeight: "800",
                  textAlign: "center",
                  marginBottom: 4,
                }}
                className="font-mainRegular"
              >
                Perfect Teamwork!
              </Text>

              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#10b981",
                  borderRadius: 1,
                  marginBottom: 8,
                }}
              />

              <Text
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: "500",
                  textAlign: "center",
                  lineHeight: 20,
                }}
                className="font-mainRegular"
              >
                You both completed this habit together
              </Text>
            </View>

            {/* XP Reward */}
            <View
              style={{
                alignItems: "center",
                marginBottom: rewards.item ? 20 : 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: "#bae6fd",
                  shadowColor: "#0ea5e9",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={["#0ea5e9", "#0284c7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#ffffff",
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#0ea5e9",
                        fontSize: 12,
                        fontWeight: "800",
                      }}
                      className="font-mainRegular"
                    >
                      +
                    </Text>
                  </View>

                  <Animated.Text
                    style={{
                      color: "white",
                      fontSize: 24,
                      fontWeight: "800",
                      marginRight: 8,
                    }}
                  >
                    {displayXP}
                  </Animated.Text>

                  <View
                    style={{
                      backgroundColor: "#ffffff",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#0ea5e9",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                      className="font-mainRegular"
                    >
                      XP
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              <View
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <Text
                  style={{
                    color: "#475569",
                    fontSize: 11,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                  className="font-mainRegular"
                >
                  ADDED TO TRUST SCORE
                </Text>
              </View>
            </View>

            {/* Item Reward */}
            {rewards.item && rarityColors && (
              <Animated.View
                style={{
                  transform: [
                    { scale: itemScaleAnim },
                    { translateY: itemFloat },
                  ],
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 2,
                    borderColor: rarityColors.border,
                    shadowColor: rarityColors.primary,
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 15,
                  }}
                >
                  <LinearGradient
                    colors={[rarityColors.primary, rarityColors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 20,
                      alignItems: "center",
                      minWidth: 160,
                    }}
                  >
                    {/* Item icon */}
                    <View
                      style={{
                        backgroundColor: "#ffffff",
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        shadowColor: rarityColors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >
                      <Image
                        source={treeImages[rewards.item.itemId]}
                        style={{
                          width: 40,
                          height: 40,
                          resizeMode: "contain",
                        }}
                      />
                    </View>

                    {/* Rarity badge */}
                    <View
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: rarityColors.accent,
                          fontSize: 10,
                          fontWeight: "800",
                          letterSpacing: 0.8,
                        }}
                        className="font-mainRegular"
                      >
                        {rewards.item.rarity.toUpperCase()}
                      </Text>
                    </View>

                    {/* Item name */}
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "700",
                        textAlign: "center",
                      }}
                      className="font-mainRegular"
                    >
                      {rewards.item.name}
                    </Text>
                  </LinearGradient>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};
