ALTER TABLE public.universities
  ADD COLUMN alumni jsonb NOT NULL DEFAULT '[]'::jsonb;