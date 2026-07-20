"use client";

import { useEffect, useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import type { RestaurantWithMenu } from "@/actions/menu";
import { CartButton } from "@/components/cart/cart-button";
import { CartPanel } from "@/components/cart/cart-panel";
import { MenuHeader } from "@/components/menu/menu-header";
import { useCartStore } from "@/store/cart";

type Locale = "en" | "ar";
type ActiveCategory = "all" | string;

export function MenuClient({
  restaurant,
}: {
  restaurant: RestaurantWithMenu;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");

  const setRestaurant = useCartStore((s) => s.setRestaurant);
  const addItem = useCartStore((s) => s.addItem);

  const isArabic = locale === "ar";
  const categories = restaurant.categories.filter(
    (category) => category.items.length > 0
  );
  const visibleCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((category) => category.id === activeCategory);

  useEffect(() => {
    setRestaurant({
      slug: restaurant.slug,
      whatsappNumber: restaurant.whatsappNumber,
      currency: restaurant.currency,
    });
  }, [
    restaurant.slug,
    restaurant.whatsappNumber,
    restaurant.currency,
    setRestaurant,
  ]);

  function label(en: string, ar: string) {
    return isArabic ? ar : en;
  }

  function selectCategory(categoryId: ActiveCategory) {
    setActiveCategory(categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen flex-1 bg-zinc-50 pb-28 md:pb-8"
    >
      <MenuHeader
        restaurant={restaurant}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={selectCategory}
        locale={locale}
        onLocaleChange={setLocale}
        isArabic={isArabic}
        label={label}
        currency={restaurant.currency}
      />

      <main className="mx-auto w-full max-w-lg space-y-8 px-4 py-6 md:max-w-3xl md:space-y-10 md:px-6 lg:max-w-6xl lg:space-y-12 lg:px-8">
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            {isArabic
              ? "القائمة غير متوفرة حالياً."
              : "Menu is not available yet."}
          </p>
        ) : (
          visibleCategories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-base font-semibold text-zinc-900 md:mb-4 lg:mb-5">
                {label(category.nameEn, category.nameAr)}
              </h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:flex-row md:flex-col md:p-4"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={label(item.nameEn, item.nameAr)}
                        className="h-20 w-20 shrink-0 rounded-xl bg-zinc-100 object-cover sm:h-20 sm:w-20 md:h-36 md:w-full"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 md:h-36 md:w-full">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900">
                          {label(item.nameEn, item.nameAr)}
                        </h3>
                        {item.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-emerald-700">
                          {item.price} {restaurant.currency}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              id: item.id,
                              nameEn: item.nameEn,
                              nameAr: item.nameAr,
                              price: item.price,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {isArabic ? "أضف" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <CartButton currency={restaurant.currency} isArabic={isArabic} />

      <CartPanel
        restaurantName={restaurant.name}
        currency={restaurant.currency}
        isArabic={isArabic}
      />
    </div>
  );
}
