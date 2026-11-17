ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS engravable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS engraving_price numeric NOT NULL DEFAULT 199,
  ADD COLUMN IF NOT EXISTS engraving_max_chars integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS engraving_placements text[] NOT NULL DEFAULT ARRAY['Front','Base','Back'];
UPDATE public.products SET engravable = true;
UPDATE public.site_content SET data = jsonb_set(jsonb_set(data, '{url}', '"https://instagram.com/layerandloop.in"'), '{handle}', '"layerandloop.in"') WHERE key = 'instagram';