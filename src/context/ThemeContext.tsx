import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ThemeType {
  mode: "light" | "dark";
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  error: string;
  success: string;
}

const lightTheme: ThemeType = {
  mode: "light",
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#F2F2F7",
  card: "#FFFFFF",
  text: "#000000",
  border: "#C6C6C8",
  error: "#FF3B30",
  success: "#34C759",
};

const darkTheme: ThemeType = {
  mode: "dark",
  primary: "#0A84FF",
  secondary: "#5E5CE6",
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  border: "#38383A",
  error: "#FF453A",
  success: "#32D74B",
};

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme) as ThemeType;
        setTheme(parsedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.mode === "light" ? darkTheme : lightTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", JSON.stringify(newTheme));
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
