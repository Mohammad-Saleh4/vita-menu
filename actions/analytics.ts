"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CartItemInput = {
  menuItemId: string;
  quantity: number;
  price: number;
};

function handlePrismaError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export async function logWhatsAppOrder(input: {
  restaurantId: string;
  cartItems: CartItemInput[];
  totalAmount: number;
}): Promise<ActionResult<{ orderId: string }>> {
  try {
    const { restaurantId, cartItems, totalAmount } = input;

    if (!restaurantId) {
      return { success: false, error: "Restaurant is required." };
    }

    if (!cartItems.length) {
      return { success: false, error: "Cart is empty." };
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return { success: false, error: "Invalid order total." };
    }

    for (const item of cartItems) {
      if (!item.menuItemId || item.quantity <= 0 || item.price < 0) {
        return { success: false, error: "Invalid cart item." };
      }
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });

    if (!restaurant) {
      return { success: false, error: "Restaurant not found." };
    }

    const menuItemIds = cartItems.map((item) => item.menuItemId);

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        category: { restaurantId },
      },
      select: { id: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      return {
        success: false,
        error: "One or more items are invalid for this restaurant.",
      };
    }

    const computedTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (Math.abs(computedTotal - totalAmount) > 0.01) {
      return { success: false, error: "Order total mismatch." };
    }

    const order = await prisma.order.create({
      data: {
        restaurantId,
        totalAmount,
        status: "WHATSAPP_SENT",
        items: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtTime: item.price,
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/analytics");

    return { success: true, data: { orderId: order.id } };
  } catch (error) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getRestaurantAnalytics() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: user.id },
    select: { id: true, currency: true },
  });

  if (!restaurant) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    include: {
      items: {
        include: {
          menuItem: {
            select: { nameEn: true, nameAr: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const weekOrders = orders.filter((order) => order.createdAt >= startOfWeek);
  const totalRevenueThisWeek = weekOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const itemCounts = new Map<
    string,
    { nameEn: string; nameAr: string; quantity: number }
  >();

  for (const order of orders) {
    for (const line of order.items) {
      const existing = itemCounts.get(line.menuItemId);
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        itemCounts.set(line.menuItemId, {
          nameEn: line.menuItem.nameEn,
          nameAr: line.menuItem.nameAr,
          quantity: line.quantity,
        });
      }
    }
  }

  let bestSellingItem: {
    nameEn: string;
    nameAr: string;
    quantity: number;
  } | null = null;

  for (const item of itemCounts.values()) {
    if (!bestSellingItem || item.quantity > bestSellingItem.quantity) {
      bestSellingItem = item;
    }
  }

  const dailyRevenue: { day: string; revenue: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const revenue = orders
      .filter(
        (order) => order.createdAt >= date && order.createdAt < nextDay
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    dailyRevenue.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      revenue,
    });
  }

  return {
    currency: restaurant.currency,
    totalRevenueThisWeek,
    bestSellingItem,
    dailyRevenue,
    orderCount: orders.length,
  };
}
