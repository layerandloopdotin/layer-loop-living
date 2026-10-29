import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteData } from "@/lib/site-data.functions";
import { mergeContent, type ContentKey } from "@/lib/cms-schema";
import { toProduct, type Category, type ProductRow } from "@/lib/catalog";
import { img } from "@/lib/media";

export const siteQuery = queryOptions({
  queryKey: ["site"],
  queryFn: () => getSiteData(),
  staleTime: 60_000,
});

export function useSite() {
  const { data } = useSuspenseQuery(siteQuery);
  const categories = data.categories as Category[];
  const products = (data.products as ProductRow[]).map((r) => toProduct(r, categories, data.spaces));
  return {
    products,
    categories: categories.map((c) => ({ ...c, image: img(c.image) })),
    spaces: data.spaces,
    bySlug: (slug: string) => products.find((p) => p.slug === slug),
    content: <K extends ContentKey>(key: K) => mergeContent(key, data.content[key]),
  };
}

export const useContent = <K extends ContentKey>(key: K) => useSite().content(key);

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const waHref = (digits: string, text?: string) =>
  `https://wa.me/${digits.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
