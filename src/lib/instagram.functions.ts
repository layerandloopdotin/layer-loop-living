import { createServerFn } from "@tanstack/react-start";

export type InstaPost = { id: string; image: string; link: string; caption: string };
let cache: { at: number; posts: InstaPost[] } | null = null;

/** Latest posts from the connected Instagram professional account; empty until a token is added. */
export const getInstagramPosts = createServerFn({ method: "GET" }).handler(async (): Promise<InstaPost[]> => {
  const token = process.env["INSTAGRAM_ACCESS_TOKEN"];
  if (!token) return [];
  if (cache && Date.now() - cache.at < 30 * 60_000) return cache.posts;
  try {
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=12&access_token=${encodeURIComponent(token)}`;
    const r = await fetch(url);
    if (!r.ok) { console.error("Instagram fetch failed", r.status); return cache?.posts ?? []; }
    const j = (await r.json()) as { data?: { id: string; media_type: string; media_url?: string; thumbnail_url?: string; permalink: string; caption?: string }[] };
    const posts = (j.data ?? []).flatMap((m) => {
      const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
      return image ? [{ id: m.id, image, link: m.permalink, caption: (m.caption ?? "").slice(0, 120) }] : [];
    });
    cache = { at: Date.now(), posts };
    return posts;
  } catch (e) {
    console.error("Instagram fetch error", e);
    return cache?.posts ?? [];
  }
});
