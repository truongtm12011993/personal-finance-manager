import { TransactionType } from "@prisma/client";
import { monthKey } from "@/lib/finance";
import { parseMoney, suggestCategory } from "@/app/actions/utils";
import { BudgetInput, TransactionInput } from "./expense-inputs";

export function validateTransactionForm(formData: FormData): TransactionInput {
  const amount = parseMoney(String(formData.get("amount") || "0"));
  const typeRaw = String(formData.get("type") || "EXPENSE");
  const categoryRaw = String(formData.get("category") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const occurredAtRaw = String(formData.get("occurredAt") || "");
  const type = typeRaw === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Số tiền không hợp lệ");
  }

  const shouldAuto = !categoryRaw || categoryRaw.toUpperCase() === "AUTO";
  const category = shouldAuto ? suggestCategory(type, note) : categoryRaw;

  return {
    amount,
    type,
    category: category || "Khác",
    note: note || null,
    occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date()
  };
}

export function validateTransactionUpdateForm(formData: FormData): TransactionInput {
  const id = String(formData.get("id") || "");
  if (!id) {
    throw new Error("Không tìm thấy giao dịch");
  }

  return {
    id,
    ...validateTransactionForm(formData)
  };
}

export function validateBudgetForm(formData: FormData): BudgetInput {
  const month = String(formData.get("month") || monthKey(new Date()));
  const limit = parseMoney(String(formData.get("limit") || "0"));

  if (!Number.isFinite(limit) || limit < 0) {
    throw new Error("Ngân sách không hợp lệ");
  }

  return { month, limit };
}