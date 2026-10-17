import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { siteAssetsQuery, isLibraryPath } from "@/lib/menu";
import { PanelCard, PhotoPicker } from "./ui";

const SLOTS = [
  { key: "hero", title: "Hero photo", hint: "The picture beside the big headline at the very top." },
  { key: "banner", title: "Section banner", hint: "A wide photo strip shown just under the loyalty card. Leave empty to hide it." },
] as const;

export function HomePanel({ saved }: { saved: Record<string, string | null> }) {
  const qc = useQueryClient();
  const [paths, setPaths] = useState<Record<string, string | null>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const nextPaths: Record<string, string | null> = {};
    const nextPreviews: Record<string, string | null> = {};
    for (const slot of SLOTS) {
      const value = saved[slot.key] ?? null;
      nextPaths[slot.key] = isLibraryPath(value) ? value : null;
      nextPreviews[slot.key] = value;
    }
    setPaths(nextPaths);
    setPreviews(nextPreviews);
  }, [saved]);

  const store = async (key: string, url: string | null) => {
    const { error } = await supabase.from("site_assets").update({ url: url ?? "" }).eq("key", key);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["site-assets"] });
    qc.invalidateQueries({ queryKey: ["menu"] });
    toast.success("Homepage updated");
  };

  return (
    <div className="space-y-5">
      {SLOTS.map((slot) => (
        <PanelCard key={slot.key} title={slot.title} hint={slot.hint}>
          <PhotoPicker
            label={slot.title}
            path={paths[slot.key] ?? null}
            preview={previews[slot.key] ?? null}
            onChange={(path, url) => {
              setPaths((s) => ({ ...s, [slot.key]: path }));
              setPreviews((s) => ({ ...s, [slot.key]: url }));
              void store(slot.key, path ?? null);
            }}
          />
          <button
            onClick={() => {
              setPaths((s) => ({ ...s, [slot.key]: null }));
              setPreviews((s) => ({ ...s, [slot.key]: null }));
              void store(slot.key, null);
            }}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Use the built-in photo
          </button>
        </PanelCard>
      ))}
    </div>
  );
}
