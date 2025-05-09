-- Create face_analysis table
CREATE TABLE face_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    face_shape TEXT NOT NULL,
    landmarks JSONB NOT NULL,
    confidence FLOAT NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX face_analysis_user_id_idx ON face_analysis(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_face_analysis_updated_at
    BEFORE UPDATE ON face_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE face_analysis ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own face analysis results
CREATE POLICY "Users can view their own face analysis results"
    ON face_analysis
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own face analysis results
CREATE POLICY "Users can insert their own face analysis results"
    ON face_analysis
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own face analysis results
CREATE POLICY "Users can update their own face analysis results"
    ON face_analysis
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own face analysis results
CREATE POLICY "Users can delete their own face analysis results"
    ON face_analysis
    FOR DELETE
    USING (auth.uid() = user_id); 