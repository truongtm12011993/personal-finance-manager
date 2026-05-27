import { ExpenseExportFilters, InvestmentExportFilters } from "./export-inputs";

export function parseExpenseExportFilters(searchParams: URLSearchParams): ExpenseExportFilters {
  return {
    month: searchParams.get("expenseMonth") ?? "all",
    category: searchParams.get("expenseCategory") ?? "all"
  };
}

export function parseInvestmentExportFilters(searchParams: URLSearchParams): InvestmentExportFilters {
  return {
    month: searchParams.get("investmentMonth") ?? "all",
    assetId: searchParams.get("investmentAssetId") ?? "all"
  };
}
