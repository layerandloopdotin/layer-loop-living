import { createFileRoute } from "@tanstack/react-router";

// Serves a customer's review photo only once that review is approved.
export const Route = createFileRoute("/api/public/review-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[\w.\-/]{1,300}$/.test(path) || path.includes("..")) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rev } = await supabaseAdmin.from("reviews").select("id").eq("status", "approved").contains("images", [path]).limit(1).maybeSingle();
        if (!rev) return new Response("Not found", { status: 404 });
        const { data, error } = await supabaseAdmin.storage.from("review-media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: {
            "content-type": /^image\/(png|jpeg|webp)$/.test(data.type) ? data.type : "application/octet-stream",
            "cache-control": "public, max-age=3600",
            "content-security-policy": "default-src 'none'; sandbox",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
