export type ExpenseExportFilters = {
  month: string;
  category: string;
};

export type InvestmentExportFilters = {
  month: string;
  assetId: string;
};

export type CsvExportResult = {
  csv: string;
  filename: string;
};
