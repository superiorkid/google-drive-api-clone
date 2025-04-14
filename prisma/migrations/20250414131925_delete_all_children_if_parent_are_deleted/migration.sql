-- DropForeignKey
ALTER TABLE "drive_items" DROP CONSTRAINT "drive_items_parent_id_fkey";

-- AddForeignKey
ALTER TABLE "drive_items" ADD CONSTRAINT "drive_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "drive_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
