import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

type OnboardingStep = {
  title: string;
  description: string;
  fields: {
    name: string;
    placeholder: string;
    type: "text" | "email" | "password";
    required: boolean;
  }[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Create Account",
    description: "Let's get started with your account",
    fields: [
      {
        name: "email",
        placeholder: "Enter your email",
        type: "email",
        required: true,
      },
      {
        name: "password",
        placeholder: "Create a password",
        type: "password",
        required: true,
      },
    ],
  },
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    fields: [
      {
        name: "fullName",
        placeholder: "Enter your full name",
        type: "text",
        required: true,
      },
      {
        name: "age",
        placeholder: "Enter your age",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Preferences",
    description: "Help us personalize your experience",
    fields: [
      {
        name: "skinType",
        placeholder: "What's your skin type?",
        type: "text",
        required: true,
      },
      {
        name: "concerns",
        placeholder: "What are your main concerns?",
        type: "text",
        required: false,
      },
    ],
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    const currentFields = onboardingSteps[currentStep].fields;
    const missingFields = currentFields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.name);

    if (missingFields.length > 0) {
      Alert.alert("Error", `Please fill in: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === onboardingSteps.length - 1) {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              age: formData.age,
              skin_type: formData.skinType,
              concerns: formData.concerns,
            },
          },
        });

        if (error) throw error;

        navigation.replace("MainApp");
      } catch (error: any) {
        Alert.alert(
          "Error",
          error?.message || "An error occurred during sign up"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Progress Indicator */}
        <View className="flex-row justify-between mb-8">
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              className={`h-1 flex-1 mx-1 rounded-full ${
                index <= currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-primary">
            {currentStepData.title}
          </Text>
          <Text className="text-gray-600 mt-2">
            {currentStepData.description}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          {currentStepData.fields.map((field) => (
            <View key={field.name}>
              <Text className="text-gray-700 mb-2 capitalize">
                {field.name}
              </Text>
              <TextInput
                className="bg-white p-4 rounded-lg border border-gray-200"
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChangeText={(value) => handleInputChange(field.name, value)}
                secureTextEntry={field.type === "password"}
                keyboardType={
                  field.type === "email" ? "email-address" : "default"
                }
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-8">
          <TouchableOpacity
            className="bg-gray-200 p-4 rounded-lg w-[48%]"
            onPress={handleBack}
          >
            <Text className="text-center font-semibold">
              {currentStep === 0 ? "Back to Login" : "Back"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary p-4 rounded-lg w-[48%]"
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                {currentStep === onboardingSteps.length - 1
                  ? "Create Account"
                  : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default OnboardingScreen;
