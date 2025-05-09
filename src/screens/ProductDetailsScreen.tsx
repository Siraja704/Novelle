import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type ProductDetailsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface Product {
  id: string;
  name: string;
  // Add other product properties as needed
}

const ProductDetailsScreen = () => {
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const { theme } = useTheme();
  const [product, setProduct] = useState<Product>({ id: "", name: "" });

  const handleAnalyzeIngredients = () => {
    navigation.navigate("IngredientAnalysis", { productId: product.id });
  };

  return (
    <View className="flex-1 p-5" style={{ backgroundColor: theme.background }}>
      <TouchableOpacity
        className="flex-row items-center justify-center p-4 rounded-lg mt-2.5"
        style={{ backgroundColor: theme.primary }}
        onPress={handleAnalyzeIngredients}
      >
        <Ionicons name="flask" size={24} color="#fff" />
        <Text className="text-base font-semibold text-white ml-2">
          Analyze Ingredients
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductDetailsScreen;
