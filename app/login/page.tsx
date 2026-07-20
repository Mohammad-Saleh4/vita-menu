import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
