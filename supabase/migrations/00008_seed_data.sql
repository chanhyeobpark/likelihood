-- Seed categories
INSERT INTO public.categories (slug, name_ko, name_en, sort_order) VALUES
  ('outer', '아우터', 'Outer', 1),
  ('tops', '상의', 'Tops', 2),
  ('bottoms', '하의', 'Bottoms', 3),
  ('dresses', '원피스', 'Dresses', 4),
  ('accessories', '액세서리', 'Accessories', 5),
  ('bags', '가방', 'Bags', 6);

-- Seed sub-categories
INSERT INTO public.categories (slug, name_ko, name_en, parent_id, sort_order)
SELECT 'coats', '코트', 'Coats', id, 1 FROM public.categories WHERE slug = 'outer'
UNION ALL
SELECT 'jackets', '재킷', 'Jackets', id, 2 FROM public.categories WHERE slug = 'outer'
UNION ALL
SELECT 't-shirts', '티셔츠', 'T-Shirts', id, 1 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'shirts', '셔츠', 'Shirts', id, 2 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'knit', '니트', 'Knit', id, 3 FROM public.categories WHERE slug = 'tops'
UNION ALL
SELECT 'pants', '팬츠', 'Pants', id, 1 FROM public.categories WHERE slug = 'bottoms'
UNION ALL
SELECT 'skirts', '스커트', 'Skirts', id, 2 FROM public.categories WHERE slug = 'bottoms'
UNION ALL
SELECT 'denim', '데님', 'Denim', id, 3 FROM public.categories WHERE slug = 'bottoms';
