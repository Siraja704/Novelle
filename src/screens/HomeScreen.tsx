import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => {
  const features = [
    {
      title: "Face Analysis",
      description: "Get personalized face shape analysis and recommendations",
      color: "bg-blue-500",
    },
    {
      title: "Skincare Routine",
      description: "Create and track your daily skincare routine",
      color: "bg-green-500",
    },
    {
      title: "Virtual Try-On",
      description: "Try on different styles and looks virtually",
      color: "bg-purple-500",
    },
    {
      title: "Fragrance Finder",
      description: "Discover your perfect scent match",
      color: "bg-pink-500",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-3xl font-bold text-primary mb-6">
          Welcome Back!
        </Text>

        <View className="space-y-4">
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              className={`${feature.color} p-4 rounded-lg`}
              onPress={() => {
                // Navigate to respective feature screen
                // navigation.navigate(feature.title.replace(/\s+/g, ''));
              }}
            >
              <Text className="text-xl font-bold text-white mb-2">
                {feature.title}
              </Text>
              <Text className="text-white opacity-90">
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
