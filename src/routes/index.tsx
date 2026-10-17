import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Gift, Leaf, MapPin, MessageCircle, Minus, Phone, Plus, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useCart } from "@/lib/cart";
import {
  CATEGORIES, buildOrderMessage, categoriesQuery, fallbackImage, finalPrice, formatUGX, menuQuery,
  siteAssetsQuery, testimonialsQuery, whatsappLink, type MenuItem,
} from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pajir Cravings Hub — Café & Bakery in Kira, Uganda" },
      { name: "description", content: "Fresh natural juices, smoothies, cookies, breakfast platters and soups in Kira. Order on WhatsApp." },
      { property: "og:title", content: "Pajir Cravings Hub — Precision in Every Taste" },
      { property: "og:description", content: "Fresh juices, cookies and hearty meals in Kira, Uganda. Order via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(menuQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
      context.queryClient.ensureQueryData(siteAssetsQuery),
    ]),
  component: Home,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <Specials />
      <Banner />
      <Menu />
      <Testimonials />
      <Footer />
      <CartDrawer />
      <a
        href={whatsappLink("Hello Pajir Cravings Hub! 👋")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-warm transition-transform hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">P</span>
          <span className="font-display text-lg font-bold text-primary sm:text-xl">Pajir Cravings Hub</span>
        </a>
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary transition hover:scale-105"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}

function Hero() {
  const { data: assets } = useSuspenseQuery(siteAssetsQuery);
  return (
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" /> Location: Kira, Uganda
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] text-primary md:text-6xl">Precision in Every Taste</h1>
          <p className="mt-4 text-lg text-muted-foreground">Made with Love. Served with Joy. Fresh juices, oven-warm cookies and hearty plates — prepared every morning.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-warm transition hover:-translate-y-0.5">View Full Menu</a>
            <a href={whatsappLink("Hello Pajir Cravings Hub! 👋 I'd like to order.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-medium text-primary-foreground transition hover:-translate-y-0.5">
              <MessageCircle className="h-5 w-5" /> Order via WhatsApp
            </a>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9 }} className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-secondary" />
          <img src={assets.hero ?? heroImg} alt="Juices, cookies and pastries from Pajir Cravings Hub" width={1600} height={1008} className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-warm" />
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-warm">
            <Leaf className="h-5 w-5 text-leaf" /><span className="text-sm font-medium">100% Natural</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Specials() {
  const [stamps, setStamps] = useState(3);
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <motion.div {...fadeUp} className="rounded-3xl bg-primary p-7 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm uppercase tracking-widest opacity-80"><Gift className="h-4 w-4" /> Loyalty Program</div>
        <h2 className="mt-2 text-3xl font-bold">Buy 10 Times • Get 1 Free Gift</h2>
        <p className="mt-1 opacity-80">Tap the stamps to see how it works.</p>
        <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => setStamps(i + 1 === stamps ? i : i + 1)}
              className={`flex aspect-square items-center justify-center rounded-full border-2 border-primary-foreground/50 text-sm font-semibold transition ${i < stamps ? "bg-primary-foreground text-primary" : "bg-transparent"}`}
              aria-label={`Stamp ${i + 1}`}
            >
              {i === 9 ? <Gift className="h-4 w-4" /> : i + 1}
            </motion.button>
          ))}
        </div>
        <p className="mt-4 text-sm opacity-90">{stamps >= 10 ? "🎉 Your free gift is ready!" : `${10 - stamps} more orders until your free gift`}</p>
      </motion.div>
    </section>
  );
}

function Banner() {
  const { data: assets } = useSuspenseQuery(siteAssetsQuery);
  if (!assets.banner) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-2">
      <motion.div {...fadeUp} className="overflow-hidden rounded-[2rem] shadow-warm">
        <img src={assets.banner} alt="Freshly prepared at Pajir Cravings Hub" className="h-48 w-full object-cover md:h-64" />
      </motion.div>
    </section>
  );
}

function Menu() {
  const { data } = useSuspenseQuery(menuQuery);
  const { data: dbCats } = useSuspenseQuery(categoriesQuery);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const tabs = useMemo(() => {
    const rows = dbCats.length
      ? dbCats.map((c) => ({ id: c.slug, label: c.label }))
      : CATEGORIES.filter((c) => c.id !== "all").map((c) => ({ id: c.id, label: c.label }));
    return [{ id: "all", label: "All Items" }, ...rows];
  }, [dbCats]);
  const items = useMemo(
    () => data.filter((i) => i.available && (cat === "all" || i.category === cat) && i.name.toLowerCase().includes(q.toLowerCase())),
    [data, cat, q],
  );
  return (
    <section id="menu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
      <motion.div {...fadeUp} className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-leaf">Our Menu</p>
        <h2 className="mt-2 text-4xl font-bold text-primary">Good Food, Good Vibes Always</h2>
      </motion.div>
      <div className="relative mx-auto mt-8 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search juices, cookies, soups…" className="w-full rounded-full border border-input bg-card py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
        {tabs.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${cat === c.id ? "text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
            {cat === c.id && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-primary" />}
            <span className="relative">{c.label}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => <ProductCard key={item.id} item={item} />)}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && <p className="mt-10 text-center text-muted-foreground">No treats match your search.</p>}
    </section>
  );
}

function ProductCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const price = finalPrice(item);
  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-warm">
      <div className="relative overflow-hidden [perspective:800px]">
        <img src={item.image_url || fallbackImage(item.category)} alt={item.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-110 group-hover:[transform:scale(1.1)_rotateX(4deg)]" />
        {item.discount_percent > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf px-3 py-1 text-xs font-semibold text-leaf-foreground"><Sparkles className="h-3 w-3" />{item.discount_percent}% OFF</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{item.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-primary">{formatUGX(price)}</span>
          {item.discount_percent > 0 && <span className="text-sm text-muted-foreground line-through">{formatUGX(item.price)}</span>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { add(item); toast.success(`${item.name} added to cart`); }}
            className="rounded-full bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 hover:shadow-warm"
          >
            Add to Cart
          </motion.button>
          <motion.a
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            href={whatsappLink(buildOrderMessage([{ name: item.name, qty: 1, unitPrice: price }], ""))}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-whatsapp px-3 py-2.5 text-sm font-medium text-whatsapp transition-colors hover:bg-whatsapp hover:text-primary-foreground hover:shadow-warm"
          >
            <MessageCircle className="h-4 w-4" /> Quick Order
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}

function Testimonials() {
  const { data: reviews } = useSuspenseQuery(testimonialsQuery);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reviews.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % reviews.length), 4500);
    return () => clearInterval(t);
  }, [reviews.length]);
  if (reviews.length === 0) return null;
  const r = reviews[Math.min(i, reviews.length - 1)]!;
  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-bold text-primary">Straight from our WhatsApp</h2>
        <div className="relative mt-8 min-h-44">
          <AnimatePresence mode="wait">
            <motion.div key={r.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }} className="mx-auto max-w-md rounded-3xl rounded-bl-md bg-card p-6 text-left shadow-warm">
              <p className="text-lg">{r.quote}</p>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>— {r.customer_name}{r.location ? `, ${r.location}` : ""}</span>
                {r.verified && <span className="text-whatsapp">✓✓</span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {reviews.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {reviews.map((rev, k) => (
              <button key={rev.id} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-primary/30"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary py-12 text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">Pajir Cravings Hub</p>
          <p className="mt-2 opacity-80">Made with Love. Served with Joy.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kira, Uganda</p>
          <a href="tel:0774501297" className="flex items-center gap-2 hover:underline"><Phone className="h-4 w-4" /> 0774501297</a>
          <a href="https://www.tiktok.com/@pajirkitchenandoven" target="_blank" rel="noreferrer" className="block hover:underline">TikTok: @pajirkitchenandoven</a>
        </div>
        <div className="text-sm">
          <p className="opacity-90">Freshly prepared every morning with quality ingredients.</p>
        </div>
      </div>
      <p className="mt-10 text-center text-xs opacity-60">© {new Date().getFullYear()} Pajir Cravings Hub · Good Food, Good Vibes Always.</p>
    </footer>
  );
}

function CartDrawer() {
  const { lines, open, setOpen, setQty, subtotal } = useCart();
  const [location, setLocation] = useState("");
  const checkout = () => {
    const msg = buildOrderMessage(lines.map((l) => ({ name: l.item.name, qty: l.qty, unitPrice: finalPrice(l.item) })), location);
    window.open(whatsappLink(msg), "_blank");
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-foreground/40" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-2xl font-bold text-primary">Your Cart</h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {lines.length === 0 && <p className="py-10 text-center text-muted-foreground">Your cart is empty — go grab a treat!</p>}
              {lines.map(({ item, qty }) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-card p-3">
                  <img src={item.image_url || fallbackImage(item.category)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-sm text-primary">{formatUGX(finalPrice(item) * qty)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease" className="rounded-full bg-secondary p-1"><Minus className="h-4 w-4" /></button>
                      <span className="w-6 text-center font-medium">{qty}</span>
                      <button onClick={() => setQty(item.id, qty + 1)} aria-label="Increase" className="rounded-full bg-secondary p-1"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t p-5">
              <label className="block text-sm font-medium" htmlFor="loc">Delivery Location / Special Instructions in Kira</label>
              <textarea id="loc" value={location} onChange={(e) => setLocation(e.target.value)} rows={2} placeholder="e.g. Kira Town, near the market. Less sugar please." className="w-full rounded-2xl border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex justify-between text-lg font-semibold"><span>Subtotal</span><span className="text-primary">{formatUGX(subtotal)}</span></div>
              <button disabled={lines.length === 0} onClick={checkout} className="flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp py-3.5 font-medium text-primary-foreground transition disabled:opacity-50">
                <MessageCircle className="h-5 w-5" /> Checkout via WhatsApp
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
