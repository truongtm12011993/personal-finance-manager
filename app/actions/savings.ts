"use server";

import { revalidatePath } from "next/cache";
import {
  addSavingsEntry as addSavingsEntryService,
  addSavingsGoal as addSavingsGoalService,
  deleteSavingsEntry as deleteSavingsEntryService,
  deleteSavingsGoal as deleteSavingsGoalService,
  updateSavingsEntry as updateSavingsEntryService,
  updateSavingsGoal as updateSavingsGoalService
} from "@/lib/server/savings/savings-service";
import {
  validateAddSavingsEntryForm,
  validateAddSavingsGoalForm,
  validateUpdateSavingsEntryForm,
  validateUpdateSavingsGoalForm
} from "@/lib/server/savings/savings-validators";
import { redirectWithToast } from "./utils";

export async function addSavingsGoal(formData: FormData) {
  const result = validateAddSavingsGoalForm(formData);
  if (!result.ok) {
    redirectWithToast(formData, "/?tab=savings", result.toast);
    return;
  }

  await addSavingsGoalService(result.input);
  revalidatePath("/");
}

export async function updateSavingsGoal(formData: FormData) {
  const result = validateUpdateSavingsGoalForm(formData);
  if (!result.ok) {
    if ("toast" in result) {
      redirectWithToast(formData, "/?tab=savings", result.toast);
      return;
    }
    throw new Error(result.error);
  }

  await updateSavingsGoalService(result.input);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=savings", "goal-updated");
}

export async function deleteSavingsGoal(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Không tìm thấy mục tiêu");

  await deleteSavingsGoalService(id);
  revalidatePath("/");
}

export async function addSavingsEntry(formData: FormData) {
  const result = validateAddSavingsEntryForm(formData);
  if (!result.ok) {
    redirectWithToast(formData, "/?tab=savings", result.toast);
    return;
  }

  const outcome = await addSavingsEntryService(result.input);
  if (!outcome.ok) {
    redirectWithToast(formData, "/?tab=savings", outcome.message);
    return;
  }

  revalidatePath("/");
}

export async function updateSavingsEntry(formData: FormData) {
  const result = validateUpdateSavingsEntryForm(formData);
  if (!result.ok) throw new Error(result.error);

  await updateSavingsEntryService(result.input);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=savings", "entry-updated");
}

export async function deleteSavingsEntry(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Không tìm thấy giao dịch tiết kiệm");

  await deleteSavingsEntryService(id);
  revalidatePath("/");
}
