import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  home: undefined;
  tree: undefined;
  habits: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Settings: undefined;
  EditProfile: undefined;
};
