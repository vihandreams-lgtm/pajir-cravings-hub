import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { KeyRound, UserPlus } from "lucide-react";
import { createStaffAccount, listStaff } from "@/lib/staff.functions";
import { PanelCard, input, labelCls } from "./ui";

export function TeamPanel() {
  const qc = useQueryClient();
  const fetchStaff = useServerFn(listStaff);
  const addStaff = useServerFn(createStaffAccount);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => fetchStaff(),
  });

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await addStaff({ data: { email: form.email, password: form.password } });
      toast.success(`${result.email} can now sign in`);
      setForm({ email: "", password: "" });
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That account could not be created");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PanelCard
      title="Who can sign in"
      hint="There is no public sign-up. Access is handed out here, and the new account can sign in straight away."
    >
      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {staff.map((s) => (
          <div key={s.user_id} className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm">
            <KeyRound className="h-4 w-4 text-primary" />
            <span className="font-medium">{s.email}</span>
            {s.is_self && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">you</span>}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-2 rounded-2xl bg-secondary p-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className={labelCls}>Email</p>
          <input
            className={input}
            type="email"
            required
            placeholder="jireh@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="md:col-span-5">
          <p className={labelCls}>Temporary password</p>
          <input
            className={input}
            type="text"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          disabled={busy}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60 md:col-span-2"
        >
          <UserPlus className="h-4 w-4" /> {busy ? "Adding…" : "Add manager"}
        </button>
      </form>
    </PanelCard>
  );
}
