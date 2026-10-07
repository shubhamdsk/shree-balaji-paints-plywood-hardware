import { count } from "drizzle-orm";
import { products as demoProducts } from "@/data/products";
import type { Database } from "@/server/db/client";
import { products } from "@/server/db/schema";
import { toProductRow } from "@/server/db/product-mapper";

export async function seedCatalog(db: Database) {
  const [{ total }] = await db.select({ total: count() }).from(products);
  if (total > 0) return false;
  await db.insert(products).values(demoProducts.map((product, index) => ({ ...toProductRow(product), sortOrder: index })));
  return true;
}
