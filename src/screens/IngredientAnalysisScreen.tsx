import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  addProductIngredient,
  analyzeProductIngredients,
  getIngredientAnalysisHistory,
  Ingredient,
  IngredientAnalysis,
} from "../services/ingredients";
import { searchIngredients } from "../services/ingredients";
import { useRoute, useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "IngredientAnalysis">;

const renderCompatibility = (
  compatibility: IngredientAnalysis["analysis_result"]["compatibility"]
) => {
  return compatibility.map((item, index) => (
    <View key={index} className="mb-2">
      <Text className="text-text">
        <Text className="font-semibold">{item.ingredient}:</Text>{" "}
        {item.compatibility} - {item.reason}
      </Text>
    </View>
  ));
};

const IngredientAnalysisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { theme, themeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [ingredients, setIngredients] = useState<
    (Ingredient & { concentration?: string })[]
  >([]);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useState<IngredientAnalysis[]>([]);

  const productId = route.params.productId;

  useEffect(() => {
    if (!productId) {
      Alert.alert("Error", "Product ID is required");
      navigation.goBack();
      return;
    }

    loadAnalysis();
  }, [productId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const analysisResult = await analyzeProductIngredients(productId);
      const analysisHistory = await getIngredientAnalysisHistory(productId);

      setAnalysis(analysisResult);
      setHistory(analysisHistory);
    } catch (error) {
      Alert.alert("Error", "Failed to load ingredient analysis");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const results = await searchIngredients(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching ingredients:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddIngredient = async (ingredient: Ingredient) => {
    try {
      await addProductIngredient({
        product_id: productId,
        ingredient_id: ingredient.id,
        concentration: null,
      });
      setIngredients((prev) => [...prev, ingredient]);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      Alert.alert("Error", "Failed to add ingredient");
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const result = await analyzeProductIngredients(productId);
      setAnalysis(result);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze ingredients");
    } finally {
      setAnalyzing(false);
    }
  };

  const renderIngredientList = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Product Ingredients
      </Text>
      {ingredients.map((ingredient) => (
        <View
          key={ingredient.id}
          style={[styles.ingredientItem, { backgroundColor: theme.card }]}
        >
          <View style={styles.ingredientInfo}>
            <Text style={[styles.ingredientName, { color: theme.text }]}>
              {ingredient.name}
            </Text>
            <Text style={[styles.ingredientCategory, { color: theme.text }]}>
              {ingredient.category}
            </Text>
          </View>
          <View style={styles.safetyRating}>
            <Text
              style={[
                styles.ratingText,
                {
                  color:
                    ingredient.safety_rating >= 4
                      ? theme.success
                      : ingredient.safety_rating >= 3
                      ? theme.primary
                      : theme.error,
                },
              ]}
            >
              {ingredient.safety_rating}/5
            </Text>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowSearch(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Ingredient</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.card }]}
        placeholder="Search ingredients..."
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor={theme.text}
      />
      <ScrollView style={styles.searchResults}>
        {searchResults.map((ingredient) => (
          <TouchableOpacity
            key={ingredient.id}
            style={[styles.searchItem, { backgroundColor: theme.card }]}
            onPress={() => handleAddIngredient(ingredient)}
          >
            <Text style={[styles.searchItemName, { color: theme.text }]}>
              {ingredient.name}
            </Text>
            <Text style={[styles.searchItemCategory, { color: theme.text }]}>
              {ingredient.category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Analysis Results
        </Text>

        {analysis.warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            <Text style={[styles.warningTitle, { color: theme.error }]}>
              Warnings
            </Text>
            {analysis.warnings.map((warning, index) => (
              <View
                key={index}
                style={[styles.warningItem, { backgroundColor: theme.card }]}
              >
                <Ionicons name="warning" size={20} color={theme.error} />
                <Text style={[styles.warningText, { color: theme.text }]}>
                  {warning}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.compatibilityContainer}>
          <Text style={[styles.compatibilityTitle, { color: theme.text }]}>
            Ingredient Compatibility
          </Text>
          {renderCompatibility(analysis.analysis_result.compatibility)}
        </View>

        {analysis.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.text }]}>
              Recommendations
            </Text>
            {analysis.recommendations.map((rec, index) => (
              <View
                key={index}
                style={[
                  styles.recommendationItem,
                  { backgroundColor: theme.card },
                ]}
              >
                <Ionicons name="bulb" size={20} color={theme.primary} />
                <Text
                  style={[styles.recommendationText, { color: theme.text }]}
                >
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-text mb-4">
          Ingredient Analysis
        </Text>

        {showSearch ? renderSearchResults() : renderIngredientList()}

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-4"
          onPress={handleAnalyze}
          disabled={analyzing || ingredients.length === 0}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">
              Analyze Ingredients
            </Text>
          )}
        </TouchableOpacity>

        {renderAnalysis()}

        {history.length > 0 && (
          <View>
            <Text className="text-xl font-bold text-text mb-4">
              Analysis History
            </Text>
            {history.map((item, index) => (
              <View key={index} className="bg-card rounded-lg p-4 mb-4">
                <Text className="text-sm text-secondary mb-2">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                {renderCompatibility(item.analysis_result.compatibility)}
                {item.warnings.length > 0 && (
                  <View className="mt-2">
                    <Text className="text-sm font-semibold text-error mb-1">
                      Warnings:
                    </Text>
                    {item.warnings.map((warning, wIndex) => (
                      <Text key={wIndex} className="text-error text-sm mb-1">
                        • {warning}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mt-4"
          onPress={loadAnalysis}
        >
          <Text className="text-white font-semibold">Refresh Analysis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ingredientCategory: {
    fontSize: 14,
  },
  safetyRating: {
    marginLeft: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  searchResults: {
    maxHeight: 300,
  },
  searchItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  searchItemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  searchItemCategory: {
    fontSize: 14,
  },
  analyzeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  warningsContainer: {
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  compatibilityContainer: {
    marginBottom: 20,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  compatibilityItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  compatibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  compatibilityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  compatibilityReason: {
    fontSize: 14,
    marginTop: 5,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  historyItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  historyAnalysis: {
    fontSize: 14,
  },
  refreshButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default IngredientAnalysisScreen;
