
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- The very first account created becomes the site admin.
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
for each row execute function public.grant_first_admin();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Page / settings content, one JSON document per key
create table public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "Content is public" on public.site_content for select to anon, authenticated using (true);
create policy "Admins write content" on public.site_content for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger site_content_touch before update on public.site_content for each row execute function public.touch_updated_at();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  short_description text not null default '',
  long_description text not null default '',
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  featured boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  category_ids uuid[] not null default '{}',
  space_ids uuid[] not null default '{}',
  images text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  care jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

grant select on public.categories, public.spaces, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.spaces, public.products to authenticated;
grant all on public.categories, public.spaces, public.products to service_role;
alter table public.categories enable row level security;
alter table public.spaces enable row level security;
alter table public.products enable row level security;
create policy "Categories public" on public.categories for select to anon, authenticated using (true);
create policy "Admins write categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Spaces public" on public.spaces for select to anon, authenticated using (true);
create policy "Admins write spaces" on public.spaces for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Published products public" on public.products for select to anon, authenticated using (published);
create policy "Admins read all products" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins write products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('catalogue', 'career')),
  data jsonb not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);
grant insert on public.submissions to anon, authenticated;
grant select, update, delete on public.submissions to authenticated;
grant all on public.submissions to service_role;
alter table public.submissions enable row level security;
create policy "Anyone can submit a form" on public.submissions for insert to anon, authenticated
  with check (status = 'new' and pg_column_size(data) < 20000);
create policy "Admins read submissions" on public.submissions for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update submissions" on public.submissions for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete submissions" on public.submissions for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Public read cms media" on storage.objects for select using (bucket_id = 'cms-media');
create policy "Admins upload cms media" on storage.objects for insert to authenticated
  with check (bucket_id = 'cms-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update cms media" on storage.objects for update to authenticated
  using (bucket_id = 'cms-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete cms media" on storage.objects for delete to authenticated
  using (bucket_id = 'cms-media' and public.has_role(auth.uid(), 'admin'));

-- Seed taxonomy and the current catalogue
insert into public.categories (name, image, sort) values
 ('Lighting','asset:tile-lighting.jpg',1),('Vases & Planters','asset:tile-vases.jpg',2),
 ('Collectibles','asset:tile-collectibles.jpg',3),('Desk Essentials','asset:tile-desk.jpg',4);
insert into public.spaces (name, sort) values
 ('The Lounge',1),('The Suite',2),('The Café',3),('The Dining Room',4),('The Study',5);

with c as (select id, name from public.categories), s as (select id, name from public.spaces),
raw(sort, slug, name, tagline, short, price, cat, sp, imgs, featured) as (values
 (1,'the-stack-lamp','The Stack Lamp','Layered sculptural table lamp','Stacked, softly glowing layers that turn a side table into a quiet centrepiece.',340,'Lighting',array['The Lounge','The Study'],array['asset:hero-lamp.jpg','asset:stack-2.jpg','asset:stack-3.jpg','asset:stack-4.jpg'],false),
 (2,'terra','Terra','Warm ceramic lighting','A softly ribbed ceramic-look shade that pools warm, low light — made for slow evenings.',280,'Lighting',array['The Lounge','The Suite'],array['asset:terra.jpg','asset:terra-2.jpg','asset:terra-3.jpg','asset:terra-4.jpg'],true),
 (3,'noir','Noir','Glazed ceramic sphere','A deep, glaze-finished sphere that glows from within like a lantern at dusk.',310,'Lighting',array['The Lounge','The Café'],array['asset:noir.jpg'],true),
 (4,'haze','Haze','Arched floor light','A gentle arched floor light that leans over a sofa or reading chair.',265,'Lighting',array['The Lounge'],array['asset:haze.jpg'],true),
 (5,'orb','Orb','Glass on raw stone','A frosted globe resting on a stone-textured base — small, calm and sculptural.',240,'Lighting',array['The Suite','The Café'],array['asset:p-orb.jpg'],false),
 (6,'dune','Dune','Slender floor dome','A slender floor dome with fine layer lines that catch light like wind on sand.',390,'Lighting',array['The Lounge','The Dining Room'],array['asset:p-floor.jpg'],false),
 (7,'weave','Weave','Woven pendant','A woven-pattern pendant that scatters soft patterned light over a table.',220,'Lighting',array['The Dining Room','The Café'],array['asset:p-pendant.jpg'],false),
 (8,'atelier','Atelier','Brass task lamp','A focused task lamp with a brass-tone finish for desks and work corners.',295,'Lighting',array['The Study'],array['asset:p-brass.jpg'],false),
 (9,'cap','Cap','Terracotta mushroom','A terracotta-toned mushroom lamp — playful in shape, calm in glow.',180,'Lighting',array['The Suite','The Café'],array['asset:p-mushroom.jpg'],false),
 (10,'lumen','Lumen','Ribbed glass lantern','A ribbed lantern whose layers fold light into gentle stripes.',210,'Lighting',array['The Dining Room','The Café'],array['asset:p-lantern.jpg'],false),
 (11,'ripple','Ripple','Wave-ribbed vase','A wave-ribbed vase that turns dried stems and single blooms into sculpture.',150,'Vases & Planters',array['The Lounge','The Dining Room'],array['asset:cat-vases.jpg'],false),
 (12,'arch','Arch','Sculptural ceramic form','A sculptural object to anchor a shelf, console or desk.',120,'Collectibles',array['The Lounge','The Study'],array['asset:tile-collectibles.jpg'],false),
 (13,'stack','Stack','Desk organiser & pen cup','A stackable organiser and pen cup that keeps a desk clear and considered.',135,'Desk Essentials',array['The Study'],array['asset:cat-desk.jpg'],false)
)
insert into public.products (sort, slug, name, tagline, short_description, long_description, price, featured, category_ids, space_ids, images, colors, specs, care)
select r.sort, r.slug, r.name, r.tagline, r.short,
  r.name || ' is printed layer by layer in our studio, then finished by hand. Each piece takes several hours on the printer, so tiny variations in texture make every one slightly different. We use non-toxic, plant-based and recyclable filaments, and design every object to be light, sturdy and easy to live with.',
  r.price, r.featured,
  array(select id from c where c.name = r.cat),
  array(select id from s where s.name = any(r.sp)),
  r.imgs,
  '[{"name":"Bone White","hex":"#EDE6DA","images":[]},{"name":"Sandstone","hex":"#CDB79A","images":[]},{"name":"Terracotta","hex":"#B8643F","images":[]},{"name":"Sage","hex":"#8E9A7E","images":[]},{"name":"Charcoal","hex":"#2E2B28","images":[]}]'::jsonb,
  case r.cat
    when 'Lighting' then '[{"label":"Dimensions","value":"Ø 22 × H 30 cm"},{"label":"Weight","value":"650 g"},{"label":"Material","value":"PLA+ shade, PETG base"},{"label":"Bulb","value":"E27 warm LED, 2700K (included)"},{"label":"Cable","value":"1.8 m fabric cord with inline switch"}]'::jsonb
    when 'Vases & Planters' then '[{"label":"Dimensions","value":"Ø 12 × H 24 cm"},{"label":"Weight","value":"280 g"},{"label":"Material","value":"PETG, watertight"},{"label":"Use","value":"Fresh or dried stems"}]'::jsonb
    when 'Collectibles' then '[{"label":"Dimensions","value":"14 × 8 × 18 cm"},{"label":"Weight","value":"220 g"},{"label":"Material","value":"Matte PLA"},{"label":"Finish","value":"Hand-sanded"}]'::jsonb
    else '[{"label":"Dimensions","value":"10 × 10 × 12 cm"},{"label":"Weight","value":"180 g"},{"label":"Material","value":"PLA with TPU non-slip feet"},{"label":"Modules","value":"3 stackable trays"}]'::jsonb
  end,
  '[{"label":"Cleaning","value":"Dust with a soft dry cloth. For marks, use a lightly damp cloth — no solvents or abrasive sprays."},{"label":"Heat & sun","value":"Keep away from direct afternoon sun, heaters and hot cars; prolonged heat above 50°C can soften the print."},{"label":"Wear & tear","value":"Fine layer lines are part of the making, not a flaw. Small scuffs can be eased with a very fine sanding pad."},{"label":"End of life","value":"Send it back to our store — we grind and recycle returned pieces instead of sending them to landfill."}]'::jsonb
from raw r;
