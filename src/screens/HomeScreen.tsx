import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { MainTabScreenProps } from "../navigation/AppNavigator";

type Props = MainTabScreenProps<"Dashboard">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();

  const features = [
    {
      title: "Face Analysis",
      description: "Analyze your skin condition",
      color: theme.primary,
      screen: "FaceAnalysis" as const,
    },
    {
      title: "Skincare Routines",
      description: "Manage your skincare routines",
      color: theme.success,
      screen: "SkincareRoutineList" as const,
    },
    {
      title: "Virtual Try-On",
      description: "Try on clothes virtually",
      color: theme.warning,
      screen: "VirtualTryOn" as const,
    },
  ];

  const handleNavigation = (screen: (typeof features)[number]["screen"]) => {
    navigation.navigate(screen);
  };

  const handleProductPress = () => {
    // For testing, we'll use a hardcoded product ID
    navigation.navigate("ProductDetails", { productId: "test-product-1" });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-text mb-4">Home</Text>

        <View className="flex-row flex-wrap justify-between">
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] bg-card rounded-lg p-4 mb-4"
              onPress={() => handleNavigation(feature.screen)}
            >
              <Text className="text-lg font-semibold text-text mb-2">
                {feature.title}
              </Text>
              <Text className="text-secondary">{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-4"
          onPress={handleProductPress}
        >
          <Text className="text-white font-semibold">View Product Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
