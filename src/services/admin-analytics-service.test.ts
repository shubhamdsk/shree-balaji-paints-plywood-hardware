import { describe, expect, it } from "vitest";
import { getAdminAnalytics } from "@/services/admin-analytics-service";
import { setupTestDatabase } from "@/test/db";

setupTestDatabase();

describe("admin-analytics-service", () => {
  it("computes accurate stock, category, brand and price tier stats", async () => {
    const data = await getAdminAnalytics();

    expect(data.totalProducts).toBeGreaterThan(0);
    expect(data.inStockCount + data.outOfStockCount).toBe(data.totalProducts);
    expect(data.stockPercentage).toBeGreaterThanOrEqual(0);
    expect(data.stockPercentage).toBeLessThanOrEqual(100);

    expect(data.categoryStats.length).toBeGreaterThan(0);
    const categorySum = data.categoryStats.reduce((sum, c) => sum + c.total, 0);
    expect(categorySum).toBe(data.totalProducts);

    expect(data.brandStats.length).toBeGreaterThan(0);
    expect(data.priceTiers.length).toBe(5);

    const priceSum = data.priceTiers.reduce((sum, p) => sum + p.count, 0);
    expect(priceSum).toBe(data.totalProducts);
  });
});
