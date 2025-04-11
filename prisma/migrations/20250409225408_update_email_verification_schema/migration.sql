/*
  Warnings:

  - Added the required column `updated_at` to the `email_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "email_verifications_used_expires_at_idx";

-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "email_verifications_used_expires_at_created_at_idx" ON "email_verifications"("used", "expires_at", "created_at");
