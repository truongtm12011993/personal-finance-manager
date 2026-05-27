"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 ease-out hover:bg-slate-50 hover:text-slate-900 dark:border-white/5 dark:bg-[#151C2C] dark:text-slate-400 dark:hover:bg-[#1f293d] dark:hover:text-slate-100 active:scale-95"
      aria-label="Chuyển đổi giao diện"
      title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-12" strokeWidth={2} />
      ) : (
        <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" strokeWidth={2} />
      )}
    </button>
  );
}
