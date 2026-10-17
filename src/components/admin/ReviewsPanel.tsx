import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { testimonialsQuery, type Testimonial } from "@/lib/menu";
import { PanelCard, input, labelCls } from "./ui";

export function ReviewsPanel({ reviews }: { reviews: Testimonial[] }) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["testimonials"] });
  const [draft, setDraft] = useState({ customer_name: "", location: "", quote: "", verified: true });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("testimonials").insert({
      customer_name: draft.customer_name.trim(),
      location: draft.location.trim(),
      quote: draft.quote.trim(),
      verified: draft.verified,
      sort_order: reviews.length + 1,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Review added to the homepage");
    setDraft({ customer_name: "", location: "", quote: "", verified: true });
    refresh();
  };

  return (
    <PanelCard
      title="Straight from our WhatsApp"
      hint="Reviews rotate on the homepage. The checkmark shows the blue tick badge."
    >
      <form onSubmit={add} className="grid gap-2 rounded-2xl bg-secondary p-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className={labelCls}>Customer name</p>
          <input
            className={input}
            required
            placeholder="e.g. Sarah"
            value={draft.customer_name}
            onChange={(e) => setDraft({ ...draft, customer_name: e.target.value })}
          />
        </div>
        <div className="md:col-span-4">
          <p className={labelCls}>Location</p>
          <input
            className={input}
            placeholder="e.g. Kira"
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm md:col-span-4">
          <input
            type="checkbox"
            checked={draft.verified}
            onChange={(e) => setDraft({ ...draft, verified: e.target.checked })}
          />
          Show checkmark
        </label>
        <div className="md:col-span-12">
          <p className={labelCls}>Review quote</p>
          <textarea
            className={input}
            rows={2}
            required
            placeholder="What did they say?"
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          />
        </div>
        <button className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5 md:col-span-12">
          <Plus className="h-4 w-4" /> Add review
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <ReviewRow key={r.id} review={r} onSaved={refresh} />
        ))}
        {reviews.length === 0 && (
          <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground">
            No reviews yet — the homepage review section stays hidden until you add one.
          </p>
        )}
      </div>
    </PanelCard>
  );
}

function ReviewRow({ review, onSaved }: { review: Testimonial; onSaved: () => void }) {
  const [f, setF] = useState({
    customer_name: review.customer_name,
    location: review.location,
    quote: review.quote,
    verified: review.verified,
  });

  const save = async () => {
    const { error } = await supabase
      .from("testimonials")
      .update({
        customer_name: f.customer_name,
        location: f.location,
        quote: f.quote,
        verified: f.verified,
      })
      .eq("id", review.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      onSaved();
    }
  };

  const remove = async () => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", review.id);
    if (error) toast.error(error.message);
    else onSaved();
  };

  return (
    <div className="grid gap-2 rounded-2xl bg-card p-4 shadow-sm md:grid-cols-12 md:items-start">
      <div className="md:col-span-3">
        <p className={labelCls}>Customer name</p>
        <input
          className={input}
          value={f.customer_name}
          onChange={(e) => setF({ ...f, customer_name: e.target.value })}
        />
      </div>
      <div className="md:col-span-3">
        <p className={labelCls}>Location</p>
        <input
          className={input}
          value={f.location}
          onChange={(e) => setF({ ...f, location: e.target.value })}
        />
      </div>
      <label className="flex items-end gap-2 pb-2 text-sm md:col-span-2">
        <input type="checkbox" checked={f.verified} onChange={(e) => setF({ ...f, verified: e.target.checked })} />
        Checkmark
      </label>
      <div className="md:col-span-12">
        <p className={labelCls}>Review quote</p>
        <textarea
          className={input}
          rows={2}
          value={f.quote}
          onChange={(e) => setF({ ...f, quote: e.target.value })}
        />
      </div>
      <div className="flex gap-2 md:col-span-12">
        <button
          onClick={save}
          className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5"
        >
          Save
        </button>
        <button
          onClick={remove}
          aria-label="Delete review"
          className="inline-flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-sm text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
}
