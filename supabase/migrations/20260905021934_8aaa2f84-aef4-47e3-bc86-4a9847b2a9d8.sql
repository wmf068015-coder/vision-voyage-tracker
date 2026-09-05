CREATE TABLE public.product_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_lines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_lines TO authenticated;
GRANT ALL ON public.product_lines TO service_role;
ALTER TABLE public.product_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product lines" ON public.product_lines FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can manage product lines" ON public.product_lines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id UUID NOT NULL REFERENCES public.product_lines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  hw_progress INTEGER NOT NULL DEFAULT 0 CHECK (hw_progress BETWEEN 0 AND 100),
  app_progress INTEGER NOT NULL DEFAULT 0 CHECK (app_progress BETWEEN 0 AND 100),
  ai_progress INTEGER NOT NULL DEFAULT 0 CHECK (ai_progress BETWEEN 0 AND 100),
  trial_date DATE,
  mp_date DATE,
  launch_date DATE,
  stage TEXT NOT NULL DEFAULT '研发中',
  at_risk BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can manage products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_lines;

INSERT INTO public.product_lines (name, code, owner, sort_order) VALUES
  ('音频 / 智能音箱', 'A', '陈曦', 1),
  ('清洁 / 扫地机器人', 'C', '赵敏', 2),
  ('穿戴 / 智能手环', 'W', '刘洋', 3);

INSERT INTO public.products (line_id, name, description, hw_progress, app_progress, ai_progress, trial_date, mp_date, launch_date, stage, at_risk)
SELECT id, 'Aurora One', '旗舰家庭音箱', 82, 64, 45, '2026-09-12', '2026-11-05', '2026-12-01', '试产阶段', false FROM public.product_lines WHERE code = 'A';
INSERT INTO public.products (line_id, name, description, hw_progress, app_progress, ai_progress, trial_date, mp_date, launch_date, stage, at_risk)
SELECT id, 'Pulse Mini', '桌面便携音箱', 91, 78, 66, '2026-08-20', '2026-10-18', '2026-11-20', '量产准备', false FROM public.product_lines WHERE code = 'A';
INSERT INTO public.products (line_id, name, description, hw_progress, app_progress, ai_progress, trial_date, mp_date, launch_date, stage, at_risk)
SELECT id, 'Terra S2', '自集尘扫拖一体', 58, 41, 33, '2026-10-08', '2027-01-15', '2027-02-28', '设计定型', true FROM public.product_lines WHERE code = 'C';
INSERT INTO public.products (line_id, name, description, hw_progress, app_progress, ai_progress, trial_date, mp_date, launch_date, stage, at_risk)
SELECT id, 'Halo Band X', '血氧心率手环', 70, 55, 52, '2026-09-20', '2026-11-25', '2026-12-20', '试产阶段', false FROM public.product_lines WHERE code = 'W';