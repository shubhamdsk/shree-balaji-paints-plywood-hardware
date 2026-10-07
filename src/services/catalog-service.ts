import { popularBrands } from "@/data/brands";
import { categoryGroups } from "@/data/category-tree";
import { categories, products } from "@/data/products";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError, httpClient } from "@/lib/api/http-client";
import { isCalculablePaint } from "@/lib/paint-calculator";
import type { Category, CategoryGroup, Product } from "@/types";

// Must point to an external backend, never to this site's own /api, or the routes call themselves.
const catalogApiUrl = process.env.CATALOG_API_URL;

function fromSource<T>(endpoint: string, localData: T): Promise<T> {
  if (!catalogApiUrl) return Promise.resolve(localData);
  return httpClient.get<T>(endpoint, { baseUrl: catalogApiUrl });
}

export function getProducts(): Promise<Product[]> {
  return fromSource(API_ENDPOINTS.products, products);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (!catalogApiUrl) return products.find((p) => p.id === id);
  try {
    return await httpClient.get<Product>(API_ENDPOINTS.product(id), { baseUrl: catalogApiUrl });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.featured);
}

export async function getCalculablePaints(): Promise<Product[]> {
  return (await getProducts()).filter(isCalculablePaint);
}

export function getCategories(): Promise<Category[]> {
  return fromSource(API_ENDPOINTS.categories, categories);
}

export function getCategoryGroups(): Promise<CategoryGroup[]> {
  return fromSource(API_ENDPOINTS.categoryGroups, categoryGroups);
}

export function getPopularBrands(): Promise<string[]> {
  return fromSource(API_ENDPOINTS.brands, [...popularBrands]);
}
