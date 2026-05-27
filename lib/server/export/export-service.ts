import { CsvExportResult, ExpenseExportFilters, InvestmentExportFilters } from "./export-inputs";
import { fetchExpenseExportRows, fetchInvestmentExportRows } from "./export-repository";

function csvEscape(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function buildExpenseCsvExport(filters: ExpenseExportFilters): Promise<CsvExportResult> {
  const rows = await fetchExpenseExportRows(filters);

  const header = ["Date", "Type", "Category", "Amount", "Note"].join(",");
  const lines = rows.map((row) => {
    const date = row.occurredAt.toISOString().slice(0, 10);
    const type = row.type === "INCOME" ? "INCOME" : "EXPENSE";
    const category = row.category ?? "";
    const amount = row.amount.toString();
    const note = row.note ?? "";
    return [date, type, category, amount, note].map(csvEscape).join(",");
  });

  return {
    csv: [header, ...lines].join("\n"),
    filename: filters.month === "all" ? "chi-tieu.csv" : `chi-tieu-${filters.month}.csv`
  };
}

export async function buildInvestmentCsvExport(filters: InvestmentExportFilters): Promise<CsvExportResult> {
  const rows = await fetchInvestmentExportRows(filters);

  const header = ["Date", "Asset", "Action", "Quantity", "Price", "Fee", "Note"].join(",");
  const lines = rows.map((row) => {
    const date = row.occurredAt.toISOString().slice(0, 10);
    const asset = `${row.asset.symbol} - ${row.asset.name}`;
    const action = row.action;
    const quantity = row.quantity.toString();
    const price = row.price.toString();
    const fee = row.fee.toString();
    const note = row.note ?? "";
    return [date, asset, action, quantity, price, fee, note].map(csvEscape).join(",");
  });

  return {
    csv: [header, ...lines].join("\n"),
    filename: filters.month === "all" ? "dau-tu.csv" : `dau-tu-${filters.month}.csv`
  };
}
