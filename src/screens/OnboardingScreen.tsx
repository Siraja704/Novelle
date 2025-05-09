import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: "skinType",
      question: "What is your skin type?",
      options: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
    },
    {
      id: "concerns",
      question: "What are your main skin concerns?",
      options: ["Acne", "Aging", "Dark Spots", "Dryness", "Redness"],
    },
    {
      id: "style",
      question: "What is your preferred style?",
      options: ["Classic", "Modern", "Casual", "Elegant", "Sporty"],
    },
  ];

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep].id]: answer,
    }));

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save answers to backend and navigate to home
      navigation.navigate("Home");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-primary mb-8">
          {questions[currentStep].question}
        </Text>
        {questions[currentStep].options.map((option) => (
          <TouchableOpacity
            key={option}
            className="bg-white p-4 rounded-lg mb-4 shadow-sm"
            onPress={() => handleAnswer(option)}
          >
            <Text className="text-lg text-center">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default OnboardingScreen;
