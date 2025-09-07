-- AlterTable
ALTER TABLE `Bubbler` ADD COLUMN `maintainer` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
