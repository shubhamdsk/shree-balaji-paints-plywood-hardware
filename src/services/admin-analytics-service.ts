import { listAdminProducts } from "@/services/admin-product-service";
import { getCategories } from "@/services/catalog-service";

export interface CategoryStockStat {
  id: string;
  name: string;
  total: number;
  inStock: number;
  outOfStock: number;
}

export interface BrandStockStat {
  brand: string;
  total: number;
  inStock: number;
  outOfStock: number;
}

export interface PriceTierStat {
  label: string;
  count: number;
}

export interface AdminAnalyticsData {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  stockPercentage: number;
  hiddenCount: number;
  featuredCount: number;
  categoryStats: CategoryStockStat[];
  brandStats: BrandStockStat[];
  priceTiers: PriceTierStat[];
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsData> {
  const [products, categories] = await Promise.all([
    listAdminProducts(),
    getCategories(),
  ]);

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const stockPercentage = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const hiddenCount = products.filter((p) => !p.isVisible).length;
  const featuredCount = products.filter((p) => p.featured).length;

  // Category Breakdown
  const categoryMap = new Map<string, string>(categories.map((c) => [c.id, c.name]));
  const categoryStatsMap = new Map<string, { total: number; inStock: number; outOfStock: number }>();

  categories.forEach((c) => {
    categoryStatsMap.set(c.id, { total: 0, inStock: 0, outOfStock: 0 });
  });

  products.forEach((p) => {
    const stat = categoryStatsMap.get(p.category) ?? { total: 0, inStock: 0, outOfStock: 0 };
    stat.total += 1;
    if (p.inStock) stat.inStock += 1;
    else stat.outOfStock += 1;
    categoryStatsMap.set(p.category, stat);
  });

  const categoryStats: CategoryStockStat[] = Array.from(categoryStatsMap.entries()).map(([id, stat]) => ({
    id,
    name: categoryMap.get(id) ?? id.charAt(0).toUpperCase() + id.slice(1),
    total: stat.total,
    inStock: stat.inStock,
    outOfStock: stat.outOfStock,
  }));

  // Brand Breakdown (Top 7 brands + Others)
  const brandStatsMap = new Map<string, { total: number; inStock: number; outOfStock: number }>();
  products.forEach((p) => {
    const b = p.brand;
    const stat = brandStatsMap.get(b) ?? { total: 0, inStock: 0, outOfStock: 0 };
    stat.total += 1;
    if (p.inStock) stat.inStock += 1;
    else stat.outOfStock += 1;
    brandStatsMap.set(b, stat);
  });

  const sortedBrands = Array.from(brandStatsMap.entries())
    .map(([brand, stat]) => ({ brand, ...stat }))
    .sort((a, b) => b.total - a.total);

  const topBrands = sortedBrands.slice(0, 7);
  const otherBrands = sortedBrands.slice(7);

  if (otherBrands.length > 0) {
    const othersTotal = otherBrands.reduce((acc, curr) => acc + curr.total, 0);
    const othersInStock = otherBrands.reduce((acc, curr) => acc + curr.inStock, 0);
    const othersOutOfStock = otherBrands.reduce((acc, curr) => acc + curr.outOfStock, 0);
    topBrands.push({
      brand: "Other Brands",
      total: othersTotal,
      inStock: othersInStock,
      outOfStock: othersOutOfStock,
    });
  }

  // Price Tiers
  let tierUnder500 = 0;
  let tier500to1000 = 0;
  let tier1000to5000 = 0;
  let tierAbove5000 = 0;
  let tierQuote = 0;

  products.forEach((p) => {
    if (p.priceFrom === undefined || p.priceFrom === null) {
      tierQuote += 1;
    } else if (p.priceFrom < 500) {
      tierUnder500 += 1;
    } else if (p.priceFrom <= 1000) {
      tier500to1000 += 1;
    } else if (p.priceFrom <= 5000) {
      tier1000to5000 += 1;
    } else {
      tierAbove5000 += 1;
    }
  });

  const priceTiers: PriceTierStat[] = [
    { label: "Under ₹500", count: tierUnder500 },
    { label: "₹500 - ₹1,000", count: tier500to1000 },
    { label: "₹1,000 - ₹5,000", count: tier1000to5000 },
    { label: "Above ₹5,000", count: tierAbove5000 },
    { label: "Ask for Price", count: tierQuote },
  ];

  return {
    totalProducts,
    inStockCount,
    outOfStockCount,
    stockPercentage,
    hiddenCount,
    featuredCount,
    categoryStats,
    brandStats: topBrands,
    priceTiers,
  };
}
