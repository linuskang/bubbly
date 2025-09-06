-- AlterTable
ALTER TABLE `Bubbler` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
