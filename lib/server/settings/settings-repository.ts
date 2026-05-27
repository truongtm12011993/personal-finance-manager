import { prisma } from "@/lib/prisma";
import { ExchangeRateInput } from "./settings-inputs";

export async function upsertExchangeRateSetting(input: ExchangeRateInput): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: "usdVnd" },
    update: { value: String(input.usdVnd) },
    create: { key: "usdVnd", value: String(input.usdVnd) }
  });
}
