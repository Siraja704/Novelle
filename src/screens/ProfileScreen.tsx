import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MainTabScreenProps } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

type Props = MainTabScreenProps<"Profile">;

const ProfileScreen = ({ navigation }: Props) => {
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header Section */}
      <View className="p-4 bg-primary">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>

      {/* Profile Info Section */}
      <View className="p-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-gray-200 rounded-full mb-2">
              <Ionicons name="person" size={48} color="#666" />
            </View>
            <Text className="text-xl font-bold">John Doe</Text>
            <Text className="text-gray-600">john.doe@example.com</Text>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="flex-row items-center p-2">
              <Ionicons name="person-outline" size={24} color="#007AFF" />
              <Text className="ml-3 text-lg">Edit Profile</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
                className="ml-auto"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-2">
              <Ionicons name="analytics-outline" size={24} color="#007AFF" />
              <Text className="ml-3 text-lg">View History</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
                className="ml-auto"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-2">
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#007AFF"
              />
              <Text className="ml-3 text-lg">Notifications</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
                className="ml-auto"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View className="p-4">
        <Text className="text-xl font-semibold mb-4">Your Stats</Text>
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
    </ScrollView>
  );
};

export default ProfileScreen;
