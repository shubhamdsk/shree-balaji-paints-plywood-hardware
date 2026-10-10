ALTER TABLE "categories" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subcategory_id" text;--> statement-breakpoint
ALTER TABLE "subcategories" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "subcategories" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_subcategory_id_idx" ON "products" USING btree ("subcategory_id");