import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchBoard, STAGES, type Product } from "@/lib/products";
import { ProductRow } from "@/components/ProductRow";
import { ProductDialog } from "@/components/ProductDialog";
import { LineDialog } from "@/components/LineDialog";

const TITLE = "产品线作战总览 | 硬件·App·AI 进度看板";
const DESC =
  "按产品线追踪每个产品的硬件、App、AI 三条研发进度，以及预期试产、量产与正式发售时间，让各业务线随时掌握彼此节奏。";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["board"],
    queryFn: fetchBoard,
  });

  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [defaultLine, setDefaultLine] = useState<string | undefined>();

  const refresh = () => qc.invalidateQueries({ queryKey: ["board"] });

  useEffect(() => {
    const channel = supabase
      .channel("board-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_lines" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = data?.lines ?? [];
  const products = useMemo(() => data?.products ?? [], [data]);

  const stats = useMemo(() => {
    const shipped = products.filter((p) => p.stage === "已发售").length;
    const risky = products.filter((p) => p.at_risk).length;
    const inProgress = products.length - shipped;
    const now = Date.now();
    const soon = products.filter((p) => {
      if (!p.trial_date) return false;
      const d = new Date(p.trial_date).getTime();
      return d >= now && d - now <= 30 * 864e5;
    }).length;
    const avg = products.length
      ? Math.round(
          products.reduce((s, p) => s + (p.hw_progress + p.app_progress + p.ai_progress) / 3, 0) /
            products.length,
        )
      : 0;
    return { shipped, risky, inProgress, soon, avg };
  }, [products]);

  const visibleLines = filter === "all" ? lines : lines.filter((l) => l.id === filter);

  const openNew = (lineId?: string) => {
    setEditing(null);
    setDefaultLine(lineId);
    setProductOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setProductOpen(true);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-ink font-body text-chrome antialiased selection:bg-glow/30">
      <header className="chrome-surface shine relative border-b border-black/20">
        <div className="mx-auto max-w-[1440px] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-9 rounded-[10px] metal-surface ring-1 ring-black/20 text-chrome font-display font-semibold text-sm">
              研
            </div>
            <div className="leading-none">
              <div className="font-display font-semibold text-[15px] text-ink/90 tracking-tight">
                产品研发指挥台
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 mt-1">
                Hardware Command
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full metal-surface ring-1 ring-black/20 px-3 py-1.5">
              <span className="size-2 rounded-full bg-mint live-dot" />
              <span className="font-mono text-[11px] text-chrome">实时同步</span>
            </div>
            <button
              onClick={() => setLineOpen(true)}
              className="font-mono text-[12px] font-medium text-ink/70 hover:text-ink ring-1 ring-black/20 rounded-md px-3 py-1.5 bg-ink/5"
            >
              + 产品线
            </button>
            <button
              onClick={() => openNew()}
              className="font-mono text-[12px] font-medium text-ink/80 hover:text-ink ring-1 ring-black/20 rounded-md px-3 py-1.5 bg-ink/10"
            >
              + 新建产品
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-6 space-y-6">
        <section className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-display font-semibold text-[22px] leading-tight text-chrome max-w-[40ch] text-balance">
              产品线作战总览
            </h1>
            <p className="text-sm text-dim mt-1.5 max-w-[52ch] text-pretty">
              硬件 · App · AI 三线并行推进，试产 / 量产 / 发售节点实时对齐，各业务线进度一目了然。
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-dim mr-1">
              筛选
            </span>
            <button
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "font-mono text-[12px] rounded-md px-3 py-1.5 chrome-surface text-ink font-medium ring-1 ring-black/20"
                  : "font-mono text-[12px] rounded-md px-3 py-1.5 text-chrome/80 hover:text-chrome ring-1 ring-line bg-panel"
              }
            >
              全部
            </button>
            {lines.map((l) => (
              <button
                key={l.id}
                onClick={() => setFilter(l.id)}
                className={
                  filter === l.id
                    ? "font-mono text-[12px] rounded-md px-3 py-1.5 chrome-surface text-ink font-medium ring-1 ring-black/20"
                    : "font-mono text-[12px] rounded-md px-3 py-1.5 text-chrome/80 hover:text-chrome ring-1 ring-line bg-panel"
                }
              >
                {l.name.split(" / ")[0]}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "进行中", value: pad(stats.inProgress), tone: "text-chrome", note: `共 ${products.length} 个产品` },
            { label: "已发售", value: pad(stats.shipped), tone: "text-mint", note: "在售 · 稳定" },
            { label: "延期风险", value: pad(stats.risky), tone: "text-rose", note: stats.risky ? "需尽快处置" : "暂无风险" },
            { label: "试产窗口", value: pad(stats.soon), tone: "text-amber", note: "未来 30 天" },
            { label: "三线平均进度", value: `${stats.avg}%`, tone: "text-chrome", note: "硬件 / App / AI" },
          ].map((s) => (
            <div
              key={s.label}
              className="metal-surface shine relative rounded-lg ring-1 ring-black/20 px-4 py-3"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                {s.label}
              </div>
              <div className={`font-display font-semibold text-3xl mt-1 ${s.tone}`}>{s.value}</div>
              <div className="font-mono text-[11px] text-dim mt-0.5">{s.note}</div>
            </div>
          ))}
        </section>

        <div className="flex items-center gap-5 font-mono text-[11px] text-dim flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-glow" />
            硬件
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-mint" />
            App
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-sm bg-amber" />
            AI
          </span>
          <span className="ml-auto">阶段流转：{STAGES.join(" › ")}</span>
        </div>

        {isLoading && <p className="font-mono text-sm text-dim py-8">载入中…</p>}
        {error && (
          <p className="font-mono text-sm text-rose py-8">
            数据载入失败，请刷新页面重试。
          </p>
        )}

        {visibleLines.map((line) => {
          const items = products.filter((p) => p.line_id === line.id);
          return (
            <section key={line.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-glow">{line.code}</span>
                <h2 className="font-display font-medium text-[15px] text-chrome tracking-tight">
                  {line.name}
                </h2>
                <span className="font-mono text-[11px] text-dim">
                  {items.length} 产品{line.owner ? ` · ${line.owner}` : ""}
                </span>
                <span className="flex-1 h-px bg-line" />
                <button
                  onClick={() => openNew(line.id)}
                  className="font-mono text-[11px] text-dim hover:text-chrome transition-colors"
                >
                  + 添加
                </button>
              </div>

              {items.length === 0 ? (
                <div className="rounded-lg ring-1 ring-line bg-panel px-4 py-6 text-center font-mono text-[12px] text-dim">
                  该产品线暂无产品
                </div>
              ) : (
                items.map((p) => <ProductRow key={p.id} product={p} onEdit={openEdit} />)
              )}
            </section>
          );
        })}

        <footer className="pt-2 pb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
          <span>内部作战看板</span>
          <span>数据实时同步</span>
        </footer>
      </main>

      <ProductDialog
        open={productOpen}
        onClose={() => setProductOpen(false)}
        onSaved={refresh}
        lines={lines}
        product={editing}
        defaultLineId={defaultLine}
      />
      <LineDialog open={lineOpen} onClose={() => setLineOpen(false)} onSaved={refresh} />
    </div>
  );
}
