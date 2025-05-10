import { supabase } from "./supabase";
import * as Notifications from "expo-notifications";

export interface SkincareRoutine {
  id: string;
  name: string;
  description?: string;
  skin_type: string;
  concerns: string[];
  created_at: string;
  updated_at: string;
}

export interface SkincareStep {
  id: string;
  routine_id: string;
  step_number: number;
  product_name: string;
  product_type: string;
  instructions?: string;
  time_of_day: string[];
  duration_minutes?: number;
  created_at: string;
}

export interface SkincareLog {
  id: string;
  routine_id: string;
  step_id: string;
  completed_at: string;
  notes?: string;
  mood_rating?: number;
  skin_condition_rating?: number;
}

export interface SkincareReminder {
  id: string;
  routine_id: string;
  time_of_day: string;
  days_of_week: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkincareSchedule {
  id: string;
  routine_id: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
  notification_id?: string;
  created_at: string;
  updated_at: string;
}

// Create a new skincare routine
export const createSkincareRoutine = async (
  routine: Omit<SkincareRoutine, "id" | "created_at" | "updated_at">
): Promise<SkincareRoutine> => {
  const { data, error } = await supabase
    .from("skincare_routines")
    .insert(routine)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all routines for the current user
export const getSkincareRoutines = async (): Promise<SkincareRoutine[]> => {
  const { data, error } = await supabase
    .from("skincare_routines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get a specific routine with its steps
export const getSkincareRoutine = async (
  routineId: string
): Promise<{ routine: SkincareRoutine; steps: SkincareStep[] }> => {
  const { data: routine, error: routineError } = await supabase
    .from("skincare_routines")
    .select("*")
    .eq("id", routineId)
    .single();

  if (routineError) throw routineError;

  const { data: steps, error: stepsError } = await supabase
    .from("skincare_steps")
    .select("*")
    .eq("routine_id", routineId)
    .order("step_number", { ascending: true });

  if (stepsError) throw stepsError;

  return { routine, steps };
};

// Add a step to a routine
export const addSkincareStep = async (
  step: Omit<SkincareStep, "id" | "created_at">
): Promise<SkincareStep> => {
  const { data, error } = await supabase
    .from("skincare_steps")
    .insert(step)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Log a completed step
export const logSkincareStep = async (
  log: Omit<SkincareLog, "id" | "completed_at">
): Promise<SkincareLog> => {
  const { data, error } = await supabase
    .from("skincare_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create a reminder
export const createSkincareReminder = async (
  reminder: Omit<SkincareReminder, "id" | "created_at" | "updated_at">
): Promise<SkincareReminder> => {
  const { data, error } = await supabase
    .from("skincare_reminders")
    .insert(reminder)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all reminders for a routine
export const getSkincareReminders = async (
  routineId: string
): Promise<SkincareReminder[]> => {
  const { data, error } = await supabase
    .from("skincare_reminders")
    .select("*")
    .eq("routine_id", routineId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Update a reminder
export const updateSkincareReminder = async (
  reminderId: string,
  updates: Partial<SkincareReminder>
): Promise<SkincareReminder> => {
  const { data, error } = await supabase
    .from("skincare_reminders")
    .update(updates)
    .eq("id", reminderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get skincare logs for a routine
export const getSkincareLogs = async (
  routineId: string
): Promise<SkincareLog[]> => {
  const { data, error } = await supabase
    .from("skincare_logs")
    .select("*")
    .eq("routine_id", routineId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Schedule a routine
export const scheduleSkincareRoutine = async (
  schedule: Omit<SkincareSchedule, "id" | "created_at" | "updated_at">
): Promise<SkincareSchedule> => {
  const { data, error } = await supabase
    .from("skincare_schedules")
    .insert(schedule)
    .select()
    .single();

  if (error) throw error;

  // Schedule notifications
  await scheduleNotifications(schedule);

  return data;
};

// Get all schedules for a routine
export const getSkincareSchedules = async (
  routineId: string
): Promise<SkincareSchedule[]> => {
  const { data, error } = await supabase
    .from("skincare_schedules")
    .select("*")
    .eq("routine_id", routineId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Update a schedule
export const updateSkincareSchedule = async (
  scheduleId: string,
  updates: Partial<SkincareSchedule>
): Promise<SkincareSchedule> => {
  const { data, error } = await supabase
    .from("skincare_schedules")
    .update(updates)
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) throw error;

  // Update notifications if schedule changed
  if (updates.time_of_day || updates.days_of_week || updates.is_active) {
    await updateNotifications(scheduleId, updates);
  }

  return data;
};

// Delete a schedule
export const deleteSkincareSchedule = async (
  scheduleId: string
): Promise<void> => {
  const { error } = await supabase
    .from("skincare_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) throw error;

  // Cancel notifications
  await cancelNotifications(scheduleId);
};

// Helper function to schedule notifications
const scheduleNotifications = async (
  schedule: Omit<SkincareSchedule, "id" | "created_at" | "updated_at">
) => {
  const { routine_id, time_of_day, days_of_week } = schedule;

  // Get routine details
  const { routine } = await getSkincareRoutine(routine_id);

  // Schedule notifications for each day
  for (const day of days_of_week) {
    const [hours, minutes] = time_of_day.split(":").map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Skincare Reminder",
        body: `Time for your ${routine.name} routine!`,
        data: { routine_id },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        weekday: getWeekdayNumber(day),
        repeats: true,
      },
    });
  }
};

// Helper function to update notifications
const updateNotifications = async (
  scheduleId: string,
  updates: Partial<SkincareSchedule>
) => {
  // Cancel existing notifications
  await cancelNotifications(scheduleId);

  // Schedule new notifications if schedule is active
  if (updates.is_active !== false) {
    const schedule = await getSkincareSchedules(scheduleId);
    if (schedule.length > 0) {
      await scheduleNotifications(schedule[0]);
    }
  }
};

// Helper function to cancel notifications
const cancelNotifications = async (scheduleId: string) => {
  const schedules = await getSkincareSchedules(scheduleId);
  if (schedules.length > 0) {
    const schedule = schedules[0];
    await Notifications.cancelScheduledNotificationAsync(scheduleId);
  }
};

// Helper function to convert day name to number
const getWeekdayNumber = (day: string): number => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.indexOf(day) + 1;
};

export const createSkincareSchedule = async (
  schedule: Omit<SkincareSchedule, "id" | "created_at" | "updated_at">
): Promise<SkincareSchedule> => {
  const { data, error } = await supabase
    .from("skincare_schedules")
    .insert(schedule)
    .select()
    .single();

  if (error) throw error;
  return data;
};
