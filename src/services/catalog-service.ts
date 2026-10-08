import { and, asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { popularBrands } from "@/data/brands";
import { categoryGroups as staticCategoryGroups } from "@/data/category-tree";
import { categories as staticCategories } from "@/data/categories";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError, httpClient } from "@/lib/api/http-client";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isCalculablePaint } from "@/lib/paint-calculator";
import { getDb } from "@/server/db/client";
import { fromProductRow } from "@/server/db/product-mapper";
import { categories as dbCategories, products, subcategories as dbSubcategories } from "@/server/db/schema";
import type { Category, CategoryGroup, Product } from "@/types";

// Must point to an external backend, never to this site's own /api, or the routes call themselves.
const catalogApiUrl = process.env.CATALOG_API_URL;

function fromSource<T>(endpoint: string, localData: T): Promise<T> {
  if (!catalogApiUrl) return Promise.resolve(localData);
  return httpClient.get<T>(endpoint, { baseUrl: catalogApiUrl });
}

const readVisibleProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.isVisible, true))
      .orderBy(asc(products.sortOrder), asc(products.name));
    return rows.map(fromProductRow);
  },
  ["visible-products"],
  { tags: [CACHE_TAGS.catalog] },
);

const readFeaturedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.isVisible, true), eq(products.featured, true)))
      .orderBy(sql`${products.featuredAt} desc nulls last`, asc(products.sortOrder), asc(products.name));
    return rows.map(fromProductRow);
  },
  ["featured-products"],
  { tags: [CACHE_TAGS.catalog] },
);

const readCategories = unstable_cache(
  async (): Promise<Category[]> => {
    try {
      const db = await getDb();
      const rows = await db
        .select()
        .from(dbCategories)
        .where(eq(dbCategories.isActive, true))
        .orderBy(asc(dbCategories.sortOrder), asc(dbCategories.name));

      if (rows.length === 0) return staticCategories;

      return rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        tagline: c.tagline ?? "",
        description: c.description ?? "",
        image: c.image ?? "/images/categories/plywood.jpg",
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }));
    } catch {
      return staticCategories;
    }
  },
  ["db-categories"],
  { tags: [CACHE_TAGS.catalog] },
);

const readCategoryGroups = unstable_cache(
  async (): Promise<CategoryGroup[]> => {
    try {
      const db = await getDb();
      const [cats, subs] = await Promise.all([
        db.select().from(dbCategories).where(eq(dbCategories.isActive, true)).orderBy(asc(dbCategories.sortOrder)),
        db.select().from(dbSubcategories).where(eq(dbSubcategories.isActive, true)).orderBy(asc(dbSubcategories.sortOrder)),
      ]);

      if (cats.length === 0) return staticCategoryGroups;

      return cats.map((cat) => {
        const catSubs = subs.filter((s) => s.categoryId === cat.id).map((s) => s.name);
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          subtypes: catSubs,
        };
      });
    } catch {
      return staticCategoryGroups;
    }
  },
  ["db-category-groups"],
  { tags: [CACHE_TAGS.catalog] },
);

export function getProducts(): Promise<Product[]> {
  if (catalogApiUrl) return httpClient.get<Product[]>(API_ENDPOINTS.products, { baseUrl: catalogApiUrl });
  return readVisibleProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (!catalogApiUrl) return (await readVisibleProducts()).find((p) => p.id === id);
  try {
    return await httpClient.get<Product>(API_ENDPOINTS.product(id), { baseUrl: catalogApiUrl });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!catalogApiUrl) return readFeaturedProducts();
  return (await getProducts()).filter((p) => p.featured);
}

export async function getCalculablePaints(): Promise<Product[]> {
  return (await getProducts()).filter(isCalculablePaint);
}

export async function getCategories(): Promise<Category[]> {
  if (catalogApiUrl) return fromSource(API_ENDPOINTS.categories, staticCategories);
  return readCategories();
}

export async function getCategoryGroups(): Promise<CategoryGroup[]> {
  if (catalogApiUrl) return fromSource(API_ENDPOINTS.categoryGroups, staticCategoryGroups);
  return readCategoryGroups();
}

export function getPopularBrands(): Promise<string[]> {
  return fromSource(API_ENDPOINTS.brands, [...popularBrands]);
}

