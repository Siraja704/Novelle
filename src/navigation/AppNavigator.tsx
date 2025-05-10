import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// Import screens
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import FaceAnalysisScreen from "../screens/FaceAnalysisScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SkincareRoutineScreen from "../screens/SkincareRoutineScreen";
import SkincareRoutineListScreen from "../screens/SkincareRoutineListScreen";
import SkincareScheduleScreen from "../screens/SkincareScheduleScreen";
import SkincareProgressScreen from "../screens/SkincareProgressScreen";
import IngredientAnalysisScreen from "../screens/IngredientAnalysisScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import VirtualTryOnScreen from "../screens/VirtualTryOnScreen";

// Define the root stack parameter list
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainApp: undefined;
  FaceAnalysis: undefined;
  SkincareRoutine: { routineId?: string };
  SkincareRoutineList: undefined;
  SkincareSchedule: { routineId: string };
  SkincareProgress: { routineId: string };
  IngredientAnalysis: { productId: string };
  ProductDetails: { productId: string };
  VirtualTryOn: undefined;
};

// Define the main app tab parameter list
export type MainTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Define composite screen props for nested navigation
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

const MainAppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

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
        <Stack.Screen name="MainApp" component={MainAppNavigator} />
        <Stack.Screen name="FaceAnalysis" component={FaceAnalysisScreen} />
        <Stack.Screen
          name="SkincareRoutine"
          component={SkincareRoutineScreen}
        />
        <Stack.Screen
          name="SkincareRoutineList"
          component={SkincareRoutineListScreen}
        />
        <Stack.Screen
          name="SkincareSchedule"
          component={SkincareScheduleScreen}
          options={{
            title: "Schedule Routine",
          }}
        />
        <Stack.Screen
          name="SkincareProgress"
          component={SkincareProgressScreen}
          options={{
            title: "Progress Tracking",
          }}
        />
        <Stack.Screen
          name="IngredientAnalysis"
          component={IngredientAnalysisScreen}
          options={{ title: "Ingredient Analysis" }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ title: "Product Details" }}
        />
        <Stack.Screen
          name="VirtualTryOn"
          component={VirtualTryOnScreen}
          options={{ title: "Virtual Try-On" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
