-- Create the articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'Tech',
    content JSONB,
    "markdownContent" TEXT,
    excerpt TEXT,
    image TEXT,
    author TEXT DEFAULT 'NewsForge',
    status TEXT DEFAULT 'published',
    "readTime" INTEGER DEFAULT 5,
    tags JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: we use double quotes for camelCase columns like "markdownContent", "readTime", "createdAt" 
-- because PostgreSQL folds unquoted identifiers to lowercase.

-- Add an index on slug for faster querying by slug
CREATE INDEX IF NOT EXISTS articles_slug_idx ON public.articles(slug);

-- Add an index on category and status
CREATE INDEX IF NOT EXISTS articles_category_status_idx ON public.articles(category, status);

-- Enable Row Level Security (RLS) if needed. 
-- Since this is a public blog, you probably want anyone to be able to read.
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reads
CREATE POLICY "Enable read access for all users" ON public.articles
    FOR SELECT USING (true);

-- Create policy to allow authenticated users (service role) or anon to insert
-- (Modify based on your specific security requirements)
CREATE POLICY "Enable insert access for all" ON public.articles
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Enable update access for all" ON public.articles
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all" ON public.articles
    FOR DELETE USING (true);
