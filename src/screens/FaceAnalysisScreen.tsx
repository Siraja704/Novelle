import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeFace, FaceAnalysisResult } from "../services/faceAnalysis";

type Props = NativeStackScreenProps<RootStackParamList, "FaceAnalysis">;

const FaceAnalysisScreen = ({ navigation }: Props) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeFaceImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Camera Permission",
        "Please grant camera permission to take photos.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeFaceImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const analyzeFaceImage = async (imageUri: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFace(imageUri);
      setAnalysisResult(result);
    } catch (error) {
      setError("Failed to analyze face. Please try again.");
      console.error("Error analyzing face:", error);
      Alert.alert(
        "Analysis Error",
        "Failed to analyze face. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-3xl font-bold text-primary mb-6">
          Face Analysis
        </Text>

        {image ? (
          <View className="items-center mb-4">
            <Image
              source={{ uri: image }}
              className="w-64 h-64 rounded-lg mb-4"
            />
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : analysisResult ? (
              <View className="w-full">
                <View className="bg-white p-4 rounded-lg mb-4">
                  <Text className="text-xl font-bold mb-2">
                    Face Shape: {analysisResult.faceShape}
                  </Text>
                  <Text className="text-gray-600 mb-4">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </Text>

                  <Text className="text-lg font-semibold mb-2">
                    Recommendations:
                  </Text>
                  {analysisResult.recommendations.map((rec, index) => (
                    <Text key={index} className="text-gray-600 mb-1">
                      • {rec}
                    </Text>
                  ))}

                  {analysisResult.imageUrl && (
                    <Text className="text-sm text-gray-500 mt-4">
                      Image saved to your profile
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-primary p-4 rounded-lg"
                  onPress={resetAnalysis}
                >
                  <Text className="text-white text-center font-semibold">
                    Analyze Another Photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : error ? (
              <View className="items-center">
                <Text className="text-red-500 mb-4">{error}</Text>
                <TouchableOpacity
                  className="bg-primary p-4 rounded-lg"
                  onPress={resetAnalysis}
                >
                  <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="space-y-4">
            <TouchableOpacity
              className="bg-primary p-4 rounded-lg"
              onPress={takePhoto}
            >
              <Text className="text-white text-center font-semibold">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary p-4 rounded-lg"
              onPress={pickImage}
            >
              <Text className="text-white text-center font-semibold">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default FaceAnalysisScreen;
