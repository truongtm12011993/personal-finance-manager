import { AssetType, InvestmentAction } from "@prisma/client";
import { parseDecimal, parseMoney } from "@/app/actions/utils";
import {
  InvestmentPriceInput,
  InvestmentTransactionInput,
  UpsertInvestmentAssetInput
} from "./investment-inputs";

export function validateInvestmentAssetForm(formData: FormData): UpsertInvestmentAssetInput {
  const symbol = String(formData.get("symbol") || "").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const typeRaw = String(formData.get("type") || "STOCK");
  const currency = String(formData.get("currency") || "VND").trim().toUpperCase() || "VND";
  const currentPriceRaw = String(formData.get("currentPrice") || "").trim();
  const allowedTypes = new Set(Object.values(AssetType));
  const type = allowedTypes.has(typeRaw as AssetType) ? (typeRaw as AssetType) : AssetType.OTHER;
  const currentPrice = currentPriceRaw ? parseMoney(currentPriceRaw) : null;

  if (!symbol || !name) {
    throw new Error("Thông tin tài sản không hợp lệ");
  }

  if (currentPriceRaw && (currentPrice === null || !Number.isFinite(currentPrice) || currentPrice < 0)) {
    throw new Error("Giá hiện tại không hợp lệ");
  }

  return { symbol, name, type, currency, currentPrice };
}

export function validateInvestmentTransactionForm(formData: FormData): InvestmentTransactionInput {
  const assetId = String(formData.get("assetId") || "");
  const actionRaw = String(formData.get("action") || "BUY");
  const quantity = parseDecimal(String(formData.get("quantity") || "0"));
  const price = parseMoney(String(formData.get("price") || "0"));
  const fee = parseMoney(String(formData.get("fee") || "0"));
  const note = String(formData.get("note") || "").trim();
  const occurredAtRaw = String(formData.get("occurredAt") || "");
  const action = actionRaw === "SELL" ? InvestmentAction.SELL : InvestmentAction.BUY;

  if (!assetId) {
    throw new Error("Cần chọn tài sản");
  }

  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0 || !Number.isFinite(fee) || fee < 0) {
    throw new Error("Dữ liệu giao dịch đầu tư không hợp lệ");
  }

  return {
    assetId,
    action,
    quantity,
    price,
    fee,
    note: note || null,
    occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date()
  };
}

export function validateInvestmentTransactionUpdateForm(formData: FormData): InvestmentTransactionInput {
  const id = String(formData.get("id") || "");
  if (!id) {
    throw new Error("Không tìm thấy giao dịch");
  }

  return {
    id,
    ...validateInvestmentTransactionForm(formData)
  };
}

export function validateInvestmentPriceForm(formData: FormData): InvestmentPriceInput {
  const assetId = String(formData.get("assetId") || "");
  const currentPrice = parseMoney(String(formData.get("currentPrice") || "0"));

  if (!assetId) {
    throw new Error("Không tìm thấy tài sản");
  }

  if (!Number.isFinite(currentPrice) || currentPrice < 0) {
    throw new Error("Giá hiện tại không hợp lệ");
  }

  return { assetId, currentPrice };
}
