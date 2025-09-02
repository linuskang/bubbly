-- AlterTable
ALTER TABLE `Bubbler` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `BubblerImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `bubblerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BubblerImage` ADD CONSTRAINT `BubblerImage_bubblerId_fkey` FOREIGN KEY (`bubblerId`) REFERENCES `Bubbler`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
