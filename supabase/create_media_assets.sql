-- NewsForge Production Upgrade Script

-- 1. Create Media Assets Table for metadata-driven storage
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 2. Add Status column to Subscribers if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscribers' AND column_name='status') THEN
        ALTER TABLE public.subscribers ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- 3. Enable RLS (Optional but recommended)
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy for Admin access (Simplified for now)
-- You may want to refine this based on your specific Supabase role setup
CREATE POLICY "Allow authenticated users to manage media" ON public.media_assets
    FOR ALL USING (true) WITH CHECK (true);
