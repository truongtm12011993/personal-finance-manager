import { SavingsAction } from "@prisma/client";

export type SavingsGoalInput = {
  name: string;
  initialAmount: number | null;
  interestRate: number;
  termMonths: number | null;
  openDate: Date;
};

export type SavingsGoalUpdateInput = {
  id: string;
  name: string;
  interestRate: number;
  termMonths: number | null;
  openDate: Date | null;
};

export type SavingsEntryInput = {
  goalId: string;
  action: SavingsAction;
  amount: number;
  note: string | null;
  occurredAt: Date;
};

export type SavingsEntryUpdateInput = {
  id: string;
  action: SavingsAction;
  amount: number;
  note: string | null;
  occurredAt: Date;
};
