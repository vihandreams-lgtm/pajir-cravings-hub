-- Menu categories (admin-manageable, replaces the hard-coded list)
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.menu_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_categories public read" ON public.menu_categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "menu_categories admin insert" ON public.menu_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu_categories admin update" ON public.menu_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu_categories admin delete" ON public.menu_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.menu_categories (slug, label, sort_order) VALUES
  ('juices', '100% Natural Juices & Smoothies', 1),
  ('oven', 'Pajir Oven & Cookies', 2),
  ('kitchen', 'Pajir Kitchen & Breakfast', 3),
  ('soups', 'Soups & Special Platters', 4);

-- WhatsApp testimonials (admin-manageable)
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  location text NOT NULL DEFAULT '',
  quote text NOT NULL,
  verified boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials public read" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "testimonials admin insert" ON public.testimonials
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "testimonials admin update" ON public.testimonials
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "testimonials admin delete" ON public.testimonials
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.testimonials (customer_name, location, quote, verified, sort_order) VALUES
  ('Sarah', 'Kira', 'Thank you for the juice, it''s really nice! Putting the rest in the fridge 🥤', true, 1),
  ('Brian', 'Najjera', 'Last time I took 7 cookies and my colleagues asked where the rest were! 😂', true, 2),
  ('Grace', 'Kyaliwajjala', 'The breakfast platter was so filling. Sunday mornings are sorted!', true, 3),
  ('Daniel', 'Kira', 'That pumpkin soup… I''m ordering again tomorrow.', true, 4),
  ('Esther', 'Bweyogerere', 'Got the 5-litre jerrycan for our party. Everyone loved it!', true, 5);

-- Homepage image slots (hero photo + section banner), editable from the admin panel
CREATE TABLE public.site_assets (
  key text PRIMARY KEY,
  url text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_assets TO authenticated;
GRANT ALL ON public.site_assets TO service_role;

ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_assets public read" ON public.site_assets
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_assets admin insert" ON public.site_assets
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_assets admin update" ON public.site_assets
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_assets admin delete" ON public.site_assets
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_assets (key, url) VALUES ('hero', ''), ('banner', '');

-- Lets the sign-in screen know whether the owner account still needs creating,
-- without exposing the roles table or anyone's email.
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

GRANT EXECUTE ON FUNCTION public.has_any_admin() TO anon, authenticated;

-- Upload folder rules: anyone may view the photos, only admins may add, replace or remove them.
CREATE POLICY "menu photos public read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'menu-photos');
CREATE POLICY "menu photos admin insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu photos admin update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'menu-photos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'menu-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "menu photos admin delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'menu-photos' AND public.has_role(auth.uid(), 'admin'));