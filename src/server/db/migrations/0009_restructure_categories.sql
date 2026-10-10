-- The shop doesn't sell plumbing, electrical or power tools.
DELETE FROM "products" WHERE "id" IN ('pl-cpvc-astral', 'pl-pvc-finolex', 'el-modular-switch', 'tool-bosch-drill');
--> statement-breakpoint
DELETE FROM "categories" c
WHERE c."id" IN ('plumbing', 'electrical')
  AND NOT EXISTS (SELECT 1 FROM "products" p WHERE p."category" = c."id");
--> statement-breakpoint
UPDATE "products" p SET "subcategory_id" = s."id"
FROM "subcategories" s
WHERE p."subcategory_id" IS NULL AND s."category_id" = p."category" AND s."name" = p."type";
--> statement-breakpoint
UPDATE "categories" c SET "image" = m."image", "updated_at" = now()
FROM (VALUES
  ('laminates', '/images/categories/laminates.jpg'),
  ('doors-door-material', '/images/categories/doors.jpg'),
  ('screws-fasteners', '/images/categories/fasteners.jpg'),
  ('edge-finishing-material', '/images/categories/edge-finishing.jpg'),
  ('paint-preparation', '/images/categories/paint-preparation.jpg'),
  ('painting-tools', '/images/categories/painting-tools.jpg')
) AS m("id", "image")
WHERE c."id" = m."id" AND (c."image" IS NULL OR c."image" LIKE '/images/%');
