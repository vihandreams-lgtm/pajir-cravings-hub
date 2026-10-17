create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account ever created becomes the admin (Jireh)
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price integer not null default 0,
  category text not null,
  image_url text,
  discount_percent integer not null default 0,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "public read" on public.menu_items for select to anon, authenticated using (true);
create policy "admin insert" on public.menu_items for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.menu_items for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.menu_items for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.menu_items (name, description, price, category, sort_order) values
('Fresh Fruit Juice (500ml)','Pressed fresh every morning, 100% natural.',2000,'juices',1),
('Mixed Fruit Juice (500ml)','A vibrant blend of seasonal fruits.',4000,'juices',2),
('3-Litre Jerrycan Juice','Perfect for families, offices and parties.',25000,'juices',3),
('5-Litre Jerrycan Juice','Big celebrations deserve big juice.',40000,'juices',4),
('Strawberry & Banana Smoothie','Creamy, sweet and fruity.',12000,'juices',5),
('Avocado & Honey Smoothie','Avocado, banana, milk and honey.',12000,'juices',6),
('Green Detox Smoothie','Apple, cucumber, spinach and ginger.',12000,'juices',7),
('Fresh Cookies (5 Pieces Pack)','Golden, crunchy, baked today.',1000,'oven',8),
('Medium Cookie Tin (60 cookies)','60 freshly baked cookies to share.',16000,'oven',9),
('Large Digestive Cookie Tin (118 cookies)','118 wholesome digestive cookies.',32000,'oven',10),
('Breakfast Platter','2 fried eggs, 2 sausages, Irish potatoes, toasted bread, chapati and fresh fruit.',25000,'kitchen',11),
('Yogurt Parfait Bowl','Layers of yogurt, granola and fresh fruit.',18000,'kitchen',12),
('Signature Pumpkin Soup','Velvety, warming and full of flavour.',15000,'soups',13),
('Chef''s Special Crispy Fish','With mashed potatoes and wedges.',35000,'soups',14),
('Nuggets with White Rice','Served with salad and ketchup.',20000,'soups',15);