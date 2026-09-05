import { STAGES, type Product } from "@/lib/products";

const TRACKS = [
  { key: "hw_progress", label: "HW", color: "bg-glow" },
  { key: "app_progress", label: "APP", color: "bg-mint" },
  { key: "ai_progress", label: "AI", color: "bg-amber" },
] as const;

function fmt(d: string | null) {
  if (!d) return "--·--";
  const [, m, day] = d.split("-");
  return `${m}·${day}`;
}

function stageTone(stage: string, atRisk: boolean) {
  if (atRisk) return { dot: "bg-rose", text: "text-rose", ring: "ring-rose/40", bg: "bg-rose/10" };
  if (stage === "已发售" || stage === "量产中")
    return { dot: "bg-mint", text: "text-mint", ring: "ring-mint/40", bg: "bg-mint/10" };
  if (stage === "量产准备")
    return { dot: "bg-amber", text: "text-amber", ring: "ring-amber/40", bg: "bg-amber/10" };
  return { dot: "bg-glow", text: "text-glow", ring: "ring-glow/40", bg: "bg-glow/10" };
}

export function ProductRow({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: (p: Product) => void;
}) {
  const tone = stageTone(product.stage, product.at_risk);
  const stageIdx = STAGES.indexOf(product.stage as (typeof STAGES)[number]);
  // 里程碑节点点亮：试产(>=3)、量产(>=5)、发售(>=6)
  const lit = [stageIdx >= 3, stageIdx >= 5, stageIdx >= 6];

  return (
    <div className="metal-surface shine relative rounded-lg ring-1 ring-black/20 p-4 hover:ring-glow/30 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="min-w-0 w-40">
          <div className="font-display font-medium text-[15px] text-chrome leading-tight">
            {product.name}
          </div>
          <div className="font-mono text-[11px] text-dim mt-1">{product.description}</div>
        </div>

        <div className="flex-1 min-w-[260px] grid gap-2">
          {TRACKS.map((t) => (
            <div key={t.key} className="flex items-center gap-2">
              <span className="w-7 font-mono text-[10px] text-dim">{t.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-ink overflow-hidden">
                <div
                  className={`bar-anim h-full rounded-full ${t.color}`}
                  style={{ width: `${product[t.key]}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[11px] text-chrome">
                {product[t.key]}%
              </span>
            </div>
          ))}
        </div>

        <div className="w-56 shrink-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim mb-2">
            里程碑
          </div>
          <div className="relative flex items-center">
            <span className="flex-1 h-px bg-line" />
            <span
              className={`size-2.5 -ml-1 rounded-full ring-2 ring-ink ${lit[0] ? "bg-glow" : "bg-line"}`}
            />
            <span className="flex-1 h-px bg-line" />
            <span
              className={`size-2.5 -ml-1 rounded-full ring-2 ring-ink ${lit[1] ? "bg-amber" : "bg-line"}`}
            />
            <span className="flex-1 h-px bg-line" />
            <span
              className={`size-2.5 -ml-1 rounded-full ring-2 ring-ink ${lit[2] ? "bg-mint" : "bg-line"}`}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-chrome/80 mt-1.5">
            <span className={lit[0] && !lit[1] ? "text-glow" : ""}>试产 {fmt(product.trial_date)}</span>
            <span className={lit[1] && !lit[2] ? "text-amber" : ""}>量产 {fmt(product.mp_date)}</span>
            <span className={lit[2] ? "text-mint" : ""}>发售 {fmt(product.launch_date)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ring-1 ${tone.ring} ${tone.bg}`}
          >
            <span className={`size-1.5 rounded-full ${tone.dot}`} />
            <span className={`font-mono text-[11px] ${tone.text}`}>
              {product.stage}
              {product.at_risk ? " · 延期" : ""}
            </span>
          </div>
          <button
            onClick={() => onEdit(product)}
            className="font-mono text-[11px] text-dim hover:text-chrome transition-colors"
          >
            编辑 →
          </button>
        </div>
      </div>
    </div>
  );
}
