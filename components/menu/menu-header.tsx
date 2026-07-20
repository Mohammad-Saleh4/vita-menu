"use client";

import { Globe } from "lucide-react";
import type { RestaurantWithMenu } from "@/actions/menu";
import { CartButton } from "@/components/cart/cart-button";

type Locale = "en" | "ar";
type ActiveCategory = "all" | string;

type MenuHeaderProps = {
  restaurant: Pick<RestaurantWithMenu, "name" | "logoUrl" | "description">;
  categories: RestaurantWithMenu["categories"];
  activeCategory: ActiveCategory;
  onSelectCategory: (categoryId: ActiveCategory) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  isArabic: boolean;
  label: (en: string, ar: string) => string;
  currency: string;
};

function categoryPillClassName(isActive: boolean) {
  return `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-800 text-white"
      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
  }`;
}

function LanguageToggle({
  locale,
  onLocaleChange,
  className,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1 text-xs font-medium ${className ?? ""}`}
    >
      <Globe className="mx-1 hidden h-3.5 w-3.5 text-zinc-500 sm:block" />
      <button
        type="button"
        onClick={() => onLocaleChange("en")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "en"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onLocaleChange("ar")}
        className={`rounded-full px-2.5 py-1 transition ${
          locale === "ar"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500"
        }`}
      >
        العربية
      </button>
    </div>
  );
}

export function MenuHeader({
  restaurant,
  categories,
  activeCategory,
  onSelectCategory,
  locale,
  onLocaleChange,
  isArabic,
  label,
  currency,
}: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-lg px-4 py-3 md:grid md:max-w-3xl md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6 md:px-6 md:py-4 lg:max-w-6xl lg:px-8 lg:py-5">
        <div className="flex items-center justify-between gap-3 md:justify-start">
          <div className="flex min-w-0 items-center gap-3">
            {restaurant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logoUrl}
                alt=""
                className="h-8 w-auto shrink-0 object-contain md:h-10"
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-zinc-900 md:text-xl">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="truncate text-xs text-zinc-500 md:hidden">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>

          <LanguageToggle
            locale={locale}
            onLocaleChange={onLocaleChange}
            className="md:hidden"
          />
        </div>

        {categories.length > 0 && (
          <nav
            aria-label={isArabic ? "فئات القائمة" : "Menu categories"}
            className="mt-3 flex gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:mt-0 md:justify-center md:overflow-visible md:pb-0 md:flex-wrap [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={categoryPillClassName(activeCategory === "all")}
            >
              {isArabic ? "الكل" : "All"}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={categoryPillClassName(activeCategory === category.id)}
              >
                {label(category.nameEn, category.nameAr)}
              </button>
            ))}
          </nav>
        )}

        <div className="hidden shrink-0 items-center gap-3 md:col-start-3 md:flex md:justify-self-end">
          <LanguageToggle locale={locale} onLocaleChange={onLocaleChange} />
          <CartButton
            variant="header"
            currency={currency}
            isArabic={isArabic}
          />
        </div>
      </div>
    </header>
  );
}
