import { SavingsAction } from "@prisma/client";

export type SavingsGoalRecord = {
  id: string;
  name: string;
  interestRate: number;
  termMonths: number | null;
  openDate: Date | null;
  dueDate: Date | null;
  currentAmount: number;
  createdAt: Date;
};

export type SavingsEntryRecord = {
  id: string;
  goalId: string;
  action: SavingsAction;
  amount: number;
  note: string | null;
  occurredAt: Date;
  goal: {
    id: string;
    name: string;
  } | null;
};

export type SavingsDashboardSummary = {
  totalSaved: number;
  avgSavingsRate: number;
  topSavingsGoal: SavingsGoalRecord | null;
  maturingIn90Amount: number;
};

export type SavingsDashboardData = {
  goals: SavingsGoalRecord[];
  entries: SavingsEntryRecord[];
  summary: SavingsDashboardSummary;
};
