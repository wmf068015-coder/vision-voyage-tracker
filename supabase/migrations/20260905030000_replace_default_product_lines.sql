BEGIN;

-- Products belonging to these seeded lines are removed by the foreign key cascade.
DELETE FROM public.product_lines
WHERE name IN ('音频 / 智能音箱', '清洁 / 扫地机器人', '穿戴 / 智能手环');

INSERT INTO public.product_lines (name, code, owner, sort_order)
SELECT 'NEEWER HOME', 'H', '', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_lines WHERE name = 'NEEWER HOME'
);

INSERT INTO public.product_lines (name, code, owner, sort_order)
SELECT 'NEEWER STUDIO', 'S', '', 2
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_lines WHERE name = 'NEEWER STUDIO'
);

INSERT INTO public.product_lines (name, code, owner, sort_order)
SELECT '客服', 'CS', '', 3
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_lines WHERE name = '客服'
);

UPDATE public.product_lines SET code = 'H', sort_order = 1 WHERE name = 'NEEWER HOME';
UPDATE public.product_lines SET code = 'S', sort_order = 2 WHERE name = 'NEEWER STUDIO';
UPDATE public.product_lines SET code = 'CS', sort_order = 3 WHERE name = '客服';

COMMIT;
