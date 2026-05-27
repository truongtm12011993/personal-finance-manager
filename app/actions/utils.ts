import { redirect } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { guessExpenseCategory, guessIncomeCategory } from "@/lib/finance";

export function parseMoney(input: string) {
  return parseDecimal(input);
}

export function parseDecimal(input: string) {
  const raw = input.trim().replace(/\s+/g, "");
  if (!raw) return Number.NaN;

  const lastDot = raw.lastIndexOf(".");
  const lastComma = raw.lastIndexOf(",");

  // Logic: In VN format, "." is thousands separator and "," is decimal.
  // In EN format, "," is thousands separator and "." is decimal.
  // If both exist, the last one is the decimal separator.
  // If only one exists, we need to guess:
  // - If it's a comma, it's almost certainly a decimal separator in VN context.
  // - If it's a dot, and there are exactly 3 digits after it AND it's not the only separator, 
  //   it might be a thousands separator. 
  // But since our MoneyInput uses "." for thousands and "," for decimals, we should prioritize that.

  let sepIndex = -1;
  if (lastComma > lastDot) {
    sepIndex = lastComma;
  } else if (lastDot > lastComma) {
    // If there's only a dot, check if it looks like a decimal or thousands separator.
    // For "17.050.000", lastDot is at the last dot. 
    // If we have multiple dots, it's definitely thousands separators.
    const dotCount = (raw.match(/\./g) || []).length;
    if (dotCount > 1) {
      sepIndex = -1; // All dots are thousands separators
    } else {
      // Single dot: could be decimal (EN) or thousands (VN).
      // Heuristic: If followed by exactly 3 digits, we treat as thousands (VN style).
      // Otherwise, we treat as decimal (EN style).
      const parts = raw.split('.');
      if (parts[1].length === 3 && parts[0].length > 0) {
        sepIndex = -1;
      } else {
        sepIndex = lastDot;
      }
    }
  }

  let intPart = raw;
  let decPart = "";
  if (sepIndex >= 0) {
    intPart = raw.slice(0, sepIndex);
    decPart = raw.slice(sepIndex + 1);
  }

  const intDigits = intPart.replace(/\D/g, "");
  const decDigits = decPart.replace(/\D/g, "");

  if (!intDigits && !decDigits) return Number.NaN;
  const normalized = decDigits ? `${intDigits || "0"}.${decDigits}` : intDigits;
  return Number(normalized);
}

export function redirectWithToast(formData: FormData, defaultPath: string, toast: string) {
  const returnTo = String(formData.get("returnTo") || defaultPath);
  const separator = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${separator}toast=${encodeURIComponent(toast)}`);
}

export function suggestCategory(type: TransactionType, note: string) {
  if (!note.trim()) return type === TransactionType.INCOME ? "Thu nhập khác" : "Khác";
  return type === TransactionType.INCOME ? guessIncomeCategory(note) : guessExpenseCategory(note);
}
