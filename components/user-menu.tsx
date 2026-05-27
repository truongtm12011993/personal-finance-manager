import { signOutCurrentUser } from "@/app/actions/auth";

export function UserMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/5 dark:bg-[#111827]">
      <div className="flex min-w-0 items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-9 w-9 rounded-full" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            {(name || email || "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-bold text-slate-950 dark:text-white">{name || "Google user"}</p>
          <p className="m-0 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{email}</p>
        </div>
      </div>
      <form action={signOutCurrentUser}>
        <button
          type="submit"
          className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
