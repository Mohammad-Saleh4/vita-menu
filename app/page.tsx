import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Languages,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fafaf9] text-zinc-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <Store className="size-5" />
          </span>
          <span>Vitamin Menu</span>
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Sign in
        </Link>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:px-10 lg:pb-36">
          <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
            <div className="max-w-2xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                <Sparkles className="size-4" />
                Menus made for the modern table
              </p>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-950 sm:text-5xl lg:text-6xl">
                Your menu, beautifully digital.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 sm:text-xl">
                Create a polished menu your guests can scan, browse, and order
                from WhatsApp in seconds.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-zinc-900/15 transition hover:bg-zinc-700"
                >
                  Open your dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Restaurant sign in
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-600">
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" /> QR-ready menus
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" /> Arabic &amp; English
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-emerald-100/70 blur-2xl" />
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-2xl shadow-zinc-900/10">
                <div className="overflow-hidden rounded-[1.45rem] bg-zinc-950 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500">
                        <Store className="size-4" />
                      </span>
                      Cedar Kitchen
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">EN / AR</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm text-zinc-400">Today&apos;s favourites</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">Made with care.</h2>
                  </div>
                  <div className="mt-6 space-y-3">
                    {[
                      ["Roasted halloumi", "$8.50", "Warm, bright, and delicious."],
                      ["Chicken shawarma", "$9.00", "Garlic sauce, pickles, fresh bread."],
                    ].map(([name, price, description]) => (
                      <div key={name} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-zinc-900">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <ShoppingBag className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{name}</p>
                          <p className="truncate text-xs text-zinc-500">{description}</p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">{price}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-emerald-950"
                  >
                    Add to order
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 pr-5 shadow-lg sm:flex">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <QrCode className="size-5" />
                </span>
                <span className="text-sm font-medium">Scan. Browse. Order.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-3 sm:px-8 lg:px-10">
            <Feature
              icon={<QrCode className="size-5" />}
              title="A menu worth scanning"
              description="Share one elegant, mobile-first link with every QR code."
            />
            <Feature
              icon={<Languages className="size-5" />}
              title="Bilingual by design"
              description="Present every dish in English and Arabic with a single tap."
            />
            <Feature
              icon={<CircleCheck className="size-5" />}
              title="Simple to manage"
              description="Add categories, dishes, photos, and prices from your dashboard."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="rounded-[2rem] bg-emerald-700 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <p className="text-sm font-medium text-emerald-100">Ready when your guests are</p>
            <h2 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Give your restaurant a menu guests love to use.
            </h2>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Go to dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-5 py-6 text-center text-sm text-zinc-500 sm:px-8">
        Vitamin Menu — digital menus for modern restaurants.
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <div>
        <h2 className="font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
    </article>
  );
}
