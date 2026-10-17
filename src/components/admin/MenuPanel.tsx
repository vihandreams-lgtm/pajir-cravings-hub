import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatUGX, menuQuery, type MenuItem, type MenuCategoryRow } from "@/lib/menu";
import { PanelCard, PhotoPicker, input, labelCls } from "./ui";

export function MenuPanel({
  items,
  categories,
}: {
  items: MenuItem[];
  categories: MenuCategoryRow[];
}) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["menu"] });

  const [slug, setSlug] = useState(categories[0]?.slug ?? "");
  const [draft, setDraft] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    if (categories.length && !categories.some((c) => c.slug === slug)) setSlug(categories[0]!.slug);
  }, [categories, slug]);

  const shown = useMemo(() => items.filter((i) => i.category === slug), [items, slug]);
  const active = categories.find((c) => c.slug === slug);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      toast.error("Add a category first");
      return;
    }
    const { error } = await supabase.from("menu_items").insert({
      name: draft.name.trim(),
      price: Number(draft.price) || 0,
      description: draft.description.trim(),
      category: slug,
      sort_order: items.length + 1,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${draft.name.trim()} added to ${active?.label ?? "the menu"}`);
    setDraft({ name: "", price: "", description: "" });
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => {
          const count = items.filter((i) => i.category === c.slug).length;
          return (
            <button
              key={c.id}
              onClick={() => setSlug(c.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                slug === c.slug
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {c.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">Add a category first, then treats will land here.</p>
        )}
      </div>

      <form onSubmit={add} className="grid gap-2 rounded-3xl bg-secondary p-5 md:grid-cols-12">
        <p className="font-display text-lg font-bold text-primary md:col-span-12">
          Add a new treat to {active?.label ?? "…"}
        </p>
        <input
          className={`${input} md:col-span-4`}
          required
          placeholder="Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          className={`${input} md:col-span-2`}
          required
          type="number"
          min={0}
          placeholder="Price UGX"
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
        />
        <input
          className={`${input} md:col-span-4`}
          placeholder="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <button className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5 md:col-span-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="space-y-3">
        {shown.map((item) => (
          <ItemRow key={item.id} item={item} onSaved={refresh} />
        ))}
        {shown.length === 0 && (
          <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground">
            Nothing in this category yet — add your first treat above.
          </p>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, onSaved }: { item: MenuItem; onSaved: () => void }) {
  const [f, setF] = useState({
    name: item.name,
    price: item.price,
    discount_percent: item.discount_percent,
    available: item.available,
    description: item.description,
    image_path: item.image_path,
    preview: item.image_url,
  });

  useEffect(() => {
    setF({
      name: item.name,
      price: item.price,
      discount_percent: item.discount_percent,
      available: item.available,
      description: item.description,
      image_path: item.image_path,
      preview: item.image_url,
    });
  }, [item]);

  const save = async () => {
    const { error } = await supabase
      .from("menu_items")
      .update({
        name: f.name,
        price: f.price,
        discount_percent: f.discount_percent,
        available: f.available,
        description: f.description,
        image_url: f.image_path,
      })
      .eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      onSaved();
    }
  };

  const remove = async () => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else onSaved();
  };

  return (
    <div className="grid gap-3 rounded-2xl bg-card p-4 shadow-sm md:grid-cols-12 md:items-start">
      <div className="md:col-span-4">
        <PhotoPicker
          label="Photo"
          path={f.image_path}
          preview={f.preview}
          onChange={(path, url) => setF((s) => ({ ...s, image_path: path, preview: url }))}
        />
      </div>
      <div className="space-y-2 md:col-span-8">
        <input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <p className={labelCls}>Price UGX</p>
            <input
              className={input}
              type="number"
              value={f.price}
              onChange={(e) => setF({ ...f, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <p className={labelCls}>Discount %</p>
            <input
              className={input}
              type="number"
              min={0}
              max={100}
              value={f.discount_percent}
              onChange={(e) => setF({ ...f, discount_percent: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={f.available}
              onChange={(e) => setF({ ...f, available: e.target.checked })}
            />
            Available
          </label>
        </div>
        <textarea
          className={input}
          rows={2}
          placeholder="Description"
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={save}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5"
          >
            Save
          </button>
          <button
            onClick={remove}
            aria-label="Delete item"
            className="inline-flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-sm text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <p className="ml-auto text-xs text-muted-foreground">
            Customer pays {formatUGX(Math.round(f.price * (1 - Math.min(Math.max(f.discount_percent, 0), 100) / 100)))}
          </p>
        </div>
      </div>
    </div>
  );
}
