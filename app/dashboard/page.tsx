import { getRestaurantMenuForUser } from "@/actions/menu";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const result = await getRestaurantMenuForUser();

  if (!result.success) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-900">Setup required</h1>
        <p className="mt-2 text-sm text-amber-800">{result.error}</p>
        <p className="mt-3 text-sm text-amber-700">
          Create a restaurant profile in the database linked to your Supabase
          user ID to use this dashboard.
        </p>
      </div>
    );
  }

  return <DashboardClient restaurant={result.data} />;
}
