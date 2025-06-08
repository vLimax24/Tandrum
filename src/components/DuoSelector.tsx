import React from "react";
import { View, Text, Image } from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface DuoSelectorProps {
  connections: any[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export function DuoSelector({
  connections,
  selectedIndex,
  setSelectedIndex,
}: DuoSelectorProps) {
  const treeImages = {
    leaf: require("@/assets/hemp-leaf.png"),
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-text mb-2">Select Duo</Text>
      <View className="bg-primary rounded-lg px-4 py-2 flex-row items-center">
        <Image
          source={treeImages.leaf}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        <View
          style={{ flex: 1, position: "relative", justifyContent: "center" }}
        >
          <RNPickerSelect
            onValueChange={setSelectedIndex}
            placeholder={{}}
            value={selectedIndex}
            items={connections.map((c, i) => ({
              label: `Duo with ${c.partnerName}`,
              value: i,
            }))}
            useNativeAndroidPickerStyle={false}
            style={{
              inputIOS: {
                color: "#fff",
                fontSize: 16,
                fontWeight: "500",
                paddingVertical: 10,
                paddingRight: 32,
                paddingLeft: 8,
                borderRadius: 8,
                backgroundColor: "transparent",
              },
              inputAndroid: {
                color: "#fff",
                fontSize: 16,
                fontWeight: "500",
                paddingVertical: 10,
                paddingRight: 32,
                paddingLeft: 8,
                borderRadius: 8,
                backgroundColor: "transparent",
              },
              iconContainer: {
                position: "absolute",
                right: 8,
                top: "50%",
                marginTop: -12,
              },
            }}
            Icon={() => <Text style={{ color: "#fff", fontSize: 18 }}>▼</Text>}
          />
        </View>
      </View>
    </View>
  );
}
