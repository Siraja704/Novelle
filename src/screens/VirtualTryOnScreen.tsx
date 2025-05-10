import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  processVirtualTryOn,
  getTryOnHistory,
  TryOnResult,
  VirtualTryOnError,
} from "../services/virtualTryOn";
import * as Sharing from "expo-sharing";

type Props = NativeStackScreenProps<RootStackParamList, "VirtualTryOn">;

const VirtualTryOnScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<TryOnResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    return () => {
      // Cleanup temporary files when component unmounts
      cleanupTempFiles();
    };
  }, []);

  const cleanupTempFiles = async () => {
    try {
      if (userImage) {
        await FileSystem.deleteAsync(userImage, { idempotent: true });
      }
      if (clothingImage) {
        await FileSystem.deleteAsync(clothingImage, { idempotent: true });
      }
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setError(null);
      const results = await getTryOnHistory();
      setHistory(results);
    } catch (error) {
      console.error("Error loading history:", error);
      if (error instanceof VirtualTryOnError) {
        setError(error.message);
      } else {
        setError("Failed to load history. Please try again.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const pickImage = async (type: "user" | "clothing") => {
    try {
      setError(null);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Clean up previous image if exists
        if (type === "user" && userImage) {
          await FileSystem.deleteAsync(userImage, { idempotent: true });
        } else if (type === "clothing" && clothingImage) {
          await FileSystem.deleteAsync(clothingImage, { idempotent: true });
        }

        if (type === "user") {
          setUserImage(result.assets[0].uri);
        } else {
          setClothingImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      if (error instanceof VirtualTryOnError) {
        setError(error.message);
      } else {
        setError("Failed to pick image. Please try again.");
      }
    }
  };

  const handleTryOn = async () => {
    if (!userImage || !clothingImage) {
      setError("Please select both user and clothing images");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await processVirtualTryOn(userImage, clothingImage);
      setResultImage(result.result_image_url);
      await loadHistory(); // Refresh history after new try-on
    } catch (error) {
      console.error("Error in virtual try-on:", error);
      if (error instanceof VirtualTryOnError) {
        setError(error.message);
      } else {
        setError("Failed to process virtual try-on. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!resultImage) {
      setError("No result image to share");
      return;
    }

    try {
      setError(null);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setError("Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(resultImage);
    } catch (error) {
      console.error("Error sharing image:", error);
      if (error instanceof VirtualTryOnError) {
        setError(error.message);
      } else {
        setError("Failed to share image. Please try again.");
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Virtual Try-On
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionText}>
            1. Select a photo of yourself
          </Text>
          <Text style={styles.instructionText}>2. Choose a clothing item</Text>
          <Text style={styles.instructionText}>
            3. Get your virtual try-on result!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Photo
          </Text>
          <TouchableOpacity
            style={[styles.imageContainer, { backgroundColor: theme.card }]}
            onPress={() => pickImage("user")}
            disabled={loading}
          >
            {userImage ? (
              <Image
                source={{ uri: userImage }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="person" size={48} color={theme.primary} />
                <Text
                  style={[styles.placeholderText, { color: theme.primary }]}
                >
                  Select Your Photo
                </Text>
                <Text
                  style={[
                    styles.placeholderSubtext,
                    { color: theme.secondary },
                  ]}
                >
                  Choose a clear photo of yourself
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Clothing Item
          </Text>
          <TouchableOpacity
            style={[styles.imageContainer, { backgroundColor: theme.card }]}
            onPress={() => pickImage("clothing")}
            disabled={loading}
          >
            {clothingImage ? (
              <Image
                source={{ uri: clothingImage }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="shirt" size={48} color={theme.primary} />
                <Text
                  style={[styles.placeholderText, { color: theme.primary }]}
                >
                  Select Clothing Item
                </Text>
                <Text
                  style={[
                    styles.placeholderSubtext,
                    { color: theme.secondary },
                  ]}
                >
                  Choose a clear photo of the clothing
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleTryOn}
          disabled={loading || !userImage || !clothingImage}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Try On</Text>
          )}
        </TouchableOpacity>

        {resultImage && (
          <View style={styles.resultSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Result
            </Text>
            <Image
              source={{ uri: resultImage }}
              style={styles.resultImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: theme.primary }]}
              onPress={handleShare}
            >
              <Text style={styles.buttonText}>Share Result</Text>
            </TouchableOpacity>
          </View>
        )}

        {historyLoading ? (
          <ActivityIndicator style={styles.loader} color={theme.primary} />
        ) : (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              History
            </Text>
            {history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Image
                  source={{ uri: item.result_image_url }}
                  style={styles.historyImage}
                  resizeMode="cover"
                />
                <Text style={[styles.historyDate, { color: theme.text }]}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
  },
  instructionsContainer: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionsTitle: {
    color: "#1e40af",
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionText: {
    color: "#1d4ed8",
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  imageContainer: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 192,
    borderRadius: 8,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultSection: {
    marginBottom: 24,
  },
  resultImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  shareButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loader: {
    marginVertical: 24,
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    marginBottom: 16,
  },
  historyImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
  },
});

export default VirtualTryOnScreen;
