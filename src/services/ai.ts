import { SkincareRoutine, SkincareStep } from "./skincare";
import { API_CONFIG } from "../config/api";

const OPENROUTER_API_KEY = API_CONFIG.OPENROUTER.API_KEY;
const OPENROUTER_API_URL = API_CONFIG.OPENROUTER.API_URL;

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "OpenRouter API key is not configured. Please add it to src/config/api.ts"
  );
}

interface AIRecommendation {
  routine: {
    name: string;
    description: string;
    skin_type: string;
    concerns: string[];
  };
  steps: Array<{
    step_number: number;
    product_name: string;
    product_type: string;
    instructions: string;
    time_of_day: string[];
    duration_minutes?: number;
  }>;
}

export const generateAIRoutine = async (
  skinType: string,
  concerns: string[],
  preferences?: {
    timeOfDay?: string[];
    productTypes?: string[];
    duration?: number;
  }
): Promise<AIRecommendation> => {
  const prompt = `Generate a personalized skincare routine for someone with ${skinType} skin type and the following concerns: ${concerns.join(
    ", "
  )}. ${
    preferences
      ? `Consider these preferences: Time of day: ${preferences.timeOfDay?.join(
          ", "
        )}, Preferred product types: ${preferences.productTypes?.join(
          ", "
        )}, Maximum duration per step: ${preferences.duration} minutes.`
      : ""
  } Format the response as a JSON object with the following structure:
  {
    "routine": {
      "name": "string",
      "description": "string",
      "skin_type": "string",
      "concerns": ["string"]
    },
    "steps": [
      {
        "step_number": number,
        "product_name": "string",
        "product_type": "string",
        "instructions": "string",
        "time_of_day": ["string"],
        "duration_minutes": number
      }
    ]
  }`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/Siraja704/Novelle",
        "X-Title": "Novelle - Lifestyle Enhancement App",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content:
              "You are a skincare expert AI assistant. Provide detailed, personalized skincare routine recommendations based on the user's skin type and concerns. Include specific product types, application instructions, and timing for each step.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate AI recommendation");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const recommendation = JSON.parse(content) as AIRecommendation;

    return recommendation;
  } catch (error) {
    console.error("Error generating AI routine:", error);
    throw error;
  }
};

export const analyzeSkinCondition = async (
  skinType: string,
  concerns: string[],
  currentRoutine?: SkincareRoutine
): Promise<{
  analysis: string;
  recommendations: string[];
  compatibility: {
    product: string;
    compatibility: "good" | "moderate" | "poor";
  }[];
}> => {
  const prompt = `Analyze the skin condition for someone with ${skinType} skin type and the following concerns: ${concerns.join(
    ", "
  )}. ${
    currentRoutine
      ? `Current routine: ${currentRoutine.name} - ${currentRoutine.description}`
      : ""
  } Provide a detailed analysis and recommendations. Format the response as a JSON object with the following structure:
  {
    "analysis": "string",
    "recommendations": ["string"],
    "compatibility": [
      {
        "product": "string",
        "compatibility": "good" | "moderate" | "poor"
      }
    ]
  }`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/Siraja704/Novelle",
        "X-Title": "Novelle - Lifestyle Enhancement App",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content:
              "You are a skincare expert AI assistant. Provide detailed analysis of skin conditions and make personalized recommendations. Consider product compatibility and potential interactions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze skin condition");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const analysis = JSON.parse(content);

    return analysis;
  } catch (error) {
    console.error("Error analyzing skin condition:", error);
    throw error;
  }
};
