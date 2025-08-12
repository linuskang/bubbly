/*
  Warnings:

  - Added the required column `addedby` to the `Bubbler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bubbler` ADD COLUMN `addedby` VARCHAR(191) NOT NULL;
