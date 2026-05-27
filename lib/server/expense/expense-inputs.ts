import { TransactionType } from "@prisma/client";

export type TransactionInput = {
  id?: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string | null;
  occurredAt: Date;
};

export type BudgetInput = {
  month: string;
  limit: number;
};