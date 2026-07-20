"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type { Category, MenuItem, Restaurant } from "@/generated/prisma/client";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

type PublicMenu = Restaurant & {
  categories: (Category & { items: MenuItem[] })[];
};

export type RestaurantWithMenu = Restaurant & {
  categories: (Category & { items: MenuItem[] })[];
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

async function getOwnedRestaurant(restaurantId: string, userId: string) {
  return prisma.restaurant.findFirst({
    where: { id: restaurantId, userId },
  });
}

async function getOwnedCategory(categoryId: string, userId: string) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurant: { userId },
    },
    include: { restaurant: true },
  });
}

async function getOwnedMenuItem(itemId: string, userId: string) {
  return prisma.menuItem.findFirst({
    where: {
      id: itemId,
      category: { restaurant: { userId } },
    },
    include: { category: { include: { restaurant: true } } },
  });
}

function revalidateMenuPaths(slug?: string) {
  revalidatePath("/dashboard");
  if (slug) revalidatePath(`/${slug}`);
}

function handlePrismaError(error: unknown): string {
  if (error instanceof Error) {
    if ("code" in error) {
      const code = (error as { code?: string }).code;
      if (code === "P2025") return "Record not found.";
      if (code === "P2002") return "A record with that value already exists.";
    }
    return error.message;
  }
  return "Something went wrong.";
}

export async function getRestaurantForUser(): Promise<
  ActionResult<Restaurant>
> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return { success: false, error: "Restaurant profile not found." };
    }

    return { success: true, data: restaurant };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getRestaurantMenuForUser(): Promise<
  ActionResult<RestaurantWithMenu>
> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return { success: false, error: "Restaurant profile not found." };
    }

    return { success: true, data: restaurant };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateRestaurantWhatsApp(
  whatsappNumber: string
): Promise<ActionResult<Restaurant>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const trimmed = whatsappNumber.trim();
    if (!trimmed) {
      return { success: false, error: "WhatsApp number is required." };
    }

    const existing = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!existing) {
      return { success: false, error: "Restaurant profile not found." };
    }

    const restaurant = await prisma.restaurant.update({
      where: { userId },
      data: { whatsappNumber: trimmed },
    });

    revalidateMenuPaths(restaurant.slug);
    return { success: true, data: restaurant };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function createCategory(input: {
  restaurantId: string;
  nameEn: string;
  nameAr: string;
  sortOrder?: number;
}): Promise<ActionResult<Category>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const restaurant = await getOwnedRestaurant(input.restaurantId, userId);
    if (!restaurant) {
      return { success: false, error: "Restaurant not found or access denied." };
    }

    const category = await prisma.category.create({
      data: {
        restaurantId: input.restaurantId,
        nameEn: input.nameEn.trim(),
        nameAr: input.nameAr.trim(),
        sortOrder: input.sortOrder ?? 0,
      },
    });

    revalidateMenuPaths(restaurant.slug);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateCategory(input: {
  categoryId: string;
  nameEn?: string;
  nameAr?: string;
  sortOrder?: number;
}): Promise<ActionResult<Category>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const existing = await getOwnedCategory(input.categoryId, userId);
    if (!existing) {
      return { success: false, error: "Category not found or access denied." };
    }

    const category = await prisma.category.update({
      where: { id: input.categoryId },
      data: {
        ...(input.nameEn !== undefined && { nameEn: input.nameEn.trim() }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr.trim() }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });

    revalidateMenuPaths(existing.restaurant.slug);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const existing = await getOwnedCategory(categoryId, userId);
    if (!existing) {
      return { success: false, error: "Category not found or access denied." };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    revalidateMenuPaths(existing.restaurant.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function createMenuItem(input: {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}): Promise<ActionResult<MenuItem>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const category = await getOwnedCategory(input.categoryId, userId);
    if (!category) {
      return { success: false, error: "Category not found or access denied." };
    }

    const item = await prisma.menuItem.create({
      data: {
        categoryId: input.categoryId,
        nameEn: input.nameEn.trim(),
        nameAr: input.nameAr.trim(),
        description: input.description?.trim(),
        price: input.price,
        imageUrl: input.imageUrl,
        isAvailable: input.isAvailable ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    revalidateMenuPaths(category.restaurant.slug);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateMenuItem(input: {
  itemId: string;
  nameEn?: string;
  nameAr?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  sortOrder?: number;
  categoryId?: string;
}): Promise<ActionResult<MenuItem>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const existing = await getOwnedMenuItem(input.itemId, userId);
    if (!existing) {
      return { success: false, error: "Menu item not found or access denied." };
    }

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const targetCategory = await getOwnedCategory(input.categoryId, userId);
      if (!targetCategory) {
        return {
          success: false,
          error: "Target category not found or access denied.",
        };
      }
    }

    const item = await prisma.menuItem.update({
      where: { id: input.itemId },
      data: {
        ...(input.nameEn !== undefined && { nameEn: input.nameEn.trim() }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() ?? null,
        }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.isAvailable !== undefined && {
          isAvailable: input.isAvailable,
        }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
    });

    revalidateMenuPaths(existing.category.restaurant.slug);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const existing = await getOwnedMenuItem(itemId, userId);
    if (!existing) {
      return { success: false, error: "Menu item not found or access denied." };
    }

    await prisma.menuItem.delete({ where: { id: itemId } });

    revalidateMenuPaths(existing.category.restaurant.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getPublicMenuBySlug(
  slug: string
): Promise<ActionResult<PublicMenu>> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return { success: false, error: "Menu not found." };
    }

    return { success: true, data: restaurant };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}
