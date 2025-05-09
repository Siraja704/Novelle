/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        success: "#34C759",
        error: "#FF3B30",
        warning: "#FF9500",
        background: "#FFFFFF",
        card: "#F2F2F7",
        text: "#000000",
      },
    },
  },
  plugins: [],
};
