import { ExchangeRateInput } from "./settings-inputs";
import { upsertExchangeRateSetting } from "./settings-repository";

export async function setExchangeRate(input: ExchangeRateInput): Promise<void> {
  await upsertExchangeRateSetting(input);
}
