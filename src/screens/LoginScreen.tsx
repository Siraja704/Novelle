import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-3xl font-bold mb-8 text-primary">Welcome</Text>
      <TouchableOpacity
        className="w-full bg-primary p-4 rounded-lg mb-4"
        onPress={() => navigation.navigate("Onboarding")}
      >
        <Text className="text-white text-center font-semibold">
          Sign In with Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full bg-secondary p-4 rounded-lg"
        onPress={() => navigation.navigate("Onboarding")}
      >
        <Text className="text-white text-center font-semibold">
          Sign In with Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
