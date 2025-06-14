import { ColorValue } from "react-native";

export const createTheme = (isDarkMode: boolean) => ({
  colors: {
    background: isDarkMode
      ? (["#0f172a", "#1e293b", "#0f172a"] as [
          ColorValue,
          ColorValue,
          ColorValue,
        ])
      : (["#f8fafc", "#ffffff", "#f1f5f9"] as [
          ColorValue,
          ColorValue,
          ColorValue,
        ]),
    cardBackground: isDarkMode
      ? "rgba(30, 41, 59, 0.85)"
      : "rgba(255, 255, 255, 0.85)",
    cardBorder: isDarkMode
      ? "rgba(148, 163, 184, 0.2)"
      : "rgba(148, 163, 184, 0.3)",
    text: {
      primary: isDarkMode ? "#ffffff" : "#0f172a",
      secondary: isDarkMode ? "#cbd5e1" : "#64748b",
      tertiary: isDarkMode ? "#94a3b8" : "#94a3b8",
    },
    primary: "#009966",
    primaryLight: "#00cc88",
    glass: isDarkMode ? "rgba(30, 41, 59, 0.3)" : "rgba(255, 255, 255, 0.3)",
  },
});
