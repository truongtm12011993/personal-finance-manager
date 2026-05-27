import { NextResponse } from "next/server";
import { buildExpenseCsvExport } from "@/lib/server/export/export-service";
import { parseExpenseExportFilters } from "@/lib/server/export/export-validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseExpenseExportFilters(searchParams);
  const result = await buildExpenseCsvExport(filters);

  return new NextResponse(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${result.filename}`
    }
  });
}
