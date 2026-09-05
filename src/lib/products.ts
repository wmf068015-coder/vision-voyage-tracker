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

export const SOFTWARE_STAGES = ["使用中", "迭代中", "Bug修复中"] as const;
export const APP_AI_STAGES = [...STAGES, ...SOFTWARE_STAGES] as const;

export type Stage = (typeof STAGES)[number];
export type AppAiStage = (typeof APP_AI_STAGES)[number];
export const NOT_APPLICABLE = "不适用" as const;
export type TrackStatus = AppAiStage | typeof NOT_APPLICABLE;

// Progress is constrained to 0-100 in the existing database. One is reserved for N/A.
export const NOT_APPLICABLE_PROGRESS = 1;

export function stageToProgress(stage: Stage): number {
  return Math.round((STAGES.indexOf(stage) / (STAGES.length - 1)) * 100);
}

export function statusToProgress(status: TrackStatus): number {
  if (status === NOT_APPLICABLE) return NOT_APPLICABLE_PROGRESS;
  if (status === "使用中") return 2;
  if (status === "迭代中") return 3;
  if (status === "Bug修复中") return 4;
  return stageToProgress(status);
}

export function progressToStatus(progress: number): TrackStatus {
  if (progress === NOT_APPLICABLE_PROGRESS) return NOT_APPLICABLE;
  if (progress === 2) return "使用中";
  if (progress === 3) return "迭代中";
  if (progress === 4) return "Bug修复中";
  const index = Math.round((Math.max(0, Math.min(100, progress)) / 100) * (STAGES.length - 1));
  return STAGES[index];
}

export function isApplicableProgress(progress: number): boolean {
  return progress !== NOT_APPLICABLE_PROGRESS;
}

export function progressToDisplayPercent(progress: number): number {
  const status = progressToStatus(progress);
  if (status === NOT_APPLICABLE) return 0;
  if ((SOFTWARE_STAGES as readonly string[]).includes(status)) return 100;
  return progress;
}

export function isSoftwareProduct(product: Pick<Product, "hw_progress">): boolean {
  return !isApplicableProgress(product.hw_progress);
}

export function isReleasedStage(stage: string): boolean {
  return stage === "已发售" || (SOFTWARE_STAGES as readonly string[]).includes(stage);
}

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
  const { error } = await supabase.from("product_lines").insert({ ...input, sort_order: next });
  if (error) throw error;
}

export async function deleteLine(id: string) {
  const { error } = await supabase.from("product_lines").delete().eq("id", id);
  if (error) throw error;
}
