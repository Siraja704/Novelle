import { supabase } from "./supabase";
import * as ImageManipulator from "expo-image-manipulator";

export interface TryOnResult {
  id: string;
  user_id: string;
  user_image_url: string;
  clothing_image_url: string;
  result_image_url: string;
  created_at: string;
}

export class VirtualTryOnError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "VirtualTryOnError";
  }
}

const SEGMIND_API_KEY = "SG_478d3dc2d3abf431";
const SEGMIND_API_URL = "https://api.segmind.com/v1/sd1.5/virtual-try-on";

const validateImage = async (uri: string): Promise<void> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Check file size (max 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new VirtualTryOnError(
        "Image size exceeds 10MB limit",
        "IMAGE_TOO_LARGE"
      );
    }

    // Check file type
    if (!blob.type.startsWith("image/")) {
      throw new VirtualTryOnError(
        "Invalid file type. Please upload an image",
        "INVALID_FILE_TYPE"
      );
    }
  } catch (error) {
    if (error instanceof VirtualTryOnError) {
      throw error;
    }
    throw new VirtualTryOnError("Failed to validate image", "VALIDATION_ERROR");
  }
};

const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    throw new VirtualTryOnError(
      "Failed to compress image",
      "COMPRESSION_ERROR"
    );
  }
};

export const processVirtualTryOn = async (
  userImageUri: string,
  clothingImageUri: string
): Promise<TryOnResult> => {
  try {
    // Compress images before validation
    const [compressedUserImage, compressedClothingImage] = await Promise.all([
      compressImage(userImageUri),
      compressImage(clothingImageUri),
    ]);

    // Validate images
    await Promise.all([
      validateImage(compressedUserImage),
      validateImage(compressedClothingImage),
    ]);

    // Convert images to base64
    const [userImageBase64, clothingImageBase64] = await Promise.all([
      convertImageToBase64(compressedUserImage),
      convertImageToBase64(compressedClothingImage),
    ]);

    // Upload original images to Supabase Storage
    const [userImageUrl, clothingImageUrl] = await Promise.all([
      uploadImage(userImageBase64, "user-images"),
      uploadImage(clothingImageBase64, "clothing-images"),
    ]);

    // Call Segmind API for virtual try-on
    const response = await fetch(SEGMIND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SEGMIND_API_KEY,
      },
      body: JSON.stringify({
        person_image: userImageBase64,
        clothing_image: clothingImageBase64,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new VirtualTryOnError(
        error.message || "Failed to process virtual try-on",
        "API_ERROR"
      );
    }

    // Get the result image as blob
    const resultBlob = await response.blob();
    const resultBase64 = await blobToBase64(resultBlob);

    // Upload result image
    const resultImageUrl = await uploadImage(resultBase64, "try-on-results");

    // Save try-on result to database
    const { data: result, error: dbError } = await supabase
      .from("virtual_try_on")
      .insert({
        user_image_url: userImageUrl,
        clothing_image_url: clothingImageUrl,
        result_image_url: resultImageUrl,
      })
      .select()
      .single();

    if (dbError) {
      throw new VirtualTryOnError(
        dbError.message || "Failed to save try-on result",
        "DATABASE_ERROR"
      );
    }

    return result;
  } catch (error) {
    console.error("Error in virtual try-on:", error);
    if (error instanceof VirtualTryOnError) {
      throw error;
    }
    throw new VirtualTryOnError(
      "An unexpected error occurred",
      "UNKNOWN_ERROR"
    );
  }
};

export const getTryOnHistory = async (): Promise<TryOnResult[]> => {
  try {
    const { data, error } = await supabase
      .from("virtual_try_on")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new VirtualTryOnError(
        error.message || "Failed to fetch try-on history",
        "FETCH_ERROR"
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching try-on history:", error);
    if (error instanceof VirtualTryOnError) {
      throw error;
    }
    throw new VirtualTryOnError(
      "Failed to fetch try-on history",
      "UNKNOWN_ERROR"
    );
  }
};

// Helper function to convert image URI to base64
const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(
          new VirtualTryOnError(
            "Failed to convert image to base64",
            "CONVERSION_ERROR"
          )
        );
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new VirtualTryOnError(
      "Failed to convert image to base64",
      "CONVERSION_ERROR"
    );
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(
        new VirtualTryOnError(
          "Failed to convert blob to base64",
          "CONVERSION_ERROR"
        )
      );
    reader.readAsDataURL(blob);
  });
};

// Helper function to upload image to Supabase Storage
const uploadImage = async (
  base64Image: string,
  bucket: string
): Promise<string> => {
  try {
    const fileName = `${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, base64Image, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new VirtualTryOnError(
        error.message || "Failed to upload image",
        "UPLOAD_ERROR"
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    if (error instanceof VirtualTryOnError) {
      throw error;
    }
    throw new VirtualTryOnError("Failed to upload image", "UPLOAD_ERROR");
  }
};
