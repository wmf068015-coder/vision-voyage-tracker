import { useEffect, useState } from "react";
import {
  STAGES,
  createProduct,
  deleteProduct,
  updateProduct,
  type Product,
  type ProductInput,
  type ProductLine,
} from "@/lib/products";

const EMPTY: ProductInput = {
  line_id: "",
  name: "",
  description: "",
  hw_progress: 0,
  app_progress: 0,
  ai_progress: 0,
  trial_date: null,
  mp_date: null,
  launch_date: null,
  stage: "研发中",
  at_risk: false,
};

const inputCls =
  "w-full rounded-md bg-ink ring-1 ring-line px-3 py-2 text-sm text-chrome placeholder:text-dim focus:outline-none focus:ring-glow/60";
const labelCls = "block font-mono text-[10px] uppercase tracking-[0.15em] text-dim mb-1.5";

export function ProductDialog({
  open,
  onClose,
  onSaved,
  lines,
  product,
  defaultLineId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  lines: ProductLine[];
  product: Product | null;
  defaultLineId?: string | undefined;
}) {
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (product) {
      setForm({
        line_id: product.line_id,
        name: product.name,
        description: product.description,
        hw_progress: product.hw_progress,
        app_progress: product.app_progress,
        ai_progress: product.ai_progress,
        trial_date: product.trial_date,
        mp_date: product.mp_date,
        launch_date: product.launch_date,
        stage: product.stage,
        at_risk: product.at_risk,
      });
    } else {
      setForm({ ...EMPTY, line_id: defaultLineId ?? lines[0]?.id ?? "" });
    }
  }, [open, product, defaultLineId, lines]);

  if (!open) return null;

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return setError("请填写产品名称");
    if (!form.line_id) return setError("请选择产品线");
    setSaving(true);
    setError("");
    try {
      if (product) await updateProduct(product.id, form);
      else await createProduct(form);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!product) return;
    setSaving(true);
    try {
      await deleteProduct(product.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="metal-surface shine relative w-full max-w-lg rounded-xl ring-1 ring-black/40 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-lg text-chrome">
          {product ? "编辑产品" : "新建产品"}
        </h2>
        <p className="font-mono text-[11px] text-dim mt-1">PRODUCT / CONFIG</p>

        <div className="mt-5 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>产品名称</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="如 Aurora One"
              />
            </div>
            <div>
              <label className={labelCls}>所属产品线</label>
              <select
                className={inputCls}
                value={form.line_id}
                onChange={(e) => set("line_id", e.target.value)}
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>产品描述</label>
            <input
              className={inputCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="如 旗舰家庭音箱"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(
              [
                ["hw_progress", "硬件进度 %"],
                ["app_progress", "App 进度 %"],
                ["ai_progress", "AI 进度 %"],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <label className={labelCls}>{label}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={form[k]}
                  onChange={(e) =>
                    set(k, Math.max(0, Math.min(100, Number(e.target.value) || 0)))
                  }
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(
              [
                ["trial_date", "预期试产"],
                ["mp_date", "预期量产"],
                ["launch_date", "正式发售"],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <label className={labelCls}>{label}</label>
                <input
                  type="date"
                  className={`${inputCls} [color-scheme:dark]`}
                  value={form[k] ?? ""}
                  onChange={(e) => set(k, e.target.value || null)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelCls}>当前阶段</label>
              <select
                className={inputCls}
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.at_risk}
                onChange={(e) => set("at_risk", e.target.checked)}
                className="size-4 accent-rose-400"
              />
              <span className="text-sm text-chrome">标记为延期风险</span>
            </label>
          </div>

          {error && <p className="font-mono text-[12px] text-rose">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="chrome-surface rounded-md px-4 py-2 font-mono text-[13px] font-medium text-ink hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "保存中…" : product ? "保存修改" : "创建产品"}
            </button>
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 font-mono text-[13px] text-dim hover:text-chrome ring-1 ring-line bg-panel"
            >
              取消
            </button>
            {product && (
              <button
                onClick={remove}
                disabled={saving}
                className="ml-auto rounded-md px-4 py-2 font-mono text-[13px] text-rose ring-1 ring-rose/40 bg-rose/10 hover:bg-rose/20 disabled:opacity-50"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
