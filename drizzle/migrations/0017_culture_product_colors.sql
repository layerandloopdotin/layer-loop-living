UPDATE public.products
SET colors = '[
  {"name":"Track Charcoal","hex":"#242426","images":[]},
  {"name":"Apex Orange","hex":"#FF6B2C","images":[]},
  {"name":"Electric Blue","hex":"#2563EB","images":[]},
  {"name":"Chalk Cream","hex":"#F4EFE6","images":[]},
  {"name":"Signal Red","hex":"#DC2626","images":[]}
]'::jsonb
WHERE slug = 'pit-stop-pen-stack' AND (colors IS NULL OR colors = '[]'::jsonb);

UPDATE public.products
SET colors = '[
  {"name":"Electric Blue","hex":"#2563EB","images":[]},
  {"name":"Pop Orange","hex":"#FF6B2C","images":[]},
  {"name":"Bone Cream","hex":"#F4EFE6","images":[]},
  {"name":"Obsidian","hex":"#1E1E22","images":[]}
]'::jsonb
WHERE slug = 'puffer-caddy' AND (colors IS NULL OR colors = '[]'::jsonb);

UPDATE public.products
SET colors = '[
  {"name":"Pop Orange","hex":"#FF6B2C","images":[]},
  {"name":"Cobalt Blue","hex":"#2563EB","images":[]},
  {"name":"Starlight Cream","hex":"#F4EFE6","images":[]},
  {"name":"Graphite","hex":"#2E2B28","images":[]}
]'::jsonb
WHERE slug = 'cosmo-cat' AND (colors IS NULL OR colors = '[]'::jsonb);
