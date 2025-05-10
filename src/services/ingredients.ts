import { supabase } from "../lib/supabase";

export interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  category: string;
  safety_rating: number;
  common_uses: string[];
  warnings: string[];
  created_at: string;
  updated_at: string;
}

export interface IngredientInteraction {
  id: string;
  ingredient_id: string;
  interacts_with_id: string;
  interaction_type: string;
  description: string | null;
  severity: "low" | "moderate" | "high";
  created_at: string;
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  ingredient_id: string;
  concentration: string | null;
  created_at: string;
}

export interface IngredientAnalysis {
  id: string;
  user_id: string;
  product_id: string;
  analysis_result: {
    compatibility: Array<{
      ingredient: string;
      compatibility: "good" | "moderate" | "poor";
      reason: string;
    }>;
  };
  warnings: string[];
  recommendations: string[];
  created_at: string;
}

// Get all ingredients
export const getIngredients = async (): Promise<Ingredient[]> => {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

// Get ingredient by ID
export const getIngredient = async (id: string): Promise<Ingredient> => {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Search ingredients
export const searchIngredients = async (
  query: string
): Promise<Ingredient[]> => {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name");

  if (error) throw error;
  return data;
};

// Get ingredient interactions
export const getIngredientInteractions = async (
  ingredientId: string
): Promise<IngredientInteraction[]> => {
  const { data, error } = await supabase
    .from("ingredient_interactions")
    .select("*")
    .or(
      `ingredient_id.eq.${ingredientId},interacts_with_id.eq.${ingredientId}`
    );

  if (error) throw error;
  return data;
};

// Add ingredient to product
export const addProductIngredient = async (
  productIngredient: Omit<ProductIngredient, "id" | "created_at">
): Promise<ProductIngredient> => {
  const { data, error } = await supabase
    .from("product_ingredients")
    .insert(productIngredient)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get product ingredients
export const getProductIngredients = async (
  productId: string
): Promise<(ProductIngredient & { ingredient: Ingredient })[]> => {
  const { data, error } = await supabase
    .from("product_ingredients")
    .select(
      `
      *,
      ingredient:ingredients(*)
    `
    )
    .eq("product_id", productId);

  if (error) throw error;
  return data;
};

// Analyze product ingredients
export const analyzeProductIngredients = async (
  productId: string
): Promise<IngredientAnalysis> => {
  // Get all ingredients for the product
  const productIngredients = await getProductIngredients(productId);
  const ingredients = productIngredients.map((pi) => pi.ingredient);

  // Get all interactions between the ingredients
  const interactions: IngredientInteraction[] = [];
  for (const ingredient of ingredients) {
    const ingredientInteractions = await getIngredientInteractions(
      ingredient.id
    );
    interactions.push(...ingredientInteractions);
  }

  // Analyze compatibility
  const compatibility = ingredients.map((ingredient) => {
    const ingredientInteractions = interactions.filter(
      (interaction) =>
        interaction.ingredient_id === ingredient.id ||
        interaction.interacts_with_id === ingredient.id
    );

    const severityCounts = {
      high: 0,
      moderate: 0,
      low: 0,
    };

    ingredientInteractions.forEach((interaction) => {
      severityCounts[interaction.severity]++;
    });

    let compatibility: "good" | "moderate" | "poor" = "good";
    let reason = "No significant interactions found.";

    if (severityCounts.high > 0) {
      compatibility = "poor";
      reason = "High severity interactions detected.";
    } else if (severityCounts.moderate > 0) {
      compatibility = "moderate";
      reason = "Moderate severity interactions detected.";
    }

    return {
      ingredient: ingredient.name,
      compatibility,
      reason,
    };
  });

  // Generate warnings and recommendations
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Add warnings for high severity interactions
  interactions
    .filter((interaction) => interaction.severity === "high")
    .forEach((interaction) => {
      const ingredient1 = ingredients.find(
        (i) => i.id === interaction.ingredient_id
      );
      const ingredient2 = ingredients.find(
        (i) => i.id === interaction.interacts_with_id
      );
      if (ingredient1 && ingredient2) {
        warnings.push(
          `High severity interaction between ${ingredient1.name} and ${ingredient2.name}: ${interaction.description}`
        );
      }
    });

  // Add warnings for ingredients with low safety ratings
  ingredients
    .filter((ingredient) => ingredient.safety_rating <= 2)
    .forEach((ingredient) => {
      warnings.push(
        `${ingredient.name} has a low safety rating (${ingredient.safety_rating}/5). Consider alternatives.`
      );
    });

  // Add recommendations based on ingredient properties
  ingredients.forEach((ingredient) => {
    if (ingredient.common_uses.length > 0) {
      recommendations.push(
        `${ingredient.name} is commonly used for: ${ingredient.common_uses.join(
          ", "
        )}`
      );
    }
  });

  // Create analysis record
  const { data, error } = await supabase
    .from("ingredient_analysis")
    .insert({
      product_id: productId,
      analysis_result: { compatibility },
      warnings,
      recommendations,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get ingredient analysis history
export const getIngredientAnalysisHistory = async (
  productId: string
): Promise<IngredientAnalysis[]> => {
  const { data, error } = await supabase
    .from("ingredient_analysis")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
