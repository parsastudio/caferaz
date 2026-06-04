/*
  Warnings:

  - You are about to drop the column `blend` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `grind` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `grind_type` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `weight_grams` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_fkey";

-- DropIndex
DROP INDEX "orders_product_id_idx";

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "blend",
DROP COLUMN "grind",
DROP COLUMN "grind_type",
DROP COLUMN "product_id",
DROP COLUMN "quantity",
DROP COLUMN "weight_grams";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "weight_grams" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "blend" TEXT NOT NULL,
    "grind" TEXT NOT NULL,
    "grind_type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "otp_records_expires_at_idx" ON "otp_records"("expires_at");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
