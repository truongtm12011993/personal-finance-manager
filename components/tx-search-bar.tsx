"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  categories: string[];
  initialCategory?: string;
};

export function TxSearchBar({ categories, initialCategory = "all" }: Props) {
  const [activecat, setActivecat] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActivecat(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const cat = activecat;
    const isFiltering = q !== "" || cat !== "all";

    document.querySelectorAll<HTMLElement>("[data-expense-row=\"true\"][data-cat]").forEach((row) => {
      const rowCat = (row.dataset.cat ?? "").toLowerCase();
      const rowNote = (row.dataset.note ?? "").toLowerCase();
      const matchSearch = !q || rowCat.includes(q) || rowNote.includes(q);
      const matchCat = cat === "all" || row.dataset.cat === cat;
      row.style.display = matchSearch && matchCat ? "" : "none";
    });

    document.querySelectorAll<HTMLElement>("[data-expense-group=\"true\"]").forEach((group) => {
      const rows = Array.from(group.querySelectorAll<HTMLElement>("[data-expense-row=\"true\"][data-cat]"));
      const visibleRows = rows.filter((row) => row.style.display !== "none");
      group.style.display = visibleRows.length > 0 ? "" : "none";

      const countLabel = group.querySelector(".group-count-label") as HTMLElement | null;
      if (!countLabel) return;

      if (isFiltering) {
        countLabel.textContent = `${visibleRows.length} kết quả`;
        countLabel.classList.add("text-slate-950", "font-bold");
        countLabel.classList.remove("text-slate-400", "text-slate-500");
      } else {
        countLabel.textContent = `${rows.length} giao dịch`;
        countLabel.classList.remove("text-slate-950");
        countLabel.classList.add("text-slate-500", "font-bold");
      }
    });
  }, [searchQuery, activecat]);

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-white"
          placeholder="Tìm theo danh mục, ghi chú..."
          autoComplete="off"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
        <div className="flex w-max min-w-full items-center gap-2 pb-1">
          <button
            type="button"
            className={`h-9 rounded-full px-4 text-sm font-bold transition sm:px-5 ${
              activecat === "all"
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/5 dark:bg-[#111827] dark:text-slate-300"
            }`}
            onClick={() => setActivecat("all")}
          >
            Tất cả
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`h-9 whitespace-nowrap rounded-full px-4 text-sm font-bold transition sm:px-5 ${
                activecat === cat
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/5 dark:bg-[#111827] dark:text-slate-300"
              }`}
              onClick={() => setActivecat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
