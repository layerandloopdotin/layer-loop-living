ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS custom_request_id uuid;

CREATE TABLE public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  design jsonb NOT NULL,
  summary text NOT NULL DEFAULT '',
  estimate_low numeric NOT NULL DEFAULT 0, estimate_high numeric NOT NULL DEFAULT 0,
  quote numeric, quote_note text,
  status text NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.custom_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_requests TO authenticated;
GRANT ALL ON public.custom_requests TO service_role;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone requests" ON public.custom_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'requested' AND quote IS NULL AND (user_id IS NULL OR user_id = auth.uid()) AND pg_column_size(design) < 60000);
CREATE POLICY "own requests read" ON public.custom_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin requests" ON public.custom_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER custom_requests_touch BEFORE UPDATE ON public.custom_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.accept_custom_quote(_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.custom_requests; oid uuid;
BEGIN
  SELECT * INTO r FROM public.custom_requests WHERE id = _id AND user_id = auth.uid() FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF r.status <> 'quoted' OR r.quote IS NULL THEN RAISE EXCEPTION 'This request has no open quote'; END IF;
  INSERT INTO public.orders (user_id, items, subtotal, total, custom_request_id, address)
  VALUES (r.user_id, jsonb_build_array(jsonb_build_object('slug','custom','name','Custom design','qty',1,'price',r.quote,'variant',left(r.summary,120))), r.quote, r.quote, r.id, r.contact->'address')
  RETURNING id INTO oid;
  UPDATE public.custom_requests SET status = 'accepted' WHERE id = r.id;
  RETURN oid;
END $$;
REVOKE EXECUTE ON FUNCTION public.accept_custom_quote(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.accept_custom_quote(uuid) TO authenticated;

CREATE TABLE public.saved_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT 'My design',
  design jsonb NOT NULL,
  thumbnail text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_designs TO authenticated;
GRANT ALL ON public.saved_designs TO service_role;
ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own designs" ON public.saved_designs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND pg_column_size(design) < 60000);
CREATE TRIGGER saved_designs_touch BEFORE UPDATE ON public.saved_designs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'percent' CHECK (kind IN ('percent','fixed')),
  amount numeric NOT NULL CHECK (amount > 0),
  min_order numeric NOT NULL DEFAULT 0,
  starts_at timestamptz, ends_at timestamptz,
  usage_limit integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.check_coupon(_code text, _subtotal numeric) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coupons; used int; d numeric;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(trim(_code));
  IF c.id IS NULL OR NOT c.active OR (c.starts_at IS NOT NULL AND now() < c.starts_at) OR (c.ends_at IS NOT NULL AND now() > c.ends_at) THEN
    RETURN jsonb_build_object('ok', false, 'message', 'That code isn''t valid.');
  END IF;
  IF c.usage_limit IS NOT NULL THEN
    SELECT count(*) INTO used FROM public.orders WHERE upper(coupon_code) = upper(c.code) AND status <> 'cancelled';
    IF used >= c.usage_limit THEN RETURN jsonb_build_object('ok', false, 'message', 'This code has been fully used.'); END IF;
  END IF;
  IF _subtotal < c.min_order THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Add items worth ₹' || c.min_order::int || ' or more to use ' || c.code || '.');
  END IF;
  d := CASE WHEN c.kind = 'percent' THEN round(_subtotal * least(c.amount, 100) / 100) ELSE least(c.amount, _subtotal) END;
  RETURN jsonb_build_object('ok', true, 'code', c.code, 'label', coalesce(nullif(c.label,''), c.code), 'discount', d);
END $$;
GRANT EXECUTE ON FUNCTION public.check_coupon(text, numeric) TO anon, authenticated;

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '' CHECK (length(comment) <= 2000),
  images text[] NOT NULL DEFAULT '{}' CHECK (cardinality(images) <= 4),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_slug, user_id)
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved reviews public" ON public.reviews FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "own reviews read" ON public.reviews FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own reviews write" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "own reviews update" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "own reviews delete" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.check_review_purchase() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(),'admin') THEN RETURN new; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.orders o WHERE o.user_id = new.user_id AND o.status = 'delivered'
                 AND EXISTS (SELECT 1 FROM jsonb_array_elements(o.items) it WHERE it->>'slug' = new.product_slug)) THEN
    RAISE EXCEPTION 'You can review products from delivered orders only';
  END IF;
  RETURN new;
END $$;
CREATE TRIGGER reviews_purchase_check BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.check_review_purchase();

CREATE POLICY "own review media write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own design thumbs" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'design-thumbs' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'design-thumbs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, ref_id uuid NOT NULL, title text NOT NULL,
  read_at timestamptz, sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin notifications" ON public.admin_notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.notify_admin_new() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'orders' THEN
    INSERT INTO public.admin_notifications (kind, ref_id, title) VALUES ('order', new.id, 'New order #' || new.number || ' · ₹' || new.total::int);
  ELSE
    INSERT INTO public.admin_notifications (kind, ref_id, title) VALUES ('custom', new.id, 'New custom design request · est. ₹' || new.estimate_low::int || '–' || new.estimate_high::int);
  END IF;
  RETURN new;
END $$;
CREATE TRIGGER orders_notify AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new();
CREATE TRIGGER custom_requests_notify AFTER INSERT ON public.custom_requests FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new();
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

CREATE TABLE public.admin_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  notify_email text, notify_whatsapp text,
  email_on boolean NOT NULL DEFAULT true, whatsapp_on boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin settings" ON public.admin_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.admin_settings (id) VALUES (true);