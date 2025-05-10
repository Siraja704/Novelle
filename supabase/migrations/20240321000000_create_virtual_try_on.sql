-- Create virtual_try_on table
CREATE TABLE virtual_try_on (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_image_url TEXT NOT NULL,
    clothing_image_url TEXT NOT NULL,
    result_image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX virtual_try_on_user_id_idx ON virtual_try_on(user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_virtual_try_on_updated_at
    BEFORE UPDATE ON virtual_try_on
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE virtual_try_on ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own try-on results
CREATE POLICY "Users can view their own try-on results"
    ON virtual_try_on
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own try-on results
CREATE POLICY "Users can insert their own try-on results"
    ON virtual_try_on
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own try-on results
CREATE POLICY "Users can delete their own try-on results"
    ON virtual_try_on
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES
    ('user-images', 'user-images', true),
    ('clothing-images', 'clothing-images', true),
    ('try-on-results', 'try-on-results', true);

-- Set up storage policies
CREATE POLICY "Users can upload their own images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id IN ('user-images', 'clothing-images', 'try-on-results') AND
        auth.uid() = owner
    );

CREATE POLICY "Users can view their own images"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id IN ('user-images', 'clothing-images', 'try-on-results') AND
        auth.uid() = owner
    );

CREATE POLICY "Users can delete their own images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id IN ('user-images', 'clothing-images', 'try-on-results') AND
        auth.uid() = owner
    ); 