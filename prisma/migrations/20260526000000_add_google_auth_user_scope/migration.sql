-- Auth.js tables for Google login.
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Account" (
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);

CREATE TABLE "Authenticator" (
  "credentialID" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "credentialDeviceType" TEXT NOT NULL,
  "credentialBackedUp" BOOLEAN NOT NULL,
  "transports" TEXT,
  CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID")
);

CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

ALTER TABLE "Account"
  ADD CONSTRAINT "Account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Authenticator"
  ADD CONSTRAINT "Authenticator_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Scope finance data by signed-in user. Columns are nullable so existing local data
-- can remain in place until explicitly assigned to a user.
ALTER TABLE "Transaction" ADD COLUMN "userId" TEXT;
ALTER TABLE "Budget" ADD COLUMN "userId" TEXT;
ALTER TABLE "InvestmentAsset" ADD COLUMN "userId" TEXT;
ALTER TABLE "InvestmentTransaction" ADD COLUMN "userId" TEXT;
ALTER TABLE "SavingsGoal" ADD COLUMN "userId" TEXT;
ALTER TABLE "SavingsEntry" ADD COLUMN "userId" TEXT;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Budget"
  ADD CONSTRAINT "Budget_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvestmentAsset"
  ADD CONSTRAINT "InvestmentAsset_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvestmentTransaction"
  ADD CONSTRAINT "InvestmentTransaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavingsGoal"
  ADD CONSTRAINT "SavingsGoal_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavingsEntry"
  ADD CONSTRAINT "SavingsEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Budget_month_key";
DROP INDEX IF EXISTS "InvestmentAsset_symbol_currency_key";

CREATE INDEX "Transaction_userId_occurredAt_idx" ON "Transaction"("userId", "occurredAt");
CREATE UNIQUE INDEX "Budget_userId_month_key" ON "Budget"("userId", "month");
CREATE UNIQUE INDEX "InvestmentAsset_userId_symbol_currency_key" ON "InvestmentAsset"("userId", "symbol", "currency");
