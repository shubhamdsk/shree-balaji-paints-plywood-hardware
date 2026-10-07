import type { ProductRow } from "@/server/db/schema";
import type { AdminProduct, CategoryId, Product, ProductDetails } from "@/types";

type ProductInsert = Omit<ProductRow, "createdAt" | "updatedAt" | "isVisible" | "sortOrder" | "featuredAt">;

export function toProductRow(product: Product): ProductInsert {
  const { id, name, brand, category, type, description, sizes, priceFrom, unit, image, featured, inStock, colors, ...rest } =
    product;
  const details: ProductDetails = { ...rest, ...(colors.length > 0 && { colors }) };
  return {
    id,
    name,
    brand,
    category,
    type,
    description,
    sizes,
    priceFrom: priceFrom ?? null,
    unit,
    image: image ?? null,
    details,
    featured: featured ?? false,
    inStock,
  };
}

export function fromProductRow(row: ProductRow): Product {
  const { colors = [], ...details } = row.details;
  return {
    ...details,
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category as CategoryId,
    type: row.type,
    description: row.description,
    sizes: row.sizes,
    ...(row.priceFrom !== null && { priceFrom: row.priceFrom }),
    unit: row.unit,
    colors,
    ...(row.image && { image: row.image }),
    featured: row.featured,
    inStock: row.inStock,
  };
}

export function toAdminProduct(row: ProductRow): AdminProduct {
  return { ...fromProductRow(row), isVisible: row.isVisible, updatedAt: row.updatedAt.toISOString() };
}
