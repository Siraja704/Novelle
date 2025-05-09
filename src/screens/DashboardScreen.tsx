import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MainTabScreenProps } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

type Props = MainTabScreenProps<"Dashboard">;

const DashboardScreen = ({ navigation }: Props) => {
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header Section */}
      <View className="p-4 bg-primary">
        <Text className="text-2xl font-bold text-white">Welcome Back!</Text>
        <Text className="text-white opacity-80">
          Track your progress and enhance your lifestyle
        </Text>
      </View>

      {/* Quick Stats Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Your Progress</Text>
        <View className="flex-row justify-between">
          <View className="bg-white p-4 rounded-lg w-[48%] shadow-sm">
            <Ionicons name="analytics-outline" size={24} color="#007AFF" />
            <Text className="text-lg font-bold mt-2">Face Analysis</Text>
            <Text className="text-gray-600">3 analyses</Text>
          </View>
          <View className="bg-white p-4 rounded-lg w-[48%] shadow-sm">
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <Text className="text-lg font-bold mt-2">Routines</Text>
            <Text className="text-gray-600">2 active</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Recent Activity</Text>
        <View className="bg-white rounded-lg shadow-sm">
          <TouchableOpacity
            className="p-4 border-b border-gray-100"
            onPress={() => navigation.navigate("FaceAnalysis")}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-full">
                <Ionicons name="camera-outline" size={20} color="#007AFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold">Face Analysis</Text>
                <Text className="text-gray-600 text-sm">
                  Last analysis: 2 days ago
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="p-4">
            <View className="flex-row items-center">
              <View className="bg-green-100 p-2 rounded-full">
                <Ionicons name="leaf-outline" size={20} color="#34C759" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold">Skincare Routine</Text>
                <Text className="text-gray-600 text-sm">
                  Next routine: Today
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity
            className="bg-white p-4 rounded-lg w-[48%] mb-4 shadow-sm"
            onPress={() => navigation.navigate("FaceAnalysis")}
          >
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text className="font-semibold mt-2">New Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-lg w-[48%] mb-4 shadow-sm">
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text className="font-semibold mt-2">Schedule Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-lg w-[48%] shadow-sm"
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
            <Text className="font-semibold mt-2">Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-lg w-[48%] shadow-sm"
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-outline" size={24} color="#007AFF" />
            <Text className="font-semibold mt-2">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
