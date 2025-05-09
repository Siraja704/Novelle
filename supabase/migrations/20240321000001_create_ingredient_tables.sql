-- Create ingredients table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    common_uses TEXT[],
    warnings TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ingredient interactions table
CREATE TABLE ingredient_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    interacts_with_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(ingredient_id, interacts_with_id)
);

-- Create product ingredients table
CREATE TABLE product_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    concentration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(product_id, ingredient_id)
);

-- Create ingredient analysis table
CREATE TABLE ingredient_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    analysis_result JSONB NOT NULL,
    warnings TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredient_interactions_ingredient_id ON ingredient_interactions(ingredient_id);
CREATE INDEX idx_ingredient_interactions_interacts_with_id ON ingredient_interactions(interacts_with_id);
CREATE INDEX idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);
CREATE INDEX idx_ingredient_analysis_user_id ON ingredient_analysis(user_id);
CREATE INDEX idx_ingredient_analysis_product_id ON ingredient_analysis(product_id);

-- Add RLS policies
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_analysis ENABLE ROW LEVEL SECURITY;

-- Ingredients policies
CREATE POLICY "Ingredients are viewable by everyone"
    ON ingredients FOR SELECT
    USING (true);

CREATE POLICY "Ingredients can be added by authenticated users"
    ON ingredients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Ingredient interactions policies
CREATE POLICY "Ingredient interactions are viewable by everyone"
    ON ingredient_interactions FOR SELECT
    USING (true);

CREATE POLICY "Ingredient interactions can be added by authenticated users"
    ON ingredient_interactions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Product ingredients policies
CREATE POLICY "Product ingredients are viewable by everyone"
    ON product_ingredients FOR SELECT
    USING (true);

CREATE POLICY "Product ingredients can be added by authenticated users"
    ON product_ingredients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Ingredient analysis policies
CREATE POLICY "Users can view their own ingredient analysis"
    ON ingredient_analysis FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ingredient analysis"
    ON ingredient_analysis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 