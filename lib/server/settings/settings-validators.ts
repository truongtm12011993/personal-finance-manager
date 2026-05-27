import { ExchangeRateInput } from "./settings-inputs";

export function validateExchangeRateForm(formData: FormData): ExchangeRateInput | null {
  const raw = String(formData.get("usdVnd") ?? "").replace(/\./g, "").trim();
  const usdVnd = Number(raw);

  if (!Number.isFinite(usdVnd) || usdVnd < 1_000) {
    return null;
  }

  return { usdVnd };
}
