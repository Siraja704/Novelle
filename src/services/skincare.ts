import { supabase } from "./supabase";

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
