-- Create the favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    token_name TEXT NOT NULL,
    chain_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_wallet_address ON public.favorites(wallet_address);
CREATE INDEX IF NOT EXISTS idx_favorites_token_address ON public.favorites(token_address);
CREATE INDEX IF NOT EXISTS idx_favorites_wallet_token ON public.favorites(wallet_address, token_address, chain_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON public.favorites(wallet_address, token_address, chain_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to read their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (true);

-- Policy for users to insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON public.favorites
    FOR INSERT WITH CHECK (true);

-- Policy for users to update their own favorites
CREATE POLICY "Users can update their own favorites" ON public.favorites
    FOR UPDATE USING (true);

-- Policy for users to delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.favorites
    FOR DELETE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_favorites_updated_at 
    BEFORE UPDATE ON public.favorites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO anon;
