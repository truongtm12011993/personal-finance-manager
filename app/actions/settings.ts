"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/server/auth";
import { setExchangeRate as setExchangeRateService } from "@/lib/server/settings/settings-service";
import { validateExchangeRateForm } from "@/lib/server/settings/settings-validators";

export async function updateUsdVndRate(formData: FormData) {
  await requireUserId();
  const input = validateExchangeRateForm(formData);
  if (!input) return;

  await setExchangeRateService(input);
  revalidatePath("/");
}
