import { createAPIFileRoute } from "@tanstack/react-start/api";

const BASE_URL = "https://pajir-cravings-hub.vercel.app";

export const Route = createAPIFileRoute("/sitemap.xml")({
  GET: async () => {
    const routes = ["", "/admin"];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${route === "" ? "1.0" : "0.8"}</priority>
    </url>`;
    })
    .join("")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  },
});