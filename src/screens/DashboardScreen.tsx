import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MainTabScreenProps } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

type Props = MainTabScreenProps<"Dashboard">;

const DashboardScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVirtualTryOn = async () => {
    try {
      setLoading(true);
      setError(null);
      navigation.navigate("VirtualTryOn");
    } catch (error) {
      console.error("Error navigating to Virtual Try-On:", error);
      setError("Failed to open Virtual Try-On. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Welcome Back!</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and enhance your lifestyle
        </Text>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="analytics-outline" size={24} color="#007AFF" />
            <Text style={styles.statTitle}>Face Analysis</Text>
            <Text style={styles.statSubtitle}>3 analyses</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <Text style={styles.statTitle}>Routines</Text>
            <Text style={styles.statSubtitle}>2 active</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => navigation.navigate("FaceAnalysis")}
          >
            <View style={styles.activityContent}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={theme.primary}
                />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Face Analysis</Text>
                <Text style={styles.activitySubtitle}>
                  Last analysis: 2 days ago
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activityItem}>
            <View style={styles.activityContent}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}
              >
                <Ionicons name="leaf-outline" size={20} color={theme.success} />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Skincare Routine</Text>
                <Text style={styles.activitySubtitle}>Next routine: Today</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("FaceAnalysis")}
          >
            <Ionicons name="camera" size={24} color={theme.primary} />
            <Text style={styles.actionTitle}>New Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleVirtualTryOn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <Ionicons name="shirt" size={24} color={theme.primary} />
                <Text style={styles.actionTitle}>Virtual Try-On</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={24} color={theme.primary} />
            <Text style={styles.actionTitle}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-outline" size={24} color={theme.primary} />
            <Text style={styles.actionTitle}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    color: "white",
    opacity: 0.8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  statSubtitle: {
    color: "#666",
  },
  activityContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontWeight: "600",
  },
  activitySubtitle: {
    color: "#666",
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontWeight: "600",
    marginTop: 8,
  },
});

export default DashboardScreen;
