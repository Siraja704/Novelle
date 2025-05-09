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

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigation.replace("MainApp");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("Onboarding");
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="items-center mt-12 mb-8">
          <Text className="text-3xl font-bold text-primary">Welcome Back!</Text>
          <Text className="text-gray-600 mt-2">Sign in to continue</Text>
        </View>

        {/* Login Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity className="items-end">
            <Text className="text-primary">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary p-4 rounded-lg mt-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Social Login */}
          <View className="mt-8">
            <Text className="text-center text-gray-600 mb-4">
              Or continue with
            </Text>
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="bg-white p-4 rounded-lg border border-gray-200">
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white p-4 rounded-lg border border-gray-200">
                <Ionicons name="logo-apple" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
