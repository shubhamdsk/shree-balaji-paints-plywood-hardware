-- A new database is left empty here; seedCatalog fills it with the current categories and products.
INSERT INTO "categories" ("id", "name", "slug", "tagline", "description", "image", "sort_order", "is_active")
SELECT v.* FROM (VALUES
  ('plumbing', 'Plumbing', 'plumbing', 'Pipes, Fittings & Sanitaryware', 'CPVC, PVC and UPVC Pipes and Fittings, Water Tanks, Taps and Bathroom Fittings.', '/images/products/plumbing-pipes.jpg', 11, true),
  ('electrical', 'Electrical', 'electrical', 'Switches, Wiring & Power Tools', 'Modular Switches and Sockets, Wires and Cables, MCBs, LED Lights, Fans and Power Tools.', '/images/products/electrical-switch.jpg', 12, true)
) AS v("id", "name", "slug", "tagline", "description", "image", "sort_order", "is_active")
WHERE EXISTS (SELECT 1 FROM "categories")
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "sort_order", "is_active")
SELECT v."category_id" || '-' || v."slug", v."category_id", v."name", v."slug", v."name" || ' under ' || c."name", v."sort_order", true
FROM (VALUES
  ('plumbing', 'CPVC Pipes & Fittings', 'cpvc-pipes-fittings', 0),
  ('plumbing', 'PVC Pipes & Fittings', 'pvc-pipes-fittings', 1),
  ('plumbing', 'UPVC Pipes & Fittings', 'upvc-pipes-fittings', 2),
  ('plumbing', 'Water Tanks', 'water-tanks', 3),
  ('plumbing', 'Taps & Faucets', 'taps-faucets', 4),
  ('plumbing', 'Bathroom Fittings', 'bathroom-fittings', 5),
  ('electrical', 'Switches & Sockets', 'switches-sockets', 0),
  ('electrical', 'Wires & Cables', 'wires-cables', 1),
  ('electrical', 'MCB & Distribution Boards', 'mcb-distribution-boards', 2),
  ('electrical', 'LED Lights', 'led-lights', 3),
  ('electrical', 'Fans', 'fans', 4),
  ('electrical', 'Power Tools', 'power-tools', 5)
) AS v("category_id", "name", "slug", "sort_order")
JOIN "categories" c ON c."id" = v."category_id"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
UPDATE "products" p SET "category" = m."category", "type" = m."type", "updated_at" = now()
FROM (VALUES
  ('ap-royale-luxury', 'paints', 'Interior Emulsion'),
  ('ap-tractor-emulsion', 'paints', 'Interior Emulsion'),
  ('berger-bison-acrylic', 'paints', 'Interior Emulsion'),
  ('nerolac-excel-total', 'paints', 'Interior Emulsion'),
  ('dulux-supercover', 'paints', 'Interior Emulsion'),
  ('ap-apex-ultima', 'paints', 'Exterior Emulsion'),
  ('ap-ace-exterior', 'paints', 'Exterior Emulsion'),
  ('ap-apcolite-enamel', 'paints', 'Enamel Paint'),
  ('ap-smartcare-damp', 'paints', 'Waterproofing Paint'),
  ('ap-wall-primer', 'paint-preparation', 'Wall Primer'),
  ('ap-trucare-putty', 'paint-preparation', 'Wall Putty'),
  ('ply-bwp-marine', 'plywood-boards', 'BWP / Marine Plywood'),
  ('ply-commercial-mr', 'plywood-boards', 'Commercial Plywood'),
  ('ply-block-board', 'plywood-boards', 'Block Board'),
  ('ply-mdf', 'plywood-boards', 'MDF Board'),
  ('ply-laminate', 'laminates', 'Decorative Laminates'),
  ('hw-door-lock', 'furniture-hardware', 'Mortise Locks'),
  ('hw-padlock', 'furniture-hardware', 'Door Locks'),
  ('hw-ss-hinges', 'furniture-hardware', 'Butt Hinges'),
  ('hw-hettich-handle', 'furniture-hardware', 'Door Handles'),
  ('pl-cpvc-astral', 'plumbing', 'CPVC Pipes & Fittings'),
  ('pl-pvc-finolex', 'plumbing', 'PVC Pipes & Fittings'),
  ('el-modular-switch', 'electrical', 'Switches & Sockets'),
  ('tool-bosch-drill', 'electrical', 'Power Tools'),
  ('tool-paint-kit', 'painting-tools', 'Paint Brushes'),
  ('ad-fevicol-sh', 'adhesives-chemicals', 'Fevicol')
) AS m("id", "category", "type")
WHERE p."id" = m."id"
  AND NOT EXISTS (SELECT 1 FROM "subcategories" s WHERE s."category_id" = p."category" AND s."name" = p."type")
  AND EXISTS (SELECT 1 FROM "subcategories" s WHERE s."category_id" = m."category" AND s."name" = m."type");
--> statement-breakpoint
UPDATE "products" p SET "category" = m."category", "updated_at" = now()
FROM (VALUES
  ('plywood', 'plywood-boards'),
  ('hardware', 'furniture-hardware'),
  ('adhesives', 'adhesives-chemicals'),
  ('tools', 'painting-tools')
) AS m("old", "category")
WHERE p."category" = m."old" AND EXISTS (SELECT 1 FROM "categories" c WHERE c."id" = m."category");
