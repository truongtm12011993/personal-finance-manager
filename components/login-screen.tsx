import { WalletCards } from "lucide-react";
import { signInWithGoogle } from "@/app/actions/auth";

export function LoginScreen() {
  return (
    <main className="app-typo-scope flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 py-10 text-slate-950 dark:bg-[#0a0f1d] dark:text-slate-100">
      <section className="grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#111827] md:grid-cols-[1fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <WalletCards className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="m-0 mt-8 text-sm font-bold text-slate-500">Finance Manager</p>
          <h1 className="m-0 mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Đăng nhập để đồng bộ dữ liệu tài chính
          </h1>
          <p className="m-0 mt-4 max-w-xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Dữ liệu thu chi, đầu tư và tiết kiệm sẽ được lưu theo tài khoản Google của bạn trên PostgreSQL online.
          </p>

          <form action={signInWithGoogle} className="mt-8">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Đăng nhập bằng Google
            </button>
          </form>
        </div>

        <div className="flex min-h-[280px] flex-col justify-between bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
          <div>
            <p className="m-0 text-sm font-bold text-white/55">Online database</p>
            <div className="mt-5 grid gap-3">
              {["Google Login", "Neon/Supabase PostgreSQL", "Dữ liệu tách theo từng tài khoản"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="m-0 mt-8 text-sm font-medium leading-6 text-white/55">
            Bạn cần cấu hình biến môi trường Google OAuth và DATABASE_URL trước khi đăng nhập.
          </p>
        </div>
      </section>
    </main>
  );
}
