// Browser-safe review helpers.
export type Review = { id: string; product_slug: string; author_name: string; rating: number; comment: string; images: string[]; created_at: string };
export const reviewImg = (path: string) => `/api/public/review-media/${path}`;

export function ratingSummary(reviews: { rating: number }[]) {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { average: Math.round(avg * 10) / 10, count: reviews.length };
}
