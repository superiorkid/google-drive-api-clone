-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('READ', 'WRITE');

-- CreateTable
CREATE TABLE "drive_item_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "drive_item_id" TEXT NOT NULL,
    "permission" "PermissionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_item_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drive_item_permissions_user_id_drive_item_id_key" ON "drive_item_permissions"("user_id", "drive_item_id");

-- AddForeignKey
ALTER TABLE "drive_item_permissions" ADD CONSTRAINT "drive_item_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_item_permissions" ADD CONSTRAINT "drive_item_permissions_drive_item_id_fkey" FOREIGN KEY ("drive_item_id") REFERENCES "drive_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
