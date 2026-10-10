import { count } from "drizzle-orm";
import { categories as masterCategories } from "@/data/categories";
import { categoryGroups as masterCategoryGroups } from "@/data/category-tree";
import { products as demoProducts } from "@/data/products";
import { slugify } from "@/lib/slug";
import type { Database } from "@/server/db/client";
import { toProductRow } from "@/server/db/product-mapper";
import { categories, gallery, products, subcategories } from "@/server/db/schema";

export async function seedCatalog(db: Database) {
  const [{ total: catCount }] = await db.select({ total: count() }).from(categories);
  if (catCount === 0) {
    await db.insert(categories).values(
      masterCategories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.id,
        tagline: cat.tagline,
        description: cat.description,
        image: cat.image,
        sortOrder: idx,
        isActive: true,
      })),
    );

    const subcatRows: (typeof subcategories.$inferInsert)[] = [];
    masterCategoryGroups.forEach((group) => {
      group.subtypes.forEach((subtype, idx) => {
        subcatRows.push({
          id: `${group.id}-${slugify(subtype)}`,
          categoryId: group.id,
          name: subtype,
          slug: slugify(subtype),
          description: `${subtype} under ${group.name}`,
          image: undefined,
          sortOrder: idx,
          isActive: true,
        });
      });
    });

    if (subcatRows.length > 0) {
      await db.insert(subcategories).values(subcatRows);
    }
  }

  const [{ total: prodCount }] = await db.select({ total: count() }).from(products);
  if (prodCount === 0) {
    await db.insert(products).values(
      demoProducts.map((product, index) => ({
        ...toProductRow(product),
        sortOrder: index,
      })),
    );
  }

  const [{ total: galCount }] = await db.select({ total: count() }).from(gallery);
  if (galCount === 0) {
    await db.insert(gallery).values([
      {
        id: "gal_demo_1",
        title: "Kotul Villa Exterior Paint Project",
        category: "Painting Works",
        caption: "Asian Paints Apex Ultima exterior emulsion application",
        image: "/images/categories/paints.jpg",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "gal_demo_2",
        title: "Custom Plywood & Modular Wardrobes",
        category: "Plywood & Interior",
        caption: "Century BWP Marine Plywood and Action Tesa HDHMR setup",
        image: "/images/categories/plywood.jpg",
        sortOrder: 2,
        isActive: true,
      },
    ]);
  }

  return true;
}
