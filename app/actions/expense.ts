"use server";

import { revalidatePath } from "next/cache";
import {
  addTransaction as addTransactionService,
  deleteTransaction as deleteTransactionService,
  normalizeTransactionAmounts as normalizeTransactionAmountsService,
  setBudget as setBudgetService,
  updateTransaction as updateTransactionService
} from "@/lib/server/expense/expense-service";
import {
  validateBudgetForm,
  validateTransactionForm,
  validateTransactionUpdateForm
} from "@/lib/server/expense/expense-validators";
import { redirectWithToast } from "./utils";

export async function normalizeTransactionAmounts() {
  await normalizeTransactionAmountsService();
  revalidatePath("/");
}

export async function addTransaction(formData: FormData) {
  const input = validateTransactionForm(formData);
  await addTransactionService(input);
  revalidatePath("/");
}

export async function updateTransaction(formData: FormData) {
  const input = validateTransactionUpdateForm(formData);
  await updateTransactionService(input);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=expense", "expense-updated");
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Không tìm thấy giao dịch");

  await deleteTransactionService(id);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=expense", "expense-deleted");
}

export async function setBudget(formData: FormData) {
  const input = validateBudgetForm(formData);
  await setBudgetService(input);
  revalidatePath("/");
}