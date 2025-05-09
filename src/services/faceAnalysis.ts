import { supabase } from "./supabase";

export interface FaceAnalysisResult {
  faceShape: string;
  landmarks: number[][];
  confidence: number;
  recommendations: string[];
  imageUrl: string;
}

export const analyzeFace = async (
  imageUri: string
): Promise<FaceAnalysisResult> => {
  try {
    // Convert image to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const reader = new FileReader();

    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

    reader.readAsDataURL(blob);
    const base64Image = await base64Promise;

    // Upload image to Supabase Storage
    const fileName = `face-analysis/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    // Call Supabase Edge Function for face analysis
    const { data, error } = await supabase.functions.invoke("analyze-face", {
      body: { image: base64Image },
    });

    if (error) throw error;

    // Save analysis results to database
    const { error: dbError } = await supabase.from("face_analysis").insert({
      image_url: publicUrl,
      face_shape: data.faceShape,
      landmarks: data.landmarks,
      confidence: data.confidence,
      recommendations: data.recommendations,
    });

    if (dbError) throw dbError;

    return {
      ...data,
      imageUrl: publicUrl,
    } as FaceAnalysisResult;
  } catch (error) {
    console.error("Error in face analysis:", error);
    throw error;
  }
};

// Helper function to determine face shape based on landmarks
export const determineFaceShape = (landmarks: number[][]): string => {
  // This is a simplified version. In a real implementation,
  // you would use more sophisticated algorithms to determine face shape
  const faceWidth = Math.abs(landmarks[0][0] - landmarks[16][0]);
  const faceHeight = Math.abs(landmarks[8][1] - landmarks[27][1]);
  const jawWidth = Math.abs(landmarks[4][0] - landmarks[12][0]);
  const foreheadWidth = Math.abs(landmarks[17][0] - landmarks[26][0]);

  const ratio = faceHeight / faceWidth;
  const jawRatio = jawWidth / faceWidth;
  const foreheadRatio = foreheadWidth / faceWidth;

  if (ratio > 1.5) return "Oblong";
  if (jawRatio < 0.8) return "Heart";
  if (jawRatio > 0.9 && foreheadRatio < 0.8) return "Round";
  if (jawRatio > 0.9 && foreheadRatio > 0.9) return "Square";
  return "Oval";
};

// Get recommendations based on face shape
export const getRecommendations = (faceShape: string): string[] => {
  const recommendations: Record<string, string[]> = {
    Oval: [
      "Most hairstyles suit oval faces",
      "Try side-swept bangs",
      "Experiment with different lengths",
    ],
    Round: [
      "Add height to the crown",
      "Try angular cuts",
      "Avoid round styles",
    ],
    Square: ["Soft layers work well", "Try side parts", "Avoid straight bangs"],
    Heart: [
      "Chin-length styles work well",
      "Try side-swept bangs",
      "Avoid styles that add width at the top",
    ],
    Oblong: [
      "Try bangs",
      "Medium-length styles work well",
      "Avoid very long styles",
    ],
  };

  return recommendations[faceShape] || [];
};
