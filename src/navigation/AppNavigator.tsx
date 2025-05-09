import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens (we'll create these next)
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import FaceAnalysisScreen from "../screens/FaceAnalysisScreen";

// Define the root stack parameter list
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Home: undefined;
  FaceAnalysis: undefined;
  // Add more screens here as we develop them
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FaceAnalysis" component={FaceAnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
