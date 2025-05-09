/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FFFFFF",
          dark: "#1F2937",
        },
        text: {
          light: "#000000",
          dark: "#F9FAFB",
        },
        primary: {
          light: "#4F46E5",
          dark: "#6366F1",
        },
        secondary: {
          light: "#6B7280",
          dark: "#9CA3AF",
        },
        accent: {
          light: "#8B5CF6",
          dark: "#A78BFA",
        },
        card: {
          light: "#F3F4F6",
          dark: "#374151",
        },
        border: {
          light: "#E5E7EB",
          dark: "#4B5563",
        },
        error: {
          light: "#EF4444",
          dark: "#F87171",
        },
        success: {
          light: "#10B981",
          dark: "#34D399",
        },
        warning: {
          light: "#F59E0B",
          dark: "#FBBF24",
        },
      },
    },
  },
  plugins: [],
};
