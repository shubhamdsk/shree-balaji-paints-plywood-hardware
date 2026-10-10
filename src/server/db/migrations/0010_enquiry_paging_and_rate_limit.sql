ALTER TABLE "enquiries" ADD COLUMN "client_hash" text;--> statement-breakpoint
CREATE INDEX "enquiries_status_created_at_idx" ON "enquiries" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enquiries_client_hash_created_at_idx" ON "enquiries" USING btree ("client_hash","created_at");