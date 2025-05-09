import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { getSkincareRoutines, SkincareRoutine } from "../services/skincare";
import { useTheme } from "../context/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "SkincareRoutineList">;

const SkincareRoutineListScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<SkincareRoutine[]>([]);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const routines = await getSkincareRoutines();
      setRoutines(routines);
    } catch (error) {
      Alert.alert("Error", "Failed to load routines");
    } finally {
      setLoading(false);
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
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-primary">My Routines</Text>
          <TouchableOpacity
            className="bg-primary p-2 rounded-full"
            onPress={() => navigation.navigate("SkincareRoutine")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Ionicons name="skull-outline" size={48} color="#666" />
            <Text className="text-gray-600 mt-4 text-center">
              No routines yet. Create your first skincare routine!
            </Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-lg mt-4"
              onPress={() => navigation.navigate("SkincareRoutine")}
            >
              <Text className="text-white font-semibold">Create Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {routines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                className="bg-white p-4 rounded-lg shadow-sm"
                onPress={() =>
                  navigation.navigate("SkincareRoutine", {
                    routineId: routine.id,
                  })
                }
              >
                <Text className="text-xl font-bold mb-2">{routine.name}</Text>
                {routine.description && (
                  <Text className="text-gray-600 mb-2">
                    {routine.description}
                  </Text>
                )}
                <View className="flex-row items-center">
                  <Ionicons name="water-outline" size={16} color="#666" />
                  <Text className="text-gray-600 ml-2">
                    {routine.skin_type}
                  </Text>
                </View>
                {routine.concerns.length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {routine.concerns.map((concern, index) => (
                      <View
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-gray-600 text-sm">{concern}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SkincareRoutineListScreen;
