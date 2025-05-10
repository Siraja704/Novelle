import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

interface ThemeColors {
  primary: string;
  success: string;
  error: string;
  warning: string;
  background: string;
  card: string;
  text: string;
  secondary: string;
  border: string;
}

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const lightTheme: ThemeColors = {
  primary: "#007AFF",
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
  background: "#FFFFFF",
  card: "#F2F2F7",
  text: "#000000",
  secondary: "#8E8E93",
  border: "#C6C6C8",
};

const darkTheme: ThemeColors = {
  primary: "#0A84FF",
  success: "#30D158",
  error: "#FF453A",
  warning: "#FF9F0A",
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  secondary: "#98989D",
  border: "#38383A",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    systemColorScheme || "light"
  );

  useEffect(() => {
    if (systemColorScheme) {
      setThemeMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = themeMode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider
      value={{ theme, themeMode, toggleTheme, setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
