import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BUCKET = "menu-photos";

/**
 * Turns a stored photo name into a picture the browser can load. The photo
 * library itself is private, so this hands back a short-lived link instead of
 * the file. The address stays the same on every visit, which keeps the page
 * markup identical between the server and the browser.
 */
export const Route = createFileRoute("/api/public/menu-photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path") ?? "";
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(path) || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Not found", { status: 404 });

        const supabase = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
                headers.delete("Authorization");
              }
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
        });

        const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
        if (error || !data?.signedUrl) return new Response("Not found", { status: 404 });

        return Response.redirect(data.signedUrl, 302);
      },
    },
  },
});
