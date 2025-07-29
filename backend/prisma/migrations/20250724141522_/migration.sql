/*
  Warnings:

  - You are about to drop the column `receiverId` on the `Parcel` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Parcel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DRIVER';

-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_receiverId_fkey";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "receiverId",
ADD COLUMN     "recipientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
