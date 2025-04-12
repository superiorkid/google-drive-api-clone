/*
  Warnings:

  - You are about to drop the column `userId` on the `auth_tokens` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DriveItemType" AS ENUM ('FILE', 'FOLDER');

-- DropForeignKey
ALTER TABLE "auth_tokens" DROP CONSTRAINT "auth_tokens_userId_fkey";

-- AlterTable
ALTER TABLE "auth_tokens" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "drive_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DriveItemType" NOT NULL,
    "size" INTEGER,
    "mime_type" TEXT,
    "url" TEXT,
    "parent_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_trashed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drive_items_owner_id_parent_id_is_trashed_idx" ON "drive_items"("owner_id", "parent_id", "is_trashed");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_items" ADD CONSTRAINT "drive_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "drive_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_items" ADD CONSTRAINT "drive_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
