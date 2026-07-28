import Link from "next/link";
import { ArrowLeft, TrendingUp, Trophy } from "lucide-react";
import { getRestaurantAnalytics } from "@/actions/analytics";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default async function AnalyticsPage() {
  const analytics = await getRestaurantAnalytics();

  if (!analytics) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-900">
          Analytics unavailable
        </h1>
        <p className="mt-2 text-sm text-amber-800">
          Sign in and set up your restaurant profile to view analytics.
        </p>
      </div>
    );
  }

  const {
    currency,
    totalRevenueThisWeek,
    bestSellingItem,
    dailyRevenue,
    orderCount,
  } = analytics;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-600">
            WhatsApp orders from the last 30 days.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          {orderCount} orders
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
            <TrendingUp className="size-4 text-emerald-600" />
            Total revenue this week
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            {currency} {totalRevenueThisWeek.toLocaleString()}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Trophy className="size-4 text-emerald-600" />
            Best selling item (30 days)
          </div>
          <p className="mt-3 text-xl font-semibold text-zinc-900">
            {bestSellingItem?.nameEn ?? "No orders yet"}
          </p>
          {bestSellingItem && (
            <p className="mt-1 text-sm text-zinc-500">
              {bestSellingItem.quantity} units sold
            </p>
          )}
        </article>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Daily revenue</h2>
        <p className="mt-1 text-sm text-zinc-500">Last 7 days</p>
        <div className="mt-6">
          <RevenueChart data={dailyRevenue} currency={currency} />
        </div>
      </section>
    </div>
  );
}
