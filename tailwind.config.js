/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
    colors: {
      primary: "#10B981",
      secondary: "#6B4F2D",
      accent: "#3B82F6",
      success: "#12B76A",
      warning: "#F79009",
      error: "#F04438",
      background: "#F0FDF4",
      text: "#1E293B",
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
