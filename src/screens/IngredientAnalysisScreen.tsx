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
  getProductIngredients,
  addProductIngredient,
  analyzeProductIngredients,
  getIngredientAnalysisHistory,
  Ingredient,
  IngredientAnalysis,
} from "../services/ingredients";
import { searchIngredients } from "../services/ingredients";

type Props = NativeStackScreenProps<RootStackParamList, "IngredientAnalysis">;

const IngredientAnalysisScreen: React.FC<Props> = ({ route }) => {
  const { productId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [ingredients, setIngredients] = useState<
    (Ingredient & { concentration?: string })[]
  >([]);
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productIngredients = await getProductIngredients(productId);
      setIngredients(productIngredients.map((pi) => pi.ingredient));
      const latestAnalysis = await getIngredientAnalysisHistory(productId);
      if (latestAnalysis.length > 0) {
        setAnalysis(latestAnalysis[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load ingredients");
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
          {analysis.analysis_result.compatibility.map((comp, index) => (
            <View
              key={index}
              style={[
                styles.compatibilityItem,
                { backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.ingredientName, { color: theme.text }]}>
                {comp.ingredient}
              </Text>
              <View
                style={[
                  styles.compatibilityBadge,
                  {
                    backgroundColor:
                      comp.compatibility === "good"
                        ? theme.success
                        : comp.compatibility === "moderate"
                        ? theme.primary
                        : theme.error,
                  },
                ]}
              >
                <Text style={styles.compatibilityText}>
                  {comp.compatibility}
                </Text>
              </View>
              <Text style={[styles.compatibilityReason, { color: theme.text }]}>
                {comp.reason}
              </Text>
            </View>
          ))}
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        {showSearch ? renderSearchResults() : renderIngredientList()}

        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
          onPress={handleAnalyze}
          disabled={analyzing || ingredients.length === 0}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Ingredients</Text>
          )}
        </TouchableOpacity>

        {renderAnalysis()}
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
});

export default IngredientAnalysisScreen;
