-- DropForeignKey
ALTER TABLE `BubblerAuditLog` DROP FOREIGN KEY `BubblerAuditLog_bubblerId_fkey`;

-- DropForeignKey
ALTER TABLE `Favorite` DROP FOREIGN KEY `Favorite_bubblerId_fkey`;

-- DropIndex
DROP INDEX `BubblerAuditLog_bubblerId_fkey` ON `BubblerAuditLog`;

-- DropIndex
DROP INDEX `Favorite_bubblerId_fkey` ON `Favorite`;

-- AlterTable
ALTER TABLE `Bubbler` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `BubblerAuditLog` ADD CONSTRAINT `BubblerAuditLog_bubblerId_fkey` FOREIGN KEY (`bubblerId`) REFERENCES `Bubbler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_bubblerId_fkey` FOREIGN KEY (`bubblerId`) REFERENCES `Bubbler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
