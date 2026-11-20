ALTER TABLE public.products ADD COLUMN IF NOT EXISTS world text NOT NULL DEFAULT 'space' CHECK (world IN ('space','culture'));
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS world text NOT NULL DEFAULT 'space' CHECK (world IN ('space','culture'));
UPDATE public.categories SET world='culture' WHERE name='Collectibles';
INSERT INTO public.categories (id,name,image,sort,world) VALUES
 ('c0000000-0000-4000-8000-000000000001','Quirky Desk','asset:c-puffer.jpg',6,'culture'),
 ('c0000000-0000-4000-8000-000000000002','Statement Pieces','asset:c-tirestack.jpg',7,'culture')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (slug,name,tagline,short_description,long_description,price,featured,published,sort,category_ids,space_ids,images,world) VALUES
 ('pit-stop-pen-stack','Pit Stop Pen Stack','F1 tyre-stack pen holder','A stack of race tyres that keeps your pens in pole position.','Printed tyre by tyre with an orange stripe, it holds pens, markers and brushes on any desk that likes speed.',899,true,true,100,ARRAY['c0000000-0000-4000-8000-000000000002']::uuid[],'{}'::uuid[],ARRAY['asset:c-tirestack.jpg'],'culture'),
 ('puffer-caddy','Puffer Caddy','Quilted desk organiser','A puffer-jacket desk caddy with three pockets for your daily kit.','Quilted panels and a printed zip, in electric blue. Fits pens, scissors, sticky notes and your phone.',1199,true,true,101,ARRAY['c0000000-0000-4000-8000-000000000001']::uuid[],'{}'::uuid[],ARRAY['asset:c-puffer.jpg'],'culture'),
 ('cosmo-cat','Cosmo Cat','Collectible figurine','An original astronaut cat collectible, printed and hand-finished.','Our own character, about 14 cm tall, in pop orange and blue on a cream pedestal.',1499,true,true,102,ARRAY['8da18b92-6ce5-4b2a-abe9-f46eb7fb02e9']::uuid[],'{}'::uuid[],ARRAY['asset:c-figurine.jpg'],'culture')
ON CONFLICT (slug) DO NOTHING;