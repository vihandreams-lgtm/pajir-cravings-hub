import juiceImg from "@/assets/juice.jpg";
import cookiesImg from "@/assets/cookies.jpg";
import kitchenImg from "@/assets/kitchen.jpg";
import { supabase } from "@/integrations/supabase/client";

/** Built-in list, used only until the admin has added their own categories. */
export const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "juices", label: "100% Natural Juices & Smoothies" },
  { id: "oven", label: "Pajir Oven & Cookies" },
  { id: "kitchen", label: "Pajir Kitchen & Breakfast" },
  { id: "soups", label: "Soups & Special Platters" },
] as const;

export const PHOTO_BUCKET = "menu-photos";

export type MenuCategoryRow = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  /** Ready-to-show photo: a link into the photo library, a pasted link, or null. */
  image_url: string | null;
  /** Where the uploaded photo lives in the photo library, or null. */
  image_path: string | null;
  discount_percent: number;
  available: boolean;
  sort_order: number;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  location: string;
  quote: string;
  verified: boolean;
  sort_order: number;
};

export const WHATSAPP_NUMBER = "256774501297";

export const isDirectUrl = (value: string | null | undefined): value is string =>
  !!value && /^https?:\/\//i.test(value);

export const isLibraryPath = (value: string | null | undefined): value is string =>
  !!value && !isDirectUrl(value);

/**
 * The photo library is private, so a stored name is never shown straight to the
 * browser. This is the steady address the browser asks; the server answers with
 * a short-lived link. It is identical on server and browser, so page markup
 * always matches itself.
 */
export const libraryUrl = (path: string) => `/api/public/menu-photo?path=${encodeURIComponent(path)}`;

/** What a stored photo field is worth showing, or null when there is nothing. */
export function displayImage(value: string | null | undefined): string | null {
  if (isDirectUrl(value)) return value;
  if (isLibraryPath(value)) return libraryUrl(value);
  return null;
}

export function fallbackImage(category: string) {
  if (category === "juices") return juiceImg;
  if (category === "oven") return cookiesImg;
  return kitchenImg;
}

export function finalPrice(item: Pick<MenuItem, "price" | "discount_percent">) {
  return Math.round(item.price * (1 - Math.min(Math.max(item.discount_percent, 0), 100) / 100));
}

export const formatUGX = (n: number) => `${n.toLocaleString("en-US")} UGX`;

export type CartLine = { name: string; qty: number; unitPrice: number };

export function buildOrderMessage(lines: CartLine[], location: string) {
  const items = lines.map((l) => `- ${l.qty}x ${l.name} (${(l.qty * l.unitPrice).toLocaleString("en-US")} UGX)`);
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  return [
    "Hello Pajir Cravings Hub! 👋 I would like to place an order:",
    ...items,
    `Total: ${total.toLocaleString("en-US")} UGX`,
    `Delivery Location: ${location.trim() || "Not specified"}`,
    "Is this available for delivery right now?",
  ].join("\n");
}

export const whatsappLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const menuQuery = {
  queryKey: ["menu"],
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      image_path: isLibraryPath(r.image_url) ? r.image_url : null,
      image_url: displayImage(r.image_url),
    }));
  },
};

export const categoriesQuery = {
  queryKey: ["menu-categories"],
  queryFn: async (): Promise<MenuCategoryRow[]> => {
    const { data, error } = await supabase.from("menu_categories").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
};

export const testimonialsQuery = {
  queryKey: ["testimonials"],
  queryFn: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
};

export type SiteAssets = { hero: string | null; banner: string | null };

export const siteAssetsQuery = {
  queryKey: ["site-assets"],
  queryFn: async (): Promise<SiteAssets> => {
    const { data, error } = await supabase.from("site_assets").select("key, url");
    if (error) throw error;
    const rows = data ?? [];
    const pick = (key: string): string | null => displayImage(rows.find((r) => r.key === key)?.url);
    return { hero: pick("hero"), banner: pick("banner") };
  },
};
