/*
  Warnings:

  - You are about to drop the column `mode` on the `book` table. All the data in the column will be lost.
  - You are about to alter the column `length` on the `book` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `length` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `mode`,
    ADD COLUMN `mood` JSON NULL,
    MODIFY `length` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `length`,
    DROP COLUMN `mode`,
    ADD COLUMN `book_length` JSON NULL,
    ADD COLUMN `mood` VARCHAR(191) NULL;
