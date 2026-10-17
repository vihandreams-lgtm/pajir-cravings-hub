import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriesQuery,
  type MenuCategoryRow,
  type MenuItem,
} from "@/lib/menu";
import { categoryHasItems, slugifyCategory } from "@/lib/admin-access";
import { PanelCard, input, labelCls } from "./ui";

export function CategoriesPanel({
  categories,
  items,
}: {
  categories: MenuCategoryRow[];
  items: MenuItem[];
}) {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["menu-categories"] });
    qc.invalidateQueries({ queryKey: ["menu"] });
  };

  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [touchedSlug, setTouchedSlug] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = label.trim();
    const code = (touchedSlug ? slug : slugifyCategory(name)).trim();
    if (!name || !code) {
      toast.error("Give the category a name");
      return;
    }
    if (categories.some((c) => c.slug === code)) {
      toast.error("That category already exists");
      return;
    }
    const { error } = await supabase
      .from("menu_categories")
      .insert({ label: name, slug: code, sort_order: categories.length + 1 });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${name} added`);
    setLabel("");
    setSlug("");
    setTouchedSlug(false);
    refresh();
  };

  const rename = async (row: MenuCategoryRow, nextLabel: string) => {
    const { error } = await supabase
      .from("menu_categories")
      .update({ label: nextLabel })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
  };

  const remove = async (row: MenuCategoryRow) => {
    if (categoryHasItems(row.slug, items)) {
      toast.error("Move or delete this category's treats first");
      return;
    }
    if (!confirm(`Delete the category "${row.label}"?`)) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else refresh();
  };

  return (
    <PanelCard
      title="Menu categories"
      hint="These are the tabs customers see on the homepage, in this order."
    >
      <form onSubmit={add} className="grid gap-2 rounded-2xl bg-secondary p-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className={labelCls}>Category name</p>
          <input
            className={input}
            required
            placeholder="e.g. Cakes & Pastries"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (!touchedSlug) setSlug(slugifyCategory(e.target.value));
            }}
          />
        </div>
        <div className="md:col-span-5">
          <p className={labelCls}>Menu code (used to file treats)</p>
          <input
            className={input}
            value={slug}
            onChange={(e) => {
              setTouchedSlug(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
            }}
          />
        </div>
        <button className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5 md:col-span-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {categories.map((row) => (
          <CategoryRow key={row.id} row={row} count={items.filter((i) => i.category === row.slug).length} onSave={rename} onDelete={remove} />
        ))}
      </div>
    </PanelCard>
  );
}

function CategoryRow({
  row,
  count,
  onSave,
  onDelete,
}: {
  row: MenuCategoryRow;
  count: number;
  onSave: (row: MenuCategoryRow, label: string) => void;
  onDelete: (row: MenuCategoryRow) => void;
}) {
  const [name, setName] = useState(row.label);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 shadow-sm">
      <input
        className={`${input} min-w-40 flex-1`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Category name"
      />
      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
        {row.slug} · {count} treat{count === 1 ? "" : "s"}
      </span>
      <button
        onClick={() => onSave(row, name.trim() || row.label)}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5"
      >
        Save
      </button>
      <button
        onClick={() => onDelete(row)}
        aria-label="Delete category"
        className="rounded-full bg-muted p-2 text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
