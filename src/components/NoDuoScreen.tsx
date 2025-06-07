import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NewDuoModal } from "@/components/NewDuoModal";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { Id } from "convex/_generated/dataModel";

const treeImages: Record<string, any> = {
  sprout: require("../assets/tree-1.png"),
  smallTree: require("../assets/tree-2.png"),
  mediumTree: require("../assets/tree-1.png"),
  grownTree: require("../assets/tree-1.png"),
  orange: require("../assets/orange.png"),
  leaf: require("../assets/hemp-leaf.png"),
  calendar: require("../assets/calendar.png"),
};

interface NoDuoScreenProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const NoDuoScreen: React.FC<NoDuoScreenProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  const { user } = useUser();
  const clerkId = user?.id;
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );

  const handleStartPartnership = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#dbeafe"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        {/* Main illustration */}
        <View
          style={{
            width: 120,
            height: 120,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderRadius: 60,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <Image
            source={treeImages.leaf}
            style={{
              width: 60,
              height: 60,
              tintColor: "#10b981",
            }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Start Your Journey
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 48,
            paddingHorizontal: 16,
          }}
        >
          Create your first duo partnership to begin building habits together
          and watch your shared tree grow! 🌱
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleStartPartnership}
          activeOpacity={0.8}
          style={{
            overflow: "hidden",
            borderRadius: 16,
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
            width: "100%",
            maxWidth: 280,
          }}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              paddingHorizontal: 32,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                +
              </Text>
            </View>
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Start First Partnership
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Modal */}
        {convexUser && (
          <NewDuoModal
            visible={modalVisible}
            onClose={handleModalClose}
            userId={convexUser._id}
          />
        )}
      </View>
    </LinearGradient>
  );
};
