import { connection } from "next/server";
import AppShell from "@/components/AppShell";
import { getSavingsSummary } from "@/lib/savings";
import SavingsPageClient from "./SavingsPageClient";

export const metadata = {
  title: "Savings",
};

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  await connection();
  const summary = await getSavingsSummary();

  return (
    <AppShell>
      <main className="px-4 pb-8 pt-4 sm:px-6 overflow-x-hidden">
        <div className="mx-auto max-w-4xl min-w-0">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Savings
          </h1>
          <p className="mt-2 text-foreground/70">
            Track savings by category. Add deposits and set optional goals.
          </p>
          <SavingsPageClient initialSummary={summary} />
        </div>
      </main>
    </AppShell>
  );
}
