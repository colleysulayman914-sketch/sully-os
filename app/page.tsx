import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <main className="px-4 pb-8 pt-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Overview
          </h1>
          <p className="mt-2 text-foreground/70">
            Track your expenses, view transactions, and manage your budget.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
