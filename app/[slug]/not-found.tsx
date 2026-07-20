import Link from "next/link";

export default function MenuNotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Menu not found</h1>
      <p className="max-w-sm text-sm text-zinc-600">
        This restaurant menu does not exist or may have been removed.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Go home
      </Link>
    </main>
  );
}
