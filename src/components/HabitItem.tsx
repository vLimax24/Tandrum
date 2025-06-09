import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface HabitItemProps {
  habit: any;
  isDoneByMe: boolean;
  isDoneByPartner: boolean;
  onCheck: () => void;
  onMenuPress: (event: any, habit: any) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  isDoneByMe,
  isDoneByPartner,
  onCheck,
  onMenuPress,
}) => (
  <View
    className="mb-4 rounded-3xl overflow-hidden"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    }}
  >
    {/* Glassmorphism container */}
    <View
      style={{
        backgroundColor: "#fafbfc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 24,
        padding: 20,
      }}
    >
      {/* Header with title and menu */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-[#1f2937] font-bold text-lg leading-6 mb-2">
            {habit.title}
          </Text>

          {/* Frequency badge with glassmorphism */}
          <View
            style={{
              backgroundColor:
                habit.frequency === "daily" ? "#dbeafe" : "#ede9fe",
              borderWidth: 1,
              borderColor: habit.frequency === "daily" ? "#93c5fd" : "#c4b5fd",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: "flex-start",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                className="text-xs font-semibold"
                style={{
                  color: habit.frequency === "daily" ? "#1d4ed8" : "#7c3aed",
                }}
              >
                {habit.frequency === "daily" ? "Daily" : "Weekly"}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu button with glassmorphism */}
        <TouchableOpacity
          className="rounded-full p-3"
          onPress={(event) => {
            onMenuPress(event, habit);
          }}
        >
          <View className="flex-col items-center justify-center gap-1">
            <View className="w-1 h-1 bg-[#000000] rounded-full" />
            <View className="w-1 h-1 bg-[#000000] rounded-full" />
            <View className="w-1 h-1 bg-[#000000] rounded-full" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Completion status section */}
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 20,
          padding: 16,
        }}
      >
        {/* Checkboxes with chips directly above */}
        <View className="flex-row justify-between items-end mb-4">
          {/* My completion section */}
          <View className="flex-1 items-center">
            {/* YOU chip directly above checkbox */}
            <View
              style={{
                backgroundColor: "#d1fae5",
                borderWidth: 1,
                borderColor: "#6ee7b7",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginBottom: 8,
              }}
            >
              <Text className="text-[#059669] text-xs font-bold">YOU</Text>
            </View>

            {/* My checkbox */}
            <TouchableOpacity
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 3,
                borderColor: isDoneByMe ? "#34d399" : "#e5e7eb",
                backgroundColor: isDoneByMe ? "#10b981" : "#ffffff",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: isDoneByMe ? "#10b981" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDoneByMe ? 0.3 : 0,
                shadowRadius: 12,
                elevation: isDoneByMe ? 6 : 0,
              }}
              onPress={isDoneByMe ? undefined : onCheck}
              disabled={isDoneByMe}
              activeOpacity={isDoneByMe ? 1 : 0.7}
            >
              {isDoneByMe ? (
                <Text className="text-white font-bold text-xl">✓</Text>
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#d1d5db",
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Connection line */}
          <View className="flex-1 items-center" style={{ paddingBottom: 28 }}>
            <View
              style={{
                width: 40,
                height: 2,
                backgroundColor:
                  isDoneByMe && isDoneByPartner ? "#6ee7b7" : "#e5e7eb",
                borderRadius: 1,
              }}
            />
          </View>

          {/* Partner's completion section */}
          <View className="flex-1 items-center">
            {/* PARTNER chip directly above checkbox */}
            <View
              style={{
                backgroundColor: "#dbeafe",
                borderWidth: 1,
                borderColor: "#93c5fd",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginBottom: 8,
              }}
            >
              <Text className="text-[#1d4ed8] text-xs font-bold">PARTNER</Text>
            </View>

            {/* Partner's checkbox */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 3,
                borderColor: isDoneByPartner ? "#60a5fa" : "#e5e7eb",
                backgroundColor: isDoneByPartner ? "#3b82f6" : "#ffffff",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: isDoneByPartner ? "#3b82f6" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDoneByPartner ? 0.3 : 0,
                shadowRadius: 12,
                elevation: isDoneByPartner ? 6 : 0,
              }}
            >
              {isDoneByPartner ? (
                <Text className="text-white font-bold text-xl">✓</Text>
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#d1d5db",
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Progress indicator */}
        {(isDoneByMe || isDoneByPartner) && (
          <View
            className="mt-4 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb" }}
          >
            <View className="flex-row items-center justify-center">
              <View
                style={{
                  backgroundColor:
                    isDoneByMe && isDoneByPartner ? "#d1fae5" : "#fef3c7",
                  borderWidth: 1,
                  borderColor:
                    isDoneByMe && isDoneByPartner ? "#6ee7b7" : "#fcd34d",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 12, marginRight: 4 }}>
                    {isDoneByMe && isDoneByPartner ? "🎉" : "⏳"}
                  </Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color:
                        isDoneByMe && isDoneByPartner ? "#059669" : "#d97706",
                    }}
                  >
                    {isDoneByMe && isDoneByPartner
                      ? "Both completed!"
                      : "Waiting for partner..."}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  </View>
);
