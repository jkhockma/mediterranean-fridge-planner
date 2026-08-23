import type { Config } from "@netlify/functions";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Creates a real Instacart shopping list page from the app's grocery list using
// the Instacart Developer Platform API. The returned URL opens Instacart with
// every item pre-populated; the user picks their store and checks out.
// Requires Netlify env var INSTACART_API_KEY (from the IDP dashboard).
// Optional: INSTACART_SERVER=dev to use the development server.
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const apiKey = process.env.INSTACART_API_KEY;
  if (!apiKey) {
    // Not configured yet — client falls back to opening instacart.com
    return new Response(JSON.stringify({ configured: false }), { status: 200, headers: CORS });
  }

  let body: { title?: string; items?: string[] };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: CORS });
  }
  const items = (body.items || []).filter(i => typeof i === "string" && i.trim());
  if (items.length === 0) {
    return new Response(JSON.stringify({ error: "No items" }), { status: 400, headers: CORS });
  }

  const server = process.env.INSTACART_SERVER === "dev"
    ? "https://connect.dev.instacart.tools"
    : "https://connect.instacart.com";

  try {
    const res = await fetch(`${server}/idp/v1/products/products_link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: body.title || "HocksMeals Shopping List",
        link_type: "shopping_list",
        line_items: items.map(name => ({ name })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Instacart API error:", res.status, JSON.stringify(data).slice(0, 300));
      return new Response(JSON.stringify({ error: "Instacart rejected the request" }), { status: 502, headers: CORS });
    }
    return new Response(JSON.stringify({ url: data.products_link_url || data.url }), { status: 200, headers: CORS });
  } catch (err) {
    console.error("Instacart call failed:", err);
    return new Response(JSON.stringify({ error: "Instacart unreachable" }), { status: 502, headers: CORS });
  }
};

export const config: Config = { path: "/api/instacart" };
