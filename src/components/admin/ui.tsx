import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadPhoto } from "@/lib/upload";

export const input =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export const labelCls = "text-xs font-semibold uppercase tracking-wide text-primary/70";

export function PanelCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-warm">
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-warm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-80">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
    </div>
  );
}

export function PhotoPicker({
  label,
  path,
  preview,
  onChange,
}: {
  label: string;
  path: string | null;
  preview: string | null;
  onChange: (path: string | null, url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const result = await uploadPhoto(file);
      onChange(result.path, result.url);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void pick(e.dataTransfer.files?.[0]);
        }}
        className={`mt-1 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed p-3 transition ${
          over ? "border-primary bg-secondary/60" : "border-input"
        }`}
      >
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary/50">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            Choose photo
          </button>
          <span className="text-xs text-muted-foreground">or drop one here</span>
          {path && (
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
