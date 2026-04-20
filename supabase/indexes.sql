-- Supabase Indexes Optimization Script

-- 1. Index for exact match on slugs (used in Article Details page)
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles USING btree (slug);

-- 2. Index for filtering published articles (used in almost all list queries)
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles USING btree (status);

-- 3. Trigram index for category to support ILIKE searches, or standard btree if precise 
-- Depending on exact postgres setup, standard btree is usually fine for category 
-- since it's frequently an exact match or simple string structure.
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles USING btree (category);

-- 4. GIN Index for array containment (used in .contains('tags', ...))
CREATE INDEX IF NOT EXISTS idx_articles_tags_gin ON public.articles USING gin (tags);

-- 5. Index for chronological sorting (createdAt DESC)
CREATE INDEX IF NOT EXISTS idx_articles_createdat_desc ON public.articles USING btree ("createdAt" DESC);
