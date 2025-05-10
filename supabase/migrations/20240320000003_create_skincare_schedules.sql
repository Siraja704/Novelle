 -- Create skincare_schedules table
CREATE TABLE IF NOT EXISTS skincare_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES skincare_routines(id) ON DELETE CASCADE,
    time_of_day TIME NOT NULL,
    days_of_week INTEGER[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE skincare_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skincare schedules"
    ON skincare_schedules
    FOR SELECT
    USING (
        routine_id IN (
            SELECT id FROM skincare_routines
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own skincare schedules"
    ON skincare_schedules
    FOR INSERT
    WITH CHECK (
        routine_id IN (
            SELECT id FROM skincare_routines
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own skincare schedules"
    ON skincare_schedules
    FOR UPDATE
    USING (
        routine_id IN (
            SELECT id FROM skincare_routines
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own skincare schedules"
    ON skincare_schedules
    FOR DELETE
    USING (
        routine_id IN (
            SELECT id FROM skincare_routines
            WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for skincare_schedules
CREATE TRIGGER update_skincare_schedules_updated_at
    BEFORE UPDATE ON skincare_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()