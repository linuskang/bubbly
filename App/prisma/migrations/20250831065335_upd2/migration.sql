-- AlterTable
ALTER TABLE `Bubbler` ADD COLUMN `userId` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Bubbler` ADD CONSTRAINT `Bubbler_addedbyuserid_fkey` FOREIGN KEY (`addedbyuserid`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
