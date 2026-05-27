import { NextResponse } from "next/server";
import { buildInvestmentCsvExport } from "@/lib/server/export/export-service";
import { parseInvestmentExportFilters } from "@/lib/server/export/export-validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseInvestmentExportFilters(searchParams);
  const result = await buildInvestmentCsvExport(filters);

  return new NextResponse(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${result.filename}`
    }
  });
}
