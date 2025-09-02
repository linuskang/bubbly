/*
  Warnings:

  - You are about to drop the `BubblerImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BubblerImage` DROP FOREIGN KEY `BubblerImage_bubblerId_fkey`;

-- AlterTable
ALTER TABLE `Bubbler` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- DropTable
DROP TABLE `BubblerImage`;
