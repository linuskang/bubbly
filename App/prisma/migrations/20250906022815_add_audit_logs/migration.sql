-- AlterTable
ALTER TABLE `Bubbler` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `BubblerAuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bubblerId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `changes` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BubblerAuditLog` ADD CONSTRAINT `BubblerAuditLog_bubblerId_fkey` FOREIGN KEY (`bubblerId`) REFERENCES `Bubbler`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
