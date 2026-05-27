"use server";

import { revalidatePath } from "next/cache";
import {
  addInvestmentAsset as addInvestmentAssetService,
  addInvestmentTransaction as addInvestmentTransactionService,
  deleteInvestmentAsset as deleteInvestmentAssetService,
  deleteInvestmentTransaction as deleteInvestmentTransactionService,
  updateInvestmentPrice as updateInvestmentPriceService,
  updateInvestmentTransaction as updateInvestmentTransactionService,
} from "@/lib/server/investment/investment-service";
import {
  validateInvestmentAssetForm,
  validateInvestmentPriceForm,
  validateInvestmentTransactionForm,
  validateInvestmentTransactionUpdateForm,
} from "@/lib/server/investment/investment-validators";
import { redirectWithToast } from "./utils";

export async function addInvestmentAsset(formData: FormData) {
  const input = validateInvestmentAssetForm(formData);
  await addInvestmentAssetService(input);
  revalidatePath("/");
}

export async function deleteInvestmentAsset(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Không tìm thấy tài sản");

  await deleteInvestmentAssetService(id);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=investment", "asset-deleted");
}

export async function addInvestmentTransaction(formData: FormData) {
  const input = validateInvestmentTransactionForm(formData);
  await addInvestmentTransactionService(input);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=investment", "txn-created");
}

export async function updateInvestmentTransaction(formData: FormData) {
  const input = validateInvestmentTransactionUpdateForm(formData);
  await updateInvestmentTransactionService(input);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=investment", "txn-updated");
}

export async function updateInvestmentPrice(formData: FormData) {
  const input = validateInvestmentPriceForm(formData);
  await updateInvestmentPriceService(input);
  revalidatePath("/");
}

export async function deleteInvestmentTransaction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Không tìm thấy giao dịch");

  await deleteInvestmentTransactionService(id);
  revalidatePath("/");
  redirectWithToast(formData, "/?tab=investment", "txn-deleted");
}
