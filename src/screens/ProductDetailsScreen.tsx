import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetails">;

const ProductDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { theme, themeMode } = useTheme();
  const { productId } = route.params;

  const handleAnalyzeIngredients = () => {
    navigation.navigate("IngredientAnalysis", { productId });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-text mb-4">
          Product Details
        </Text>

        <View className="bg-card rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold text-text mb-2">
            Product ID
          </Text>
          <Text className="text-text">{productId}</Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-4"
          onPress={handleAnalyzeIngredients}
        >
          <Text className="text-white font-semibold">Analyze Ingredients</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProductDetailsScreen;
