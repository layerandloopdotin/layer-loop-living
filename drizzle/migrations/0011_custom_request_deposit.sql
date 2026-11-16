ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS thumbnail text;
ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS deposit_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS deposit_status text NOT NULL DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.set_custom_deposit() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.deposit_amount := round(0.2 * (NEW.estimate_low + NEW.estimate_high) / 2);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS custom_requests_deposit ON public.custom_requests;
CREATE TRIGGER custom_requests_deposit BEFORE INSERT ON public.custom_requests FOR EACH ROW EXECUTE FUNCTION public.set_custom_deposit();

DROP POLICY IF EXISTS "anyone requests" ON public.custom_requests;
CREATE POLICY "signed in requests" ON public.custom_requests FOR INSERT TO authenticated
  WITH CHECK (status = 'requested' AND quote IS NULL AND user_id = auth.uid() AND deposit_status = 'pending' AND pg_column_size(design) < 60000);

CREATE POLICY "admin read design thumbs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'design-thumbs' AND public.has_role(auth.uid(), 'admin'::public.app_role));