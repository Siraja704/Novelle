import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { MainTabScreenProps } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

type Props = MainTabScreenProps<"Settings">;

const SettingsScreen = ({ navigation }: Props) => {
  const { theme, toggleTheme } = useTheme();

  const settingsSections = [
    {
      title: "Appearance",
      items: [
        {
          id: "theme",
          title: "Dark Mode",
          icon: theme === "dark" ? "moon" : "sunny",
          type: "toggle",
          value: theme === "dark",
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "Edit Profile",
          icon: "person",
          type: "link",
          onPress: () => navigation.navigate("Profile"),
        },
        {
          id: "notifications",
          title: "Notifications",
          icon: "notifications",
          type: "toggle",
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "language",
          title: "Language",
          icon: "language",
          type: "link",
          value: "English",
          onPress: () => {},
        },
        {
          id: "data",
          title: "Data Sync",
          icon: "sync",
          type: "toggle",
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help Center",
          icon: "help-circle",
          type: "link",
          onPress: () => {},
        },
        {
          id: "about",
          title: "About",
          icon: "information-circle",
          type: "link",
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header Section */}
      <View className="p-4 bg-primary">
        <Text className="text-2xl font-bold text-white">Settings</Text>
      </View>

      {/* Preferences Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Preferences</Text>
        <View className="bg-white rounded-lg shadow-sm">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#007AFF"
              />
              <Text className="ml-3 text-lg">Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notifications ? "#007AFF" : "#f4f3f4"}
            />
          </View>

          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={24} color="#007AFF" />
              <Text className="ml-3 text-lg">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={darkMode ? "#007AFF" : "#f4f3f4"}
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="sync-outline" size={24} color="#007AFF" />
              <Text className="ml-3 text-lg">Data Sync</Text>
            </View>
            <Switch
              value={dataSync}
              onValueChange={setDataSync}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={dataSync ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Account</Text>
        <View className="bg-white rounded-lg shadow-sm">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="person-outline" size={24} color="#007AFF" />
            <Text className="ml-3 text-lg">Edit Profile</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
              className="ml-auto"
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
            <Text className="ml-3 text-lg">Privacy Settings</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
              className="ml-auto"
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <Text className="ml-3 text-lg">Help & Support</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
              className="ml-auto"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <View className="p-4">
        <TouchableOpacity className="bg-red-500 p-4 rounded-lg">
          <Text className="text-white text-center font-semibold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
