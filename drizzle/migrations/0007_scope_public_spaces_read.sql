DROP POLICY IF EXISTS "Spaces public" ON public.spaces;
CREATE POLICY "Spaces in use are public" ON public.spaces FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.published AND spaces.id = ANY (p.space_ids)));