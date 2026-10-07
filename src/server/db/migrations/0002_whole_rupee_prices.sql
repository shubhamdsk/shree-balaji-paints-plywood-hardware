ALTER TABLE "products" ALTER COLUMN "price_from" SET DATA TYPE integer USING round("price_from")::integer;
