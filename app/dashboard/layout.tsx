import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Store } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-900">
              <Store className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Restaurant Dashboard</span>
            </div>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 transition hover:text-zinc-900"
              >
                Menu
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-zinc-900"
              >
                <BarChart3 className="size-4" />
                Analytics
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span className="text-zinc-700">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
