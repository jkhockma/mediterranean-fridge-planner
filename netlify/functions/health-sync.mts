import type { Config } from "@netlify/functions";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

// Pushes a user's daily macro totals into the HocksYou (hocks-health) Supabase
// project so the health app can display nutrition alongside its other metrics.
// Requires two env vars set in Netlify:
//   HOCKS_SUPABASE_URL  = https://ylgrclvssqddsovhvrfh.supabase.co
//   HOCKS_SERVICE_KEY   = service role key from the hocks-health project
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const url = process.env.HOCKS_SUPABASE_URL;
  const key = process.env.HOCKS_SERVICE_KEY;
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "HocksYou bridge not configured", configured: false }), { status: 200, headers: CORS });
  }

  let body: { email?: string; date?: string; calories?: number; protein?: number; carbs?: number; fat?: number; meals?: number };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: CORS });
  }
  if (!body.email || !body.date) {
    return new Response(JSON.stringify({ error: "email and date required" }), { status: 400, headers: CORS });
  }

  try {
    const res = await fetch(`${url}/rest/v1/nutrition_daily?on_conflict=email,log_date`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        email: body.email,
        log_date: body.date,
        calories: body.calories || 0,
        protein: body.protein || 0,
        carbs: body.carbs || 0,
        fat: body.fat || 0,
        meals_logged: body.meals || 0,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("HocksYou sync failed:", res.status, text);
      return new Response(JSON.stringify({ error: "Upstream write failed" }), { status: 502, headers: CORS });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
  } catch (err) {
    console.error("HocksYou sync error:", err);
    return new Response(JSON.stringify({ error: "Bridge unreachable" }), { status: 502, headers: CORS });
  }
};

export const config: Config = { path: "/api/health-sync" };
