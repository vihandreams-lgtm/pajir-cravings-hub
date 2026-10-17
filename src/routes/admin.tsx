import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChefHat,
  Images,
  KeyRound,
  LayoutList,
  LogOut,
  MessageSquareQuote,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, menuQuery, siteAssetsQuery, testimonialsQuery } from "@/lib/menu";
import { ownerSetupAllowed } from "@/lib/admin-access";
import { StatCard, input } from "@/components/admin/ui";
import { MenuPanel } from "@/components/admin/MenuPanel";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";
import { HomePanel } from "@/components/admin/HomePanel";
import { TeamPanel } from "@/components/admin/TeamPanel";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Kitchen Manager — Pajir Cravings Hub" },
      { name: "description", content: "Manage the Pajir Cravings Hub menu, prices, photos and reviews." },
      { property: "og:title", content: "Kitchen Manager — Pajir Cravings Hub" },
      { property: "og:description", content: "Menu management for Pajir Cravings Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "categories", label: "Categories", icon: LayoutList },
  { id: "reviews", label: "Reviews", icon: MessageSquareQuote },
  { id: "home", label: "Homepage", icon: Images },
  { id: "team", label: "Access", icon: KeyRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") setUser(s?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  if (!user) return <Shell><AdminLogin /></Shell>;
  return <Shell><Dashboard user={user} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function AdminLogin() {
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("has_any_admin").then(({ data }) => setHasAdmin(data === true));
  }, []);

  const setup = hasAdmin === null ? false : ownerSetupAllowed(hasAdmin);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error, data } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (error) {
      toast.error(mode === "in" ? "Invalid admin credentials" : error.message);
      return;
    }
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account.");
  };

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-card shadow-warm">
      <div className="bg-primary px-6 py-7 text-primary-foreground">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-80">
          <ChefHat className="h-4 w-4" /> Pajir Cravings Hub
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold">Kitchen Manager</h1>
        <p className="mt-1 text-sm opacity-80">Sign in to update treats, photos and reviews.</p>
      </div>
      <form onSubmit={submit} className="space-y-3 p-6">
        <input
          className={input}
          type="email"
          required
          autoComplete="username"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={input}
          type="password"
          required
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {mode === "in" ? "Sign in" : "Create owner account"}
        </button>
        {setup && (
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="w-full text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "in" ? "First time? Create the owner account" : "Have an account? Sign in"}
          </button>
        )}
      </form>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const qc = useQueryClient();
  const go = useNavigate();
  const [tab, setTab] = useState<TabId>("menu");

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data ?? false,
  });
  const menu = useQuery(menuQuery);
  const cats = useQuery(categoriesQuery);
  const reviews = useQuery(testimonialsQuery);
  const assets = useQuery(siteAssetsQuery);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void go({ to: "/admin", replace: true });
  };

  if (roleLoading) return <p className="text-muted-foreground">Checking access…</p>;

  if (!isAdmin) {
    return (
      <div className="space-y-3 rounded-3xl bg-card p-6 shadow-warm">
        <p>This account doesn't have access to the kitchen manager.</p>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    );
  }

  const loading = menu.isLoading || cats.isLoading || reviews.isLoading || assets.isLoading;
  const items = menu.data ?? [];
  const categories = cats.data ?? [];
  const available = items.filter((i) => i.available).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-[#6d2b38] p-6 text-primary-foreground shadow-warm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-80">
              <ChefHat className="h-4 w-4" /> Pajir Cravings Hub
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold">Kitchen Manager</h1>
            <p className="mt-1 text-sm opacity-80">Signed in as {user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm transition hover:bg-primary-foreground/25"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<UtensilsCrossed className="h-4 w-4" />} label="Total items" value={items.length} hint={`${available} ready to serve`} />
        <StatCard icon={<LayoutList className="h-4 w-4" />} label="Active categories" value={categories.length} hint="Shown as homepage tabs" />
        <StatCard icon={<Star className="h-4 w-4" />} label="Recent reviews" value={reviews.data?.length ?? 0} hint="From the WhatsApp wall" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading your menu…</p>
      ) : (
        <>
          {tab === "menu" && <MenuPanel items={items} categories={categories} />}
          {tab === "categories" && <CategoriesPanel categories={categories} items={items} />}
          {tab === "reviews" && <ReviewsPanel reviews={reviews.data ?? []} />}
          {tab === "home" && <HomePanel saved={assets.data ?? { hero: null, banner: null }} />}
          {tab === "team" && <TeamPanel />}
        </>
      )}
    </div>
  );
}
