import { SavingsAction } from "@prisma/client";
import { diffDays } from "@/lib/finance";
import { requireUserId } from "@/lib/server/auth";
import {
  createSavingsEntryAndUpdateGoal,
  createSavingsGoal,
  deleteSavingsEntryAndGoal,
  deleteSavingsGoalRecord,
  fetchSavingsDashboardBase,
  findSavingsEntryById,
  findSavingsGoalById,
  updateSavingsEntryAndGoal,
  updateSavingsGoalRecord
} from "./savings-repository";
import { SavingsEntryInput, SavingsEntryUpdateInput, SavingsGoalInput, SavingsGoalUpdateInput } from "./savings-inputs";
import { SavingsDashboardData } from "./savings-types";

export async function getSavingsDashboardForUser(userId: string): Promise<SavingsDashboardData> {
  const base = await fetchSavingsDashboardBase(userId);
  const now = new Date();

  const totalSaved = base.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const weightedRateSum = base.goals.reduce((sum, goal) => sum + goal.currentAmount * (goal.interestRate ?? 0), 0);
  const avgSavingsRate = totalSaved > 0 ? weightedRateSum / totalSaved : 0;
  const topSavingsGoal = [...base.goals].sort((a, b) => b.currentAmount - a.currentAmount)[0] ?? null;

  const maturingIn90Amount = base.goals.reduce((sum, goal) => {
    const startDate = goal.openDate ? new Date(goal.openDate) : goal.createdAt ? new Date(goal.createdAt) : null;
    const termMonths = goal.termMonths ?? null;
    const computedEndDate = startDate && termMonths
      ? new Date(startDate.getFullYear(), startDate.getMonth() + termMonths, startDate.getDate())
      : null;
    const endDate = goal.dueDate ? new Date(goal.dueDate) : computedEndDate;
    if (!endDate) return sum;
    const days = diffDays(now, endDate);
    if (days < 0 || days > 90) return sum;
    return sum + goal.currentAmount;
  }, 0);

  return {
    goals: base.goals,
    entries: base.entries,
    summary: {
      totalSaved,
      avgSavingsRate,
      topSavingsGoal,
      maturingIn90Amount
    }
  };
}

export async function getSavingsDashboard(): Promise<SavingsDashboardData> {
  const userId = await requireUserId();
  return getSavingsDashboardForUser(userId);
}

export async function addSavingsGoal(input: SavingsGoalInput): Promise<void> {
  const userId = await requireUserId();
  await createSavingsGoal(input, userId);
}

export async function updateSavingsGoal(input: SavingsGoalUpdateInput): Promise<void> {
  const userId = await requireUserId();
  await updateSavingsGoalRecord(input, userId);
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteSavingsGoalRecord(id, userId);
}

export async function addSavingsEntry(input: SavingsEntryInput): Promise<{ ok: true } | { ok: false; message: string }> {
  const userId = await requireUserId();
  const goal = await findSavingsGoalById(input.goalId, userId);
  if (!goal) {
    return { ok: false, message: "Lỗi: Không tìm thấy mục tiêu" };
  }

  const delta = input.action === SavingsAction.DEPOSIT ? input.amount : -input.amount;

  if (input.action === SavingsAction.DEPOSIT) {
    const startDate = goal.openDate ? new Date(goal.openDate) : goal.createdAt ? new Date(goal.createdAt) : null;
    const computedEndDate = startDate && goal.termMonths
      ? new Date(startDate.getFullYear(), startDate.getMonth() + goal.termMonths, startDate.getDate())
      : null;
    const endDate = goal.dueDate ? new Date(goal.dueDate) : computedEndDate;
    if (endDate && diffDays(new Date(), endDate) <= 0) {
      return { ok: false, message: "Lỗi: Mục tiêu đã hoàn thành, bị khóa và không thể nạp thêm." };
    }
  }

  const nextAmount = Number(goal.currentAmount) + delta;
  if (nextAmount < 0) {
    return { ok: false, message: "Lỗi: Số dư không đủ để rút" };
  }

  await createSavingsEntryAndUpdateGoal(input, nextAmount, userId);
  return { ok: true };
}

export async function updateSavingsEntry(input: SavingsEntryUpdateInput): Promise<void> {
  const userId = await requireUserId();
  const entry = await findSavingsEntryById(input.id, userId);
  if (!entry) throw new Error("Không tìm thấy giao dịch tiết kiệm");

  const goal = await findSavingsGoalById(entry.goalId, userId);
  if (!goal) throw new Error("Không tìm thấy mục tiêu");

  const previousDelta = entry.action === SavingsAction.DEPOSIT ? -Number(entry.amount) : Number(entry.amount);
  const nextDelta = input.action === SavingsAction.DEPOSIT ? input.amount : -input.amount;
  const nextAmount = Number(goal.currentAmount) + previousDelta + nextDelta;
  if (nextAmount < 0) throw new Error("Insufficient savings balance");

  await updateSavingsEntryAndGoal(input, entry.goalId, nextAmount, userId);
}

export async function deleteSavingsEntry(id: string): Promise<void> {
  const userId = await requireUserId();
  const entry = await findSavingsEntryById(id, userId);
  if (!entry) throw new Error("Không tìm thấy giao dịch tiết kiệm");

  const goal = await findSavingsGoalById(entry.goalId, userId);
  if (!goal) throw new Error("Không tìm thấy mục tiêu");

  const delta = entry.action === SavingsAction.DEPOSIT ? -Number(entry.amount) : Number(entry.amount);
  const nextAmount = Number(goal.currentAmount) + delta;
  if (nextAmount < 0) throw new Error("Insufficient savings balance");

  await deleteSavingsEntryAndGoal(id, entry.goalId, nextAmount, userId);
}
