CREATE POLICY "Anyone uploads custom brief files" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'custom-briefs' AND (storage.foldername(name))[1] = 'briefs');
CREATE POLICY "Admins read custom brief files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'custom-briefs' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete custom brief files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'custom-briefs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

UPDATE public.site_content
SET data = jsonb_set(data, '{nav}', (
  SELECT jsonb_agg(e ORDER BY ord) FROM (
    SELECT e, ord::numeric AS ord FROM jsonb_array_elements(data->'nav') WITH ORDINALITY t(e, ord)
    UNION ALL
    SELECT '{"label":"Custom","path":"/custom"}'::jsonb,
      COALESCE((SELECT o FROM jsonb_array_elements(data->'nav') WITH ORDINALITY x(v, o) WHERE v->>'path' = '/trade' LIMIT 1), 999)::numeric + 0.5
  ) s
))
WHERE key = 'settings' AND data ? 'nav' AND NOT (data->'nav' @> '[{"path":"/custom"}]');