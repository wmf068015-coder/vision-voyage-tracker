import { useState } from "react";
import { createLine } from "@/lib/products";

const inputCls =
  "w-full rounded-md bg-ink ring-1 ring-line px-3 py-2 text-sm text-chrome placeholder:text-dim focus:outline-none focus:ring-glow/60";
const labelCls = "block font-mono text-[10px] uppercase tracking-[0.15em] text-dim mb-1.5";

export function LineDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [owner, setOwner] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const save = async () => {
    if (!name.trim()) return setError("请填写产品线名称");
    setSaving(true);
    setError("");
    try {
      await createLine({
        name: name.trim(),
        code: code.trim() || name.trim()[0] || "?",
        owner: owner.trim(),
      });
      setName("");
      setCode("");
      setOwner("");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="metal-surface shine relative w-full max-w-sm rounded-xl ring-1 ring-black/40 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-lg text-chrome">新建产品线</h2>
        <p className="font-mono text-[11px] text-dim mt-1">PRODUCT LINE / NEW</p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className={labelCls}>产品线名称</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如 NEEWER HOME"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>代号</label>
              <input
                className={inputCls}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="A"
                maxLength={2}
              />
            </div>
            <div>
              <label className={labelCls}>负责人</label>
              <input
                className={inputCls}
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="姓名"
              />
            </div>
          </div>

          {error && <p className="font-mono text-[12px] text-rose">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="chrome-surface rounded-md px-4 py-2 font-mono text-[13px] font-medium text-ink hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "创建中…" : "创建产品线"}
            </button>
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 font-mono text-[13px] text-dim hover:text-chrome ring-1 ring-line bg-panel"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
