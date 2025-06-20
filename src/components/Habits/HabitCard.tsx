import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/contexts/i18nContext';

interface HabitCardProps {
  habit: any;
  isDoneByMe: boolean;
  isDoneByPartner: boolean;
  onCheck: () => void;
  onDelete: (habitId: string, habitTitle: string) => void;
  partnerName: string;
  myName: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDoneByMe,
  isDoneByPartner,
  onCheck,
  onDelete,
  partnerName,
  myName,
}) => {
  const getBorderColor = () => {
    if (isDoneByMe && isDoneByPartner) return 'border-green-200 bg-green-50';
    if (isDoneByMe || isDoneByPartner) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const { t } = useI18n();

  return (
    <View
      className={`rounded-xl p-4 mb-3 shadow-sm border ${getBorderColor()}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1 font-mainRegular">
            {habit.title}
          </Text>
          <View className="flex-row items-center">
            <View
              className={`px-2 py-1 rounded-full ${
                habit.frequency === 'daily' ? 'bg-blue-100' : 'bg-purple-100'
              }`}
            >
              <Text
                className={`text-xs font-mainRegular font-medium ${
                  habit.frequency === 'daily'
                    ? 'text-blue-800'
                    : 'text-purple-800'
                }`}
              >
                {habit.frequency === 'daily'
                  ? t('habitCard.daily')
                  : t('habitCard.weekly')}
              </Text>
            </View>
            {isDoneByMe && isDoneByPartner && (
              <View className="ml-2 px-2 py-1 rounded-full bg-green-100">
                <Text className="text-xs font-medium text-green-800 font-mainRegular">
                  {t('habitCard.bothCompleted')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center"
          onPress={() => onDelete(habit._id, habit.title)}
        >
          <Text className="text-red-500 font-bold text-lg font-mainRegular">
            ×
          </Text>
        </Pressable>
      </View>

      {/* Progress indicators */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center space-x-3">
          {/* My progress */}
          <Pressable
            className={`flex-row items-center px-3 py-2 rounded-lg border-2 ${
              isDoneByMe
                ? 'bg-accent border-accent'
                : 'border-gray-300 hover:border-accent bg-white'
            }`}
            onPress={!isDoneByMe ? onCheck : undefined}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-2 ${
                isDoneByMe ? 'bg-white border-white' : 'border-gray-400'
              } flex items-center justify-center`}
            >
              {isDoneByMe && (
                <Text className="text-accent font-bold text-xs font-mainRegular">
                  ✓
                </Text>
              )}
            </View>
            <Text
              className={`text-sm font-mainRegular font-medium ${
                isDoneByMe ? 'text-white' : 'text-gray-600'
              }`}
            >
              {myName || t('habitCard.you')}
            </Text>
          </Pressable>

          {/* Partner progress */}
          <View
            className={`flex-row items-center px-3 py-2 rounded-lg border-2 ${
              isDoneByPartner
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 bg-gray-100'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-2 ${
                isDoneByPartner ? 'bg-white border-white' : 'border-gray-400'
              } flex items-center justify-center`}
            >
              {isDoneByPartner && (
                <Text className="text-green-500 font-bold text-xs font-mainRegular">
                  ✓
                </Text>
              )}
            </View>
            <Text
              className={`text-sm font-medium font-mainRegular ${
                isDoneByPartner ? 'text-white' : 'text-gray-500'
              }`}
            >
              {partnerName?.split(' ')[0] || t('habitCard.partner')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
