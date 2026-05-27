import { SavingsAction } from "@prisma/client";
import { parseDecimal, parseMoney } from "@/app/actions/utils";
import {
  SavingsEntryInput,
  SavingsEntryUpdateInput,
  SavingsGoalInput,
  SavingsGoalUpdateInput
} from "./savings-inputs";

const SAVINGS_TERM_MONTHS = new Set([1, 3, 6, 12, 24, 36]);

export function isValidSavingsTerm(termMonths: number | null) {
  if (termMonths === null) return true;
  return Number.isInteger(termMonths) && SAVINGS_TERM_MONTHS.has(termMonths);
}

export function createDueDate(openDate: Date | null, termMonths: number | null) {
  if (!openDate || !termMonths) return null;
  return new Date(openDate.getFullYear(), openDate.getMonth() + termMonths, openDate.getDate());
}

export function parseSavingsAction(value: string): SavingsAction {
  return value === "WITHDRAW" ? SavingsAction.WITHDRAW : SavingsAction.DEPOSIT;
}

export function validateAddSavingsGoalForm(formData: FormData):
  | { ok: true; input: SavingsGoalInput }
  | { ok: false; toast: string } {
  const name = String(formData.get("name") || "").trim();
  const initialAmountRaw = String(formData.get("initialAmount") || "").trim();
  const initialAmount = initialAmountRaw ? parseMoney(initialAmountRaw) : null;
  const interestRate = parseDecimal(String(formData.get("interestRate") || "0"));
  const termMonthsRaw = String(formData.get("termMonths") || "").trim();
  const termMonths = termMonthsRaw ? Number(termMonthsRaw) : null;
  const openDateRaw = String(formData.get("openDate") || "").trim();
  const openDate = openDateRaw ? new Date(openDateRaw) : new Date();

  if (!name) return { ok: false, toast: "goal-invalid-name" };
  if (initialAmount !== null && (!Number.isFinite(initialAmount) || initialAmount <= 0)) {
    return { ok: false, toast: "goal-invalid-amount" };
  }
  if (!isValidSavingsTerm(termMonths)) {
    return { ok: false, toast: "goal-invalid-term" };
  }

  return {
    ok: true,
    input: {
      name,
      initialAmount,
      interestRate,
      termMonths,
      openDate
    }
  };
}

export function validateUpdateSavingsGoalForm(formData: FormData):
  | { ok: true; input: SavingsGoalUpdateInput }
  | { ok: false; toast: string }
  | { ok: false; error: string } {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const interestRate = parseDecimal(String(formData.get("interestRate") || "0"));
  const termMonthsRaw = String(formData.get("termMonths") || "").trim();
  const termMonths = termMonthsRaw ? Number(termMonthsRaw) : null;
  const openDateRaw = String(formData.get("openDate") || "").trim();
  const openDate = openDateRaw ? new Date(openDateRaw) : null;

  if (!id) return { ok: false, error: "Không tìm thấy mục tiêu" };
  if (!name) return { ok: false, toast: "goal-invalid-name" };
  if (!isValidSavingsTerm(termMonths)) return { ok: false, toast: "goal-invalid-term" };

  return {
    ok: true,
    input: {
      id,
      name,
      interestRate,
      termMonths,
      openDate
    }
  };
}

export function validateAddSavingsEntryForm(formData: FormData):
  | { ok: true; input: SavingsEntryInput }
  | { ok: false; toast: string } {
  const goalId = String(formData.get("goalId") || "");
  const actionRaw = String(formData.get("action") || "DEPOSIT");
  const amount = parseMoney(String(formData.get("amount") || "0"));
  const note = String(formData.get("note") || "").trim();
  const occurredAtRaw = String(formData.get("occurredAt") || "").trim();

  if (!goalId) return { ok: false, toast: "Lỗi: Không tìm thấy mục tiêu" };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, toast: "Lỗi: Số tiền không hợp lệ" };

  return {
    ok: true,
    input: {
      goalId,
      action: parseSavingsAction(actionRaw),
      amount,
      note: note || null,
      occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date()
    }
  };
}

export function validateUpdateSavingsEntryForm(formData: FormData):
  | { ok: true; input: SavingsEntryUpdateInput }
  | { ok: false; error: string } {
  const id = String(formData.get("id") || "");
  const actionRaw = String(formData.get("action") || "DEPOSIT");
  const amount = parseMoney(String(formData.get("amount") || "0"));
  const note = String(formData.get("note") || "").trim();
  const occurredAtRaw = String(formData.get("occurredAt") || "").trim();

  if (!id) return { ok: false, error: "Không tìm thấy giao dịch tiết kiệm" };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Số tiền không hợp lệ" };

  return {
    ok: true,
    input: {
      id,
      action: parseSavingsAction(actionRaw),
      amount,
      note: note || null,
      occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date()
    }
  };
}
