/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#57b686",
        secondary: "#6B4F2D",
        accent: "#3B82F6",
        success: "#12B76A",
        warning: "#F79009",
        error: "#F04438",
        background: "#f2f3f4",
        text: "#1E293B",
        white: "#FFFFFF",
        black: "#000000",
      },
      fontFamily: {
        mainRegular: ["Poppins_400Regular", "sans-serif"],
        mainBold: ["Poppins_700Bold", "sans-serif"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
