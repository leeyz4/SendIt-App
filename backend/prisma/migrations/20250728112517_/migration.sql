/*
  Warnings:

  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_assignedDriverId_fkey";

-- DropTable
DROP TABLE "Driver";

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
