CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_expires_idx" ON "Session"("expires");

CREATE INDEX IF NOT EXISTS "Transaction_userId_type_occurredAt_idx" ON "Transaction"("userId", "type", "occurredAt");
CREATE INDEX IF NOT EXISTS "Transaction_userId_category_occurredAt_idx" ON "Transaction"("userId", "category", "occurredAt");

CREATE INDEX IF NOT EXISTS "InvestmentAsset_userId_type_idx" ON "InvestmentAsset"("userId", "type");

CREATE INDEX IF NOT EXISTS "InvestmentTransaction_userId_occurredAt_idx" ON "InvestmentTransaction"("userId", "occurredAt");
CREATE INDEX IF NOT EXISTS "InvestmentTransaction_userId_assetId_occurredAt_idx" ON "InvestmentTransaction"("userId", "assetId", "occurredAt");
CREATE INDEX IF NOT EXISTS "InvestmentTransaction_assetId_occurredAt_idx" ON "InvestmentTransaction"("assetId", "occurredAt");

CREATE INDEX IF NOT EXISTS "SavingsGoal_userId_createdAt_idx" ON "SavingsGoal"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SavingsGoal_userId_dueDate_idx" ON "SavingsGoal"("userId", "dueDate");

CREATE INDEX IF NOT EXISTS "SavingsEntry_userId_occurredAt_idx" ON "SavingsEntry"("userId", "occurredAt");
CREATE INDEX IF NOT EXISTS "SavingsEntry_goalId_occurredAt_idx" ON "SavingsEntry"("goalId", "occurredAt");
