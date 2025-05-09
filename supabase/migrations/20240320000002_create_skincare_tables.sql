-- Create skincare_routines table
CREATE TABLE skincare_routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    skin_type TEXT NOT NULL,
    concerns TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create skincare_steps table
CREATE TABLE skincare_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES skincare_routines(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    instructions TEXT,
    time_of_day TEXT[] NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create skincare_logs table
CREATE TABLE skincare_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES skincare_routines(id) ON DELETE CASCADE,
    step_id UUID REFERENCES skincare_steps(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    skin_condition_rating INTEGER CHECK (skin_condition_rating >= 1 AND skin_condition_rating <= 5)
);

-- Create skincare_reminders table
CREATE TABLE skincare_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES skincare_routines(id) ON DELETE CASCADE,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE skincare_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE skincare_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skincare_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skincare_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for skincare_routines
CREATE POLICY "Users can view their own routines"
    ON skincare_routines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routines"
    ON skincare_routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines"
    ON skincare_routines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines"
    ON skincare_routines FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for skincare_steps
CREATE POLICY "Users can view steps of their routines"
    ON skincare_steps FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM skincare_routines
        WHERE skincare_routines.id = skincare_steps.routine_id
        AND skincare_routines.user_id = auth.uid()
    ));

CREATE POLICY "Users can create steps for their routines"
    ON skincare_steps FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM skincare_routines
        WHERE skincare_routines.id = skincare_steps.routine_id
        AND skincare_routines.user_id = auth.uid()
    ));

CREATE POLICY "Users can update steps of their routines"
    ON skincare_steps FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM skincare_routines
        WHERE skincare_routines.id = skincare_steps.routine_id
        AND skincare_routines.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete steps of their routines"
    ON skincare_steps FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM skincare_routines
        WHERE skincare_routines.id = skincare_steps.routine_id
        AND skincare_routines.user_id = auth.uid()
    ));

-- Policies for skincare_logs
CREATE POLICY "Users can view their own logs"
    ON skincare_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
    ON skincare_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
    ON skincare_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
    ON skincare_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for skincare_reminders
CREATE POLICY "Users can view their own reminders"
    ON skincare_reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
    ON skincare_reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON skincare_reminders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON skincare_reminders FOR DELETE
    USING (auth.uid() = user_id); 