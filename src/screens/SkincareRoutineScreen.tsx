import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import {
  SkincareRoutine,
  SkincareStep,
  createSkincareRoutine,
  addSkincareStep,
  getSkincareRoutine,
} from "../services/skincare";
import { generateAIRoutine, analyzeSkinCondition } from "../services/ai";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "SkincareRoutine">;

const skinTypes = [
  "Normal",
  "Dry",
  "Oily",
  "Combination",
  "Sensitive",
  "Acne-prone",
];

const productTypes = [
  "Cleanser",
  "Toner",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Mask",
  "Exfoliant",
  "Treatment",
];

const timeOfDay = ["Morning", "Evening", "Both"];

const SkincareRoutineScreen = ({ navigation, route }: Props) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [steps, setSteps] = useState<SkincareStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    skin_type: "",
    concerns: [] as string[],
  });
  const [stepData, setStepData] = useState({
    product_name: "",
    product_type: "",
    instructions: "",
    time_of_day: [] as string[],
    duration_minutes: "",
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [skinAnalysis, setSkinAnalysis] = useState<{
    analysis: string;
    recommendations: string[];
    compatibility: {
      product: string;
      compatibility: "good" | "moderate" | "poor";
    }[];
  } | null>(null);

  const navigationStack =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (route.params?.routineId) {
      loadRoutine(route.params.routineId);
    }
  }, [route.params?.routineId]);

  const loadRoutine = async (routineId: string) => {
    try {
      setLoading(true);
      const { routine, steps } = await getSkincareRoutine(routineId);
      setRoutine(routine);
      setSteps(steps);
      setFormData({
        name: routine.name,
        description: routine.description || "",
        skin_type: routine.skin_type,
        concerns: routine.concerns,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load routine");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepInputChange = (name: string, value: string) => {
    setStepData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeOfDayToggle = (time: string) => {
    setStepData((prev) => ({
      ...prev,
      time_of_day: prev.time_of_day.includes(time)
        ? prev.time_of_day.filter((t) => t !== time)
        : [...prev.time_of_day, time],
    }));
  };

  const handleCreateRoutine = async () => {
    if (!formData.name || !formData.skin_type) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const newRoutine = await createSkincareRoutine({
        name: formData.name,
        description: formData.description,
        skin_type: formData.skin_type,
        concerns: formData.concerns,
      });
      setRoutine(newRoutine);
      setCurrentStep(1);
    } catch (error) {
      Alert.alert("Error", "Failed to create routine");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (
      !stepData.product_name ||
      !stepData.product_type ||
      stepData.time_of_day.length === 0
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!routine) return;

    try {
      setLoading(true);
      const newStep = await addSkincareStep({
        routine_id: routine.id,
        step_number: steps.length + 1,
        product_name: stepData.product_name,
        product_type: stepData.product_type,
        instructions: stepData.instructions,
        time_of_day: stepData.time_of_day,
        duration_minutes: stepData.duration_minutes
          ? parseInt(stepData.duration_minutes)
          : undefined,
      });
      setSteps((prev) => [...prev, newStep]);
      setStepData({
        product_name: "",
        product_type: "",
        instructions: "",
        time_of_day: [],
        duration_minutes: "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to add step");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIRoutine = async () => {
    if (!formData.skin_type) {
      Alert.alert("Error", "Please select your skin type first");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const recommendation = await generateAIRoutine(
        formData.skin_type,
        formData.concerns,
        {
          timeOfDay: ["Morning", "Evening"],
          productTypes: productTypes,
          duration: 30,
        }
      );

      setFormData({
        name: recommendation.routine.name,
        description: recommendation.routine.description,
        skin_type: recommendation.routine.skin_type,
        concerns: recommendation.routine.concerns,
      });

      // Create the routine
      const newRoutine = await createSkincareRoutine({
        name: recommendation.routine.name,
        description: recommendation.routine.description,
        skin_type: recommendation.routine.skin_type,
        concerns: recommendation.routine.concerns,
      });

      setRoutine(newRoutine);

      // Add all steps
      for (const step of recommendation.steps) {
        const newStep = await addSkincareStep({
          routine_id: newRoutine.id,
          step_number: step.step_number,
          product_name: step.product_name,
          product_type: step.product_type,
          instructions: step.instructions,
          time_of_day: step.time_of_day,
          duration_minutes: step.duration_minutes,
        });
        setSteps((prev) => [...prev, newStep]);
      }

      // Get skin analysis
      const analysis = await analyzeSkinCondition(
        formData.skin_type,
        formData.concerns,
        newRoutine
      );
      setSkinAnalysis(analysis);

      Alert.alert(
        "Success",
        "AI-generated routine created successfully! Check the analysis tab for detailed recommendations."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate AI routine");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSchedulePress = () => {
    if (route.params?.routineId) {
      navigationStack.navigate("SkincareSchedule", {
        routineId: route.params.routineId,
      });
    }
  };

  const handleProgressPress = () => {
    if (route.params?.routineId) {
      navigationStack.navigate("SkincareProgress", {
        routineId: route.params.routineId,
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-3xl font-bold text-primary mb-6">
          {routine ? "Edit Routine" : "Create Routine"}
        </Text>

        {!routine ? (
          // Routine Creation Form
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2">Routine Name</Text>
              <TextInput
                className="bg-white p-4 rounded-lg border border-gray-200"
                placeholder="Enter routine name"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Description</Text>
              <TextInput
                className="bg-white p-4 rounded-lg border border-gray-200"
                placeholder="Enter routine description"
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                multiline
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Skin Type</Text>
              <View className="flex-row flex-wrap">
                {skinTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`p-2 rounded-full mr-2 mb-2 ${
                      formData.skin_type === type ? "bg-primary" : "bg-gray-200"
                    }`}
                    onPress={() => handleInputChange("skin_type", type)}
                  >
                    <Text
                      className={
                        formData.skin_type === type
                          ? "text-white"
                          : "text-gray-700"
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary p-4 rounded-lg mt-4"
              onPress={handleCreateRoutine}
            >
              <Text className="text-white text-center font-semibold">
                Create Routine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 p-4 rounded-lg mt-4"
              onPress={handleGenerateAIRoutine}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Generate AI Routine
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Steps Management
          <View className="space-y-6">
            <View className="bg-white p-4 rounded-lg">
              <Text className="text-xl font-bold mb-2">{routine.name}</Text>
              <Text className="text-gray-600">{routine.description}</Text>
              <Text className="text-gray-600 mt-2">
                Skin Type: {routine.skin_type}
              </Text>
            </View>

            {steps.map((step, index) => (
              <View key={step.id} className="bg-white p-4 rounded-lg">
                <Text className="text-lg font-bold mb-2">
                  Step {index + 1}: {step.product_name}
                </Text>
                <Text className="text-gray-600">Type: {step.product_type}</Text>
                {step.instructions && (
                  <Text className="text-gray-600 mt-2">
                    Instructions: {step.instructions}
                  </Text>
                )}
                <Text className="text-gray-600 mt-2">
                  Time: {step.time_of_day.join(", ")}
                </Text>
                {step.duration_minutes && (
                  <Text className="text-gray-600">
                    Duration: {step.duration_minutes} minutes
                  </Text>
                )}
              </View>
            ))}

            {skinAnalysis && (
              <View className="bg-white p-4 rounded-lg">
                <Text className="text-xl font-bold mb-4">Skin Analysis</Text>
                <Text className="text-gray-600 mb-4">
                  {skinAnalysis.analysis}
                </Text>

                <Text className="text-lg font-semibold mb-2">
                  Recommendations
                </Text>
                {skinAnalysis.recommendations.map((rec, index) => (
                  <Text key={index} className="text-gray-600 mb-2">
                    • {rec}
                  </Text>
                ))}

                <Text className="text-lg font-semibold mt-4 mb-2">
                  Product Compatibility
                </Text>
                {skinAnalysis.compatibility.map((comp, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between mb-2"
                  >
                    <Text className="text-gray-600">{comp.product}</Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        comp.compatibility === "good"
                          ? "bg-green-100"
                          : comp.compatibility === "moderate"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`${
                          comp.compatibility === "good"
                            ? "text-green-800"
                            : comp.compatibility === "moderate"
                            ? "text-yellow-800"
                            : "text-red-800"
                        }`}
                      >
                        {comp.compatibility}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View className="space-y-4">
              <Text className="text-xl font-bold">Add New Step</Text>

              <View>
                <Text className="text-gray-700 mb-2">Product Name</Text>
                <TextInput
                  className="bg-white p-4 rounded-lg border border-gray-200"
                  placeholder="Enter product name"
                  value={stepData.product_name}
                  onChangeText={(value) =>
                    handleStepInputChange("product_name", value)
                  }
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Product Type</Text>
                <View className="flex-row flex-wrap">
                  {productTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`p-2 rounded-full mr-2 mb-2 ${
                        stepData.product_type === type
                          ? "bg-primary"
                          : "bg-gray-200"
                      }`}
                      onPress={() =>
                        handleStepInputChange("product_type", type)
                      }
                    >
                      <Text
                        className={
                          stepData.product_type === type
                            ? "text-white"
                            : "text-gray-700"
                        }
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Instructions</Text>
                <TextInput
                  className="bg-white p-4 rounded-lg border border-gray-200"
                  placeholder="Enter instructions"
                  value={stepData.instructions}
                  onChangeText={(value) =>
                    handleStepInputChange("instructions", value)
                  }
                  multiline
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Time of Day</Text>
                <View className="flex-row">
                  {timeOfDay.map((time) => (
                    <TouchableOpacity
                      key={time}
                      className={`p-2 rounded-full mr-2 ${
                        stepData.time_of_day.includes(time)
                          ? "bg-primary"
                          : "bg-gray-200"
                      }`}
                      onPress={() => handleTimeOfDayToggle(time)}
                    >
                      <Text
                        className={
                          stepData.time_of_day.includes(time)
                            ? "text-white"
                            : "text-gray-700"
                        }
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Duration (minutes)</Text>
                <TextInput
                  className="bg-white p-4 rounded-lg border border-gray-200"
                  placeholder="Enter duration"
                  value={stepData.duration_minutes}
                  onChangeText={(value) =>
                    handleStepInputChange("duration_minutes", value)
                  }
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className="bg-primary p-4 rounded-lg mt-4"
                onPress={handleAddStep}
              >
                <Text className="text-white text-center font-semibold">
                  Add Step
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSchedulePress}
          >
            <Text style={styles.buttonText}>Schedule Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleProgressPress}
          >
            <Text style={styles.buttonText}>View Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SkincareRoutineScreen;
