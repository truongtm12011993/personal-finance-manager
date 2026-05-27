import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  SavingsEntryInput,
  SavingsEntryUpdateInput,
  SavingsGoalInput,
  SavingsGoalUpdateInput
} from "./savings-inputs";
import { SavingsEntryRecord, SavingsGoalRecord } from "./savings-types";
import { createDueDate } from "./savings-validators";

export async function fetchSavingsDashboardBase(userId: string): Promise<{
  goals: SavingsGoalRecord[];
  entries: SavingsEntryRecord[];
}> {
  const [goalsRaw, entriesRaw] = await Promise.all([
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.savingsEntry.findMany({ where: { userId }, include: { goal: true }, orderBy: { occurredAt: "desc" }, take: 12 })
  ]);

  return {
    goals: goalsRaw.map((goal) => ({
      id: goal.id,
      name: goal.name,
      interestRate: Number(goal.interestRate ?? 0),
      termMonths: goal.termMonths ?? null,
      openDate: goal.openDate ?? null,
      dueDate: goal.dueDate ?? null,
      currentAmount: Number(goal.currentAmount),
      createdAt: goal.createdAt
    })),
    entries: entriesRaw.map((entry) => ({
      id: entry.id,
      goalId: entry.goalId,
      action: entry.action,
      amount: Number(entry.amount),
      note: entry.note ?? null,
      occurredAt: entry.occurredAt,
      goal: entry.goal ? { id: entry.goal.id, name: entry.goal.name } : null
    }))
  };
}

export async function createSavingsGoal(input: SavingsGoalInput, userId: string): Promise<void> {
  const dueDate = createDueDate(input.openDate, input.termMonths);
  await prisma.savingsGoal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: null,
      interestRate: new Prisma.Decimal(input.interestRate),
      termMonths: input.termMonths ?? null,
      openDate: input.openDate,
      dueDate,
      currentAmount: new Prisma.Decimal(input.initialAmount ?? 0),
      note: null
    }
  });
}

export async function updateSavingsGoalRecord(input: SavingsGoalUpdateInput, userId: string): Promise<void> {
  const dueDate = createDueDate(input.openDate, input.termMonths);
  await prisma.savingsGoal.update({
    where: { id: input.id, userId },
    data: {
      name: input.name,
      interestRate: new Prisma.Decimal(input.interestRate),
      termMonths: input.termMonths ?? null,
      openDate: input.openDate ?? undefined,
      dueDate,
      note: null
    }
  });
}

export async function deleteSavingsGoalRecord(id: string, userId: string): Promise<void> {
  await prisma.savingsGoal.delete({ where: { id, userId } });
}

export async function findSavingsGoalById(id: string, userId: string) {
  return prisma.savingsGoal.findFirst({ where: { id, userId } });
}

export async function findSavingsEntryById(id: string, userId: string) {
  return prisma.savingsEntry.findFirst({ where: { id, userId } });
}

export async function createSavingsEntryAndUpdateGoal(
  input: SavingsEntryInput,
  nextAmount: number,
  userId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.savingsEntry.create({
      data: {
        userId,
        goalId: input.goalId,
        action: input.action,
        amount: new Prisma.Decimal(input.amount),
        note: input.note,
        occurredAt: input.occurredAt
      }
    }),
    prisma.savingsGoal.update({
      where: { id: input.goalId, userId },
      data: { currentAmount: new Prisma.Decimal(nextAmount) }
    })
  ]);
}

export async function updateSavingsEntryAndGoal(
  input: SavingsEntryUpdateInput,
  goalId: string,
  nextAmount: number,
  userId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.savingsEntry.update({
      where: { id: input.id, userId },
      data: {
        action: input.action,
        amount: new Prisma.Decimal(input.amount),
        note: input.note,
        occurredAt: input.occurredAt
      }
    }),
    prisma.savingsGoal.update({
      where: { id: goalId, userId },
      data: { currentAmount: new Prisma.Decimal(nextAmount) }
    })
  ]);
}

export async function deleteSavingsEntryAndGoal(
  id: string,
  goalId: string,
  nextAmount: number,
  userId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.savingsEntry.delete({ where: { id, userId } }),
    prisma.savingsGoal.update({
      where: { id: goalId, userId },
      data: { currentAmount: new Prisma.Decimal(nextAmount) }
    })
  ]);
}
