import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MainApp">;

type FeatureScreen = keyof RootStackParamList | "Home";

const HomeScreen = ({ navigation }: Props) => {
  const features = [
    {
      title: "Face Analysis",
      description: "Get personalized face shape analysis and recommendations",
      color: "bg-blue-500",
      screen: "FaceAnalysis" as const,
    },
    {
      title: "Skincare Routine",
      description: "Create and track your daily skincare routine",
      color: "bg-green-500",
      screen: "SkincareRoutineList" as const,
    },
    {
      title: "Virtual Try-On",
      description: "Try on different styles and looks virtually",
      color: "bg-purple-500",
      screen: "Home" as const,
    },
    {
      title: "Fragrance Finder",
      description: "Discover your perfect scent match",
      color: "bg-pink-500",
      screen: "Home" as const,
    },
  ];

  const handleNavigation = (screen: FeatureScreen) => {
    if (screen === "Home") {
      // Handle home navigation
      return;
    }
    if (screen === "SkincareRoutine") {
      navigation.navigate("SkincareRoutine", { routineId: undefined });
    } else {
      navigation.navigate(screen);
    }
  };

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
              onPress={() => handleNavigation(feature.screen)}
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
