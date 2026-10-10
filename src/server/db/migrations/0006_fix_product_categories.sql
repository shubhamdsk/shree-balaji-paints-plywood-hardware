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
