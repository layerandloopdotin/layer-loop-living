import { createFileRoute } from "@tanstack/react-router";
import { WishlistGrid } from "@/routes/wishlist";

export const Route = createFileRoute("/_authenticated/account/wishlist")({ component: AccountWishlist });

function AccountWishlist() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Wishlist</h2>
      <div className="mt-6"><WishlistGrid /></div>
    </div>
  );
}
