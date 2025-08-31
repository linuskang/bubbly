/*
  Warnings:

  - Made the column `name` on table `Bubbler` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Bubbler` ADD COLUMN `addedbyuserid` VARCHAR(191) NULL,
    ADD COLUMN `dogfriendly` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasbottlefiller` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isaccessible` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `addedby` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
