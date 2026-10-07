import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { sitemapPaths } from "@/lib/sitemap";
import { getCategoryGroups, getProducts } from "@/services/catalog-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, groups] = await Promise.all([getProducts(), getCategoryGroups()]);
  return sitemapPaths(products, groups).map((path) => ({ url: absoluteUrl(path) }));
}
