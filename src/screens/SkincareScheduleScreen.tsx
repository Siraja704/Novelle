import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  getSkincareSchedules,
  createSkincareSchedule,
  updateSkincareSchedule,
  deleteSkincareSchedule,
  SkincareSchedule,
} from "../services/skincare";
import {
  requestNotificationPermissions,
  scheduleNotification,
  cancelNotification,
} from "../services/notifications";
import * as Notifications from "expo-notifications";

type Props = NativeStackScreenProps<RootStackParamList, "SkincareSchedule">;

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SkincareScheduleScreen: React.FC<Props> = ({ route }) => {
  const { routineId } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSchedules();
    requestNotificationPermissions().catch((error) => {
      Alert.alert("Error", "Failed to request notification permissions");
    });
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await getSkincareSchedules(routineId);
      setSchedules(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleCreateSchedule = async () => {
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    try {
      const schedule = await createSkincareSchedule({
        routine_id: routineId,
        time_of_day: selectedTime.toTimeString().split(" ")[0],
        days_of_week: selectedDays,
        is_active: true,
      });

      // Schedule notifications for each selected day
      for (const dayIndex of selectedDays) {
        const trigger: Notifications.WeeklyTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          hour: selectedTime.getHours(),
          minute: selectedTime.getMinutes(),
          weekday: dayIndex + 1, // 1-7 for Sunday-Saturday
        };

        const notificationId = await scheduleNotification(
          "Skincare Routine Reminder",
          "Time for your skincare routine!",
          trigger
        );

        // Store notification ID with schedule
        await updateSkincareSchedule(schedule.id, {
          notification_id: notificationId,
        });
      }

      setSchedules((prev) => [...prev, schedule]);
      setSelectedDays([]);
      Alert.alert("Success", "Schedule created successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create schedule");
    }
  };

  const handleToggleSchedule = async (schedule: SkincareSchedule) => {
    try {
      const updatedSchedule = await updateSkincareSchedule(schedule.id, {
        is_active: !schedule.is_active,
      });

      if (updatedSchedule.is_active) {
        // Schedule notifications
        for (const dayIndex of schedule.days_of_week) {
          const [hours, minutes] = schedule.time_of_day.split(":");
          const trigger: Notifications.WeeklyTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            hour: parseInt(hours),
            minute: parseInt(minutes),
            weekday: dayIndex + 1,
          };

          const notificationId = await scheduleNotification(
            "Skincare Routine Reminder",
            "Time for your skincare routine!",
            trigger
          );

          await updateSkincareSchedule(schedule.id, {
            notification_id: notificationId,
          });
        }
      } else {
        // Cancel notifications
        if (schedule.notification_id) {
          await cancelNotification(schedule.notification_id);
        }
      }

      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? updatedSchedule : s))
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (schedule: any) => {
    try {
      if (schedule.notification_id) {
        await cancelNotification(schedule.notification_id);
      }
      await deleteSkincareSchedule(schedule.id);
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
      Alert.alert("Success", "Schedule deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete schedule");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Schedule Your Routine
        </Text>

        <View style={styles.timeContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Time</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: theme.card }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: theme.text }]}>
              {selectedTime.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.daysContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Days</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: selectedDays.includes(index)
                      ? theme.primary
                      : theme.card,
                  },
                ]}
                onPress={() => toggleDay(index)}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: selectedDays.includes(index) ? "#fff" : theme.text,
                    },
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={handleCreateSchedule}
        >
          <Text style={styles.createButtonText}>Create Schedule</Text>
        </TouchableOpacity>

        <View style={styles.schedulesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Schedules
          </Text>
          {schedules.map((schedule) => (
            <View
              key={schedule.id}
              style={[styles.scheduleItem, { backgroundColor: theme.card }]}
            >
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTime, { color: theme.text }]}>
                  {schedule.time_of_day}
                </Text>
                <Text style={[styles.scheduleDays, { color: theme.text }]}>
                  {schedule.days_of_week
                    .map((day: number) => DAYS_OF_WEEK[day].slice(0, 3))
                    .join(", ")}
                </Text>
              </View>
              <View style={styles.scheduleActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: schedule.is_active
                        ? theme.error
                        : theme.success,
                    },
                  ]}
                  onPress={() => handleToggleSchedule(schedule)}
                >
                  <Ionicons
                    name={schedule.is_active ? "pause" : "play"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.error },
                  ]}
                  onPress={() => handleDeleteSchedule(schedule)}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  timeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  timeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
  },
  daysContainer: {
    marginBottom: 20,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  schedulesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  scheduleDays: {
    fontSize: 14,
  },
  scheduleActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SkincareScheduleScreen;
