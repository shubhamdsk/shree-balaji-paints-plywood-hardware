import { and, asc, eq, sql, type SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { popularBrands } from "@/data/brands";
import { categoryGroups as staticCategoryGroups } from "@/data/category-tree";
import { categories as staticCategories } from "@/data/categories";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError, httpClient } from "@/lib/api/http-client";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { findBrandBySlug } from "@/lib/catalog";
import { isCalculablePaint } from "@/lib/paint-calculator";
import { getDb } from "@/server/db/client";
import { fromProductRow } from "@/server/db/product-mapper";
import { categories as dbCategories, products, subcategories as dbSubcategories } from "@/server/db/schema";
import type { CatalogProduct, Category, CategoryGroup, Product, ProductSummary } from "@/types";

// Must point to an external backend, never to this site's own /api, or the routes call themselves.
const catalogApiUrl = process.env.CATALOG_API_URL;

const CALCULATOR_CATEGORIES = ["paints", "paint-preparation"];

function fromSource<T>(endpoint: string, localData: T): Promise<T> {
  if (!catalogApiUrl) return Promise.resolve(localData);
  return httpClient.get<T>(endpoint, { baseUrl: catalogApiUrl });
}

const placed = and(eq(products.isVisible, true), eq(dbSubcategories.isActive, true), eq(dbCategories.isActive, true));
const catalogueOrder = [asc(products.sortOrder), asc(products.name)];

async function readPlacedProducts(filter?: SQL): Promise<Product[]> {
  const db = await getDb();
  const rows = await db
    .select({ product: products, category: dbSubcategories.categoryId, categoryName: dbCategories.name, type: dbSubcategories.name })
    .from(products)
    .innerJoin(dbSubcategories, eq(products.subcategoryId, dbSubcategories.id))
    .innerJoin(dbCategories, eq(dbSubcategories.categoryId, dbCategories.id))
    .where(filter ? and(placed, filter) : placed)
    .orderBy(...catalogueOrder);
  return rows.map(({ product, ...placement }) => fromProductRow(product, placement));
}

async function readCatalogProducts(filter?: SQL, featuredFirst = false): Promise<CatalogProduct[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      category: dbSubcategories.categoryId,
      categoryName: dbCategories.name,
      type: dbSubcategories.name,
      description: products.description,
      sizes: products.sizes,
      priceFrom: products.priceFrom,
      unit: products.unit,
      image: sql<string | null>`coalesce(${products.details}->'gallery'->>0, ${products.image})`,
      featured: products.featured,
      inStock: products.inStock,
    })
    .from(products)
    .innerJoin(dbSubcategories, eq(products.subcategoryId, dbSubcategories.id))
    .innerJoin(dbCategories, eq(dbSubcategories.categoryId, dbCategories.id))
    .where(filter ? and(placed, filter) : placed)
    .orderBy(...(featuredFirst ? [sql`${products.featuredAt} desc nulls last`] : []), ...catalogueOrder);
  return rows.map(({ priceFrom, image, ...row }) => ({
    ...row,
    ...(priceFrom !== null && { priceFrom }),
    ...(image && { image }),
  }));
}

function toCatalogProduct({ id, name, brand, category, categoryName, type, description, sizes, priceFrom, unit, image, gallery, featured, inStock }: Product): CatalogProduct {
  const cover = gallery?.[0] ?? image;
  return {
    id,
    name,
    brand,
    category,
    ...(categoryName && { categoryName }),
    type,
    description,
    sizes,
    ...(priceFrom !== undefined && { priceFrom }),
    unit,
    ...(cover && { image: cover }),
    featured,
    inStock,
  };
}

const readAllProducts = unstable_cache(() => readPlacedProducts(), ["all-products"], {
  tags: [CACHE_TAGS.structure, CACHE_TAGS.products],
});

const readAllCatalogProducts = unstable_cache(() => readCatalogProducts(), ["catalog-products"], {
  tags: [CACHE_TAGS.structure, CACHE_TAGS.products],
});

const readFeaturedProducts = unstable_cache(() => readCatalogProducts(eq(products.featured, true), true), ["featured-products"], {
  tags: [CACHE_TAGS.structure, CACHE_TAGS.featured],
});

const readProductIndex = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    const db = await getDb();
    return db
      .select({ id: products.id, name: products.name, brand: products.brand, category: dbSubcategories.categoryId, type: dbSubcategories.name })
      .from(products)
      .innerJoin(dbSubcategories, eq(products.subcategoryId, dbSubcategories.id))
      .innerJoin(dbCategories, eq(dbSubcategories.categoryId, dbCategories.id))
      .where(placed)
      .orderBy(...catalogueOrder);
  },
  ["product-index"],
  { tags: [CACHE_TAGS.structure, CACHE_TAGS.productIndex] },
);

function readCategoryProducts(categoryId: string) {
  return unstable_cache(() => readCatalogProducts(eq(dbSubcategories.categoryId, categoryId)), ["category-products", categoryId], {
    tags: [CACHE_TAGS.structure, CACHE_TAGS.category(categoryId)],
  })();
}

function readBrandProducts(brand: string) {
  return unstable_cache(() => readCatalogProducts(eq(products.brand, brand)), ["brand-products", brand], {
    tags: [CACHE_TAGS.structure, CACHE_TAGS.brand(brand)],
  })();
}

function readProduct(id: string) {
  return unstable_cache(async () => (await readPlacedProducts(eq(products.id, id)))[0] ?? null, ["product", id], {
    tags: [CACHE_TAGS.structure, CACHE_TAGS.product(id)],
  })();
}

function seo(row: { seoTitle: string | null; seoDescription: string | null }) {
  return { ...(row.seoTitle && { seoTitle: row.seoTitle }), ...(row.seoDescription && { seoDescription: row.seoDescription }) };
}

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
        ...(c.image && { image: c.image }),
        ...seo(c),
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }));
    } catch {
      return staticCategories;
    }
  },
  ["db-categories"],
  { tags: [CACHE_TAGS.structure] },
);

const readCategoryGroups = unstable_cache(
  async (): Promise<CategoryGroup[]> => {
    try {
      const db = await getDb();
      const [cats, subs] = await Promise.all([
        db.select().from(dbCategories).where(eq(dbCategories.isActive, true)).orderBy(asc(dbCategories.sortOrder)),
        db
          .select()
          .from(dbSubcategories)
          .where(eq(dbSubcategories.isActive, true))
          .orderBy(asc(dbSubcategories.sortOrder), asc(dbSubcategories.name)),
      ]);

      if (cats.length === 0) return staticCategoryGroups;

      return cats.map((cat) => {
        const catSubs = subs.filter((s) => s.categoryId === cat.id);
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          ...(cat.description && { description: cat.description }),
          ...seo(cat),
          subtypes: catSubs.map((s) => s.name),
          subtypeDetails: catSubs.map((s) => ({
            name: s.name,
            ...(s.description && { description: s.description }),
            ...(s.image && { image: s.image }),
            ...seo(s),
          })),
        };
      });
    } catch {
      return staticCategoryGroups;
    }
  },
  ["db-category-groups"],
  { tags: [CACHE_TAGS.structure] },
);

/** Every visible product with all its details. Only the public products API needs this much. */
export function getProducts(): Promise<Product[]> {
  if (catalogApiUrl) return httpClient.get<Product[]>(API_ENDPOINTS.products, { baseUrl: catalogApiUrl });
  return readAllProducts();
}

export const getCatalogProducts = cache(async (): Promise<CatalogProduct[]> => {
  if (catalogApiUrl) return (await getProducts()).map(toCatalogProduct);
  return readAllCatalogProducts();
});

export const getProductIndex = cache(async (): Promise<ProductSummary[]> => {
  if (catalogApiUrl) return (await getProducts()).map(({ id, name, brand, category, type }) => ({ id, name, brand, category, type }));
  return readProductIndex();
});

export const getCategoryProducts = cache(async (categoryId: string): Promise<CatalogProduct[]> => {
  if (catalogApiUrl) return (await getCatalogProducts()).filter((p) => p.category === categoryId);
  return readCategoryProducts(categoryId);
});

export async function findBrand(slug: string): Promise<string | undefined> {
  return findBrandBySlug(await getProductIndex(), slug);
}

export const getBrandProducts = cache(async (brand: string): Promise<CatalogProduct[]> => {
  if (catalogApiUrl) return (await getCatalogProducts()).filter((p) => p.brand === brand);
  return readBrandProducts(brand);
});

export const getProductById = cache(async (id: string): Promise<Product | undefined> => {
  if (!catalogApiUrl) return (await readProduct(id)) ?? undefined;
  try {
    return await httpClient.get<Product>(API_ENDPOINTS.product(id), { baseUrl: catalogApiUrl });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
});

export const getFeaturedProducts = cache(async (): Promise<CatalogProduct[]> => {
  if (!catalogApiUrl) return readFeaturedProducts();
  return (await getCatalogProducts()).filter((p) => p.featured);
});

export async function getCalculablePaints(): Promise<CatalogProduct[]> {
  const lists = await Promise.all(CALCULATOR_CATEGORIES.map(getCategoryProducts));
  return lists.flat().filter(isCalculablePaint);
}

export const getCategories = cache(async (): Promise<Category[]> => {
  if (catalogApiUrl) return fromSource(API_ENDPOINTS.categories, staticCategories);
  return readCategories();
});

export const getCategoryGroups = cache(async (): Promise<CategoryGroup[]> => {
  if (catalogApiUrl) return fromSource(API_ENDPOINTS.categoryGroups, staticCategoryGroups);
  return readCategoryGroups();
});

export function getPopularBrands(): Promise<string[]> {
  return fromSource(API_ENDPOINTS.brands, [...popularBrands]);
}
