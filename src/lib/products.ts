import { supabase } from "@/integrations/supabase/client";

export interface ProductLine {
  id: string;
  name: string;
  code: string;
  owner: string;
  sort_order: number;
}

export interface Product {
  id: string;
  line_id: string;
  name: string;
  description: string;
  hw_progress: number;
  app_progress: number;
  ai_progress: number;
  trial_date: string | null;
  mp_date: string | null;
  launch_date: string | null;
  stage: string;
  at_risk: boolean;
  updated_at: string;
}

export interface ProductInput {
  line_id: string;
  name: string;
  description: string;
  hw_progress: number;
  app_progress: number;
  ai_progress: number;
  trial_date: string | null;
  mp_date: string | null;
  launch_date: string | null;
  stage: string;
  at_risk: boolean;
}

export const STAGES = [
  "概念验证",
  "设计定型",
  "研发中",
  "试产阶段",
  "量产准备",
  "量产中",
  "已发售",
] as const;

export async function fetchBoard(): Promise<{
  lines: ProductLine[];
  products: Product[];
}> {
  const [linesRes, productsRes] = await Promise.all([
    supabase.from("product_lines").select("*").order("sort_order"),
    supabase.from("products").select("*").order("created_at"),
  ]);
  if (linesRes.error) throw linesRes.error;
  if (productsRes.error) throw productsRes.error;
  return {
    lines: (linesRes.data ?? []) as ProductLine[],
    products: (productsRes.data ?? []) as Product[],
  };
}

export async function createProduct(input: ProductInput) {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function createLine(input: { name: string; code: string; owner: string }) {
  const { data: existing } = await supabase
    .from("product_lines")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const next = ((existing?.[0]?.sort_order as number | undefined) ?? 0) + 1;
  const { error } = await supabase
    .from("product_lines")
    .insert({ ...input, sort_order: next });
  if (error) throw error;
}
