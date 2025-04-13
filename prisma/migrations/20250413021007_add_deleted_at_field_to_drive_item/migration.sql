/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `drive_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_trashed` on the `drive_items` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "drive_items_owner_id_parent_id_is_trashed_idx";

-- AlterTable
ALTER TABLE "drive_items" DROP COLUMN "deletedAt",
DROP COLUMN "is_trashed",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "drive_items_owner_id_parent_id_deleted_at_idx" ON "drive_items"("owner_id", "parent_id", "deleted_at");
