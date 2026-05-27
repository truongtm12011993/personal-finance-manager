import { AppShell } from "@/components/app-shell";

function LoadingCard() {
  return (
    <div className="h-40 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="h-3 w-24 rounded-full bg-slate-100" />
      <div className="mt-6 h-8 w-36 rounded-full bg-slate-100" />
      <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 animate-[shimmer_1.6s_infinite] rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <AppShell activeTab="dashboard">
      <div className="grid gap-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {[0, 1, 2].map((item) => (
            <LoadingCard key={item} />
          ))}
        </section>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-xl bg-slate-50/70 p-4">
                <div className="h-10 w-10 rounded-xl bg-white" />
                <div className="grid flex-1 gap-2">
                  <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                  <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                </div>
                <div className="h-4 w-20 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
