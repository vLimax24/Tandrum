import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: any;
  duo: any;
  existingHabits: any[];
}

export function CreateHabitModal({
  visible,
  onClose,
  onCreate,
  duo,
  existingHabits = [],
}: CreateHabitModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [modalOpacity] = useState(new Animated.Value(0));

  const validateHabitTitle = (title: string): string => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return "Habit title is required";
    }
    if (trimmedTitle.length < 3) {
      return "Habit title must be at least 3 characters long";
    }
    if (trimmedTitle.length > 50) {
      return "Habit title must be less than 50 characters";
    }
    if (
      existingHabits?.some(
        (h) => h.title.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      return "A habit with this title already exists";
    }
    return "";
  };

  const handleTitleChange = (text: string) => {
    setNewTitle(text);
    if (validationError) {
      const error = validateHabitTitle(text);
      setValidationError(error);
    }
  };

  const showModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setNewTitle("");
      setValidationError("");
    });
  };

  const handleCreateHabit = async () => {
    const error = validateHabitTitle(newTitle);
    if (error) {
      setValidationError(error);
      return;
    }

    if (!duo) {
      Alert.alert("Error", "No duo selected. Please try again.");
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        title: newTitle.trim(),
        frequency: newFreq,
        duoId: duo._id,
      });
      hideModal();
    } catch (error) {
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  React.useEffect(() => {
    if (visible) {
      showModal();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hideModal}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          opacity: modalOpacity,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [
              {
                translateY: modalOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          }}
        >
          <ModalHeader onClose={hideModal} />
          <ModalContent
            newTitle={newTitle}
            onTitleChange={handleTitleChange}
            validationError={validationError}
            newFreq={newFreq}
            setNewFreq={setNewFreq}
            onCancel={hideModal}
            onCreate={handleCreateHabit}
            isCreating={isCreating}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <View
      style={{
        backgroundColor: "#10b981",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "white",
            opacity: 0.2,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "white",
            opacity: 0.15,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
          Create New Habit
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 40,
            height: 40,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            ×
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ModalContentProps {
  newTitle: string;
  onTitleChange: (text: string) => void;
  validationError: string;
  newFreq: "daily" | "weekly";
  setNewFreq: (freq: "daily" | "weekly") => void;
  onCancel: () => void;
  onCreate: () => void;
  isCreating: boolean;
}

function ModalContent({
  newTitle,
  onTitleChange,
  validationError,
  newFreq,
  setNewFreq,
  onCancel,
  onCreate,
  isCreating,
}: ModalContentProps) {
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
      <TitleInput
        value={newTitle}
        onChange={onTitleChange}
        validationError={validationError}
      />

      <FrequencySelector value={newFreq} onChange={setNewFreq} />

      <ActionButtons
        onCancel={onCancel}
        onCreate={onCreate}
        isCreating={isCreating}
        isDisabled={!!validationError || !newTitle.trim()}
      />
    </View>
  );
}

function TitleInput({
  value,
  onChange,
  validationError,
}: {
  value: string;
  onChange: (text: string) => void;
  validationError: string;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: "#111827",
          fontWeight: "600",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        Habit Title
      </Text>
      <TextInput
        style={{
          backgroundColor: "#f8fafc",
          borderWidth: 2,
          borderColor: validationError ? "#dc2626" : "#e5e7eb",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 16,
          fontSize: 16,
          color: "#111827",
        }}
        placeholder="Enter your habit (e.g., Drink 8 glasses of water)"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoFocus
        returnKeyType="done"
        maxLength={50}
      />
      {validationError ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: "#dc2626",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            ⚠️ {validationError}
          </Text>
        </View>
      ) : (
        <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
          {value.length}/50 characters
        </Text>
      )}
    </View>
  );
}

function FrequencySelector({
  value,
  onChange,
}: {
  value: "daily" | "weekly";
  onChange: (freq: "daily" | "weekly") => void;
}) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          color: "#111827",
          fontWeight: "600",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        Frequency
      </Text>
      <View
        style={{
          backgroundColor: "#f8fafc",
          borderWidth: 2,
          borderColor: "#e5e7eb",
          borderRadius: 12,
        }}
      >
        <RNPickerSelect
          onValueChange={onChange}
          value={value}
          placeholder={{}}
          items={[
            { label: "Daily - Every day", value: "daily" },
            { label: "Weekly - Once per week", value: "weekly" },
          ]}
          useNativeAndroidPickerStyle={false}
          style={{
            inputIOS: {
              color: "#111827",
              paddingVertical: 16,
              paddingHorizontal: 16,
              fontSize: 16,
              fontWeight: "500",
            },
            inputAndroid: {
              color: "#111827",
              paddingVertical: 16,
              paddingHorizontal: 16,
              fontSize: 16,
              fontWeight: "500",
            },
            iconContainer: {
              top: 20,
              right: 16,
            },
          }}
          Icon={() => <Text style={{ color: "#6B7280", fontSize: 16 }}>▼</Text>}
        />
      </View>
    </View>
  );
}

function ActionButtons({
  onCancel,
  onCreate,
  isCreating,
  isDisabled,
}: {
  onCancel: () => void;
  onCreate: () => void;
  isCreating: boolean;
  isDisabled: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <TouchableOpacity
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "#f3f4f6",
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          paddingVertical: 16,
        }}
      >
        <Text
          style={{
            color: "#111827",
            fontWeight: "600",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCreate}
        disabled={isDisabled || isCreating}
        style={{
          flex: 1,
          borderRadius: 12,
          paddingVertical: 16,
          backgroundColor: isDisabled || isCreating ? "#e5e7eb" : "#10b981",
          shadowColor: isDisabled || isCreating ? "transparent" : "#10b981",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: isDisabled || isCreating ? 0 : 4,
        }}
      >
        {isCreating ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                fontSize: 16,
                marginLeft: 8,
              }}
            >
              Creating...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontWeight: "600",
              fontSize: 16,
              color: isDisabled ? "#9ca3af" : "white",
            }}
          >
            Create Habit
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
