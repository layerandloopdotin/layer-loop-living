// Image references stored in the CMS:
//   "asset:terra.jpg"   → a photo bundled with the site (src/assets)
//   "media:<path>"      → a photo uploaded through the admin (served by /api/public/media)
//   "https://…" or "/…" → used as-is
const assets = import.meta.glob("/src/assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(assets)) byName[path.split("/").pop()!] = url;

export function img(ref: string | null | undefined): string {
  if (!ref) return "";
  if (ref.startsWith("asset:")) return byName[ref.slice(6)] ?? "";
  if (ref.startsWith("media:")) return `/api/public/media/${ref.slice(6)}`;
  return ref;
}

export const MEDIA_BUCKET = "cms-media";
