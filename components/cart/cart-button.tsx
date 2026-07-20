"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

type CartButtonProps = {
  currency: string;
  isArabic?: boolean;
  variant?: "floating" | "header";
};

export function CartButton({
  currency,
  isArabic,
  variant = "floating",
}: CartButtonProps) {
  const count = useCartStore((s) =>
    s.items.reduce((sum, line) => sum + line.quantity, 0)
  );
  const total = useCartStore((s) =>
    s.items.reduce((sum, line) => sum + line.price * line.quantity, 0)
  );
  const openCart = useCartStore((s) => s.openCart);

  if (count === 0) return null;

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={openCart}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>
          {count} {isArabic ? "عنصر" : count === 1 ? "item" : "items"}
        </span>
        <span className="font-semibold">
          {total.toLocaleString()} {currency}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <button
        type="button"
        onClick={openCart}
        className="mx-auto flex w-full max-w-lg items-center justify-between rounded-2xl bg-emerald-600 px-4 py-3.5 text-white shadow-lg transition hover:bg-emerald-700"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShoppingBag className="h-5 w-5" />
          <span>
            {count} {isArabic ? "عنصر" : count === 1 ? "item" : "items"}
          </span>
        </div>
        <span className="text-sm font-semibold">
          {total.toLocaleString()} {currency}
        </span>
      </button>
    </div>
  );
}
