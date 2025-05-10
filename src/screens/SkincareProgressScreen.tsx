import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import {
  getSkincareLogs,
  getSkincareRoutine,
  SkincareLog,
  SkincareRoutine,
} from "../services/skincare";

type Props = NativeStackScreenProps<RootStackParamList, "SkincareProgress">;

const SkincareProgressScreen: React.FC<Props> = ({ route }) => {
  const { routineId } = route.params;
  const { theme } = useTheme();
  const [logs, setLogs] = useState<SkincareLog[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    loadData();
  }, [routineId]);

  const loadData = async () => {
    try {
      const { routine } = await getSkincareRoutine(routineId);
      const logs = await getSkincareLogs(routineId);
      setRoutine(routine);
      setLogs(logs);
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  };

  const getFilteredLogs = () => {
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.completed_at);
      switch (timeRange) {
        case "week":
          return now.getTime() - logDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return now.getTime() - logDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        case "year":
          return now.getTime() - logDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
    return filteredLogs;
  };

  const getChartData = () => {
    const filteredLogs = getFilteredLogs();
    const skinConditionData = filteredLogs.map((log) => ({
      date: new Date(log.completed_at),
      value: log.skin_condition_rating || 0,
    }));

    const moodData = filteredLogs.map((log) => ({
      date: new Date(log.completed_at),
      value: log.mood_rating || 0,
    }));

    return {
      skinCondition: {
        labels: skinConditionData.map((d) =>
          d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
        datasets: [
          {
            data: skinConditionData.map((d) => d.value),
          },
        ],
      },
      mood: {
        labels: moodData.map((d) =>
          d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
        datasets: [
          {
            data: moodData.map((d) => d.value),
          },
        ],
      },
    };
  };

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => theme.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const screenWidth = Dimensions.get("window").width;

  const renderProgressReport = () => {
    const filteredLogs = getFilteredLogs();
    const totalLogs = filteredLogs.length;
    const avgSkinCondition =
      filteredLogs.reduce(
        (sum, log) => sum + (log.skin_condition_rating || 0),
        0
      ) / totalLogs || 0;
    const avgMood =
      filteredLogs.reduce((sum, log) => sum + (log.mood_rating || 0), 0) /
        totalLogs || 0;

    return (
      <View style={[styles.reportContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.reportTitle, { color: theme.text }]}>
          Progress Report
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {totalLogs}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Total Logs
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {avgSkinCondition.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Avg. Skin Condition
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {avgMood.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Avg. Mood
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {routine?.name} Progress
        </Text>

        <View style={styles.timeRangeContainer}>
          {(["week", "month", "year"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                {
                  backgroundColor:
                    timeRange === range ? theme.primary : theme.card,
                },
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  {
                    color: timeRange === range ? "#fff" : theme.text,
                  },
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderProgressReport()}

        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Skin Condition Trend
          </Text>
          <LineChart
            data={getChartData().skinCondition}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Mood Trend
          </Text>
          <LineChart
            data={getChartData().mood}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeRangeButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  reportContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  chartContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default SkincareProgressScreen;
