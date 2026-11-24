/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_categoryId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "categoryId",
DROP COLUMN "color";

-- DropTable
DROP TABLE "Category";
