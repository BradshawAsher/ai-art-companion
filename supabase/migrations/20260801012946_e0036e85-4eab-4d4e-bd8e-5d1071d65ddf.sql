CREATE TABLE public.portfolio_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  tokens_earned INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL DEFAULT '',
  critique_pins JSONB NOT NULL DEFAULT '[]'::jsonb,
  medium TEXT NOT NULL DEFAULT 'unknown',
  medium_match BOOLEAN NOT NULL DEFAULT false,
  is_analog BOOLEAN NOT NULL DEFAULT true,
  experimentation_level TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_entries TO authenticated;
GRANT ALL ON public.portfolio_entries TO service_role;

ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio entries" ON public.portfolio_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can add portfolio entries" ON public.portfolio_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update portfolio entries" ON public.portfolio_entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete portfolio entries" ON public.portfolio_entries FOR DELETE USING (true);

CREATE POLICY "Public read artworks" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');
CREATE POLICY "Public upload artworks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artworks');
CREATE POLICY "Public delete artworks" ON storage.objects FOR DELETE USING (bucket_id = 'artworks');