import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

/** Everything the public site shows: page content, categories, spaces and published products. */
export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    const { getMockSiteData } = await import("@/integrations/supabase/mock");
    return getMockSiteData();
  }
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const [content, categories, spaces, products] = await Promise.all([
    db.from("site_content").select("key, data"),
    db.from("categories").select("id, name, image, sort, world").order("sort"),
    db.from("spaces").select("id, name, sort").order("sort"),
    db.from("products").select("*").eq("published", true).order("sort").order("created_at"),
  ]);
  const err = content.error ?? categories.error ?? spaces.error ?? products.error;
  if (err) console.error("getSiteData failed", err);
  return {
    content: Object.fromEntries((content.data ?? []).map((r) => [r.key, r.data])) as Record<
      string,
      Json
    >,
    categories: categories.data ?? [],
    spaces: spaces.data ?? [],
    products: products.data ?? [],
  };
});
