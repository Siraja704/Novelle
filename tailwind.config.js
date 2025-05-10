/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#007AFF",
          dark: "#0A84FF",
        },
        success: {
          light: "#34C759",
          dark: "#30D158",
        },
        error: {
          light: "#FF3B30",
          dark: "#FF453A",
        },
        warning: {
          light: "#FF9500",
          dark: "#FF9F0A",
        },
        background: {
          light: "#FFFFFF",
          dark: "#000000",
        },
        card: {
          light: "#F2F2F7",
          dark: "#1C1C1E",
        },
        text: {
          light: "#000000",
          dark: "#FFFFFF",
        },
        secondary: {
          light: "#8E8E93",
          dark: "#98989D",
        },
        border: {
          light: "#C6C6C8",
          dark: "#38383A",
        },
      },
    },
  },
  plugins: [],
};
