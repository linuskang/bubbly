/*
  Warnings:

  - Made the column `addedbyuserid` on table `Bubbler` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Bubbler` ALTER COLUMN `updatedAt` DROP DEFAULT,
    MODIFY `addedbyuserid` VARCHAR(191) NOT NULL;
