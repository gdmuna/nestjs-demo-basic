/*
  Warnings:

  - The values [AVATAR,DOCUMENT,VIDEO] on the enum `FileDomain` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `key` on the `File` table. All the data in the column will be lost.
  - Added the required column `bucketKey` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bucketType` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BucketType" AS ENUM ('PUBLIC', 'PRIVATE', 'STAGING');

-- AlterEnum
BEGIN;
CREATE TYPE "FileDomain_new" AS ENUM ('USER_PROFILE_IMAGE', 'USER_POST_ATTACHMENT', 'USER_POST_DOCUMENT', 'USER_POST_IMAGE', 'USER_POST_VIDEO', 'USER_COMMENT_IMAGE', 'USER_COMMENT_VIDEO', 'USER_TODO_ATTACHMENT', 'USER_TODO_DOCUMENT', 'USER_TODO_IMAGE', 'USER_TODO_VIDEO');
ALTER TABLE "File" ALTER COLUMN "domain" TYPE "FileDomain_new" USING ("domain"::text::"FileDomain_new");
ALTER TYPE "FileDomain" RENAME TO "FileDomain_old";
ALTER TYPE "FileDomain_new" RENAME TO "FileDomain";
DROP TYPE "public"."FileDomain_old";
COMMIT;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "key",
ADD COLUMN     "bucketKey" TEXT NOT NULL,
ADD COLUMN     "bucketType" "BucketType" NOT NULL;
