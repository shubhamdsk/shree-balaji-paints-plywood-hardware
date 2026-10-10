import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import { openConnection, withTransaction } from "@/server/db/client";
import { products } from "@/server/db/schema";
import { setupTestDatabase } from "@/test/db";

const db = setupTestDatabase();

async function inStock(id: string) {
  const [row] = await db().select({ inStock: products.inStock }).from(products).where(eq(products.id, id));
  return row.inStock;
}

describe("withTransaction", () => {
  it("keeps the changes when the work finishes", async () => {
    const result = await withTransaction(async (tx) => {
      await tx.update(products).set({ inStock: false }).where(eq(products.id, "ap-royale-luxury"));
      return "saved";
    });
    expect(result).toBe("saved");
    expect(await inStock("ap-royale-luxury")).toBe(false);
  });

  it("undoes every change when the work fails", async () => {
    await expect(
      withTransaction(async (tx) => {
        await tx.update(products).set({ inStock: false }).where(eq(products.id, "ap-royale-luxury"));
        throw new Error("audit log write failed");
      }),
    ).rejects.toThrow("audit log write failed");
    expect(await inStock("ap-royale-luxury")).toBe(true);
  });
});

describe("openConnection", () => {
  it("tries once more when the first connection fails to open", async () => {
    const connect = vi.fn().mockRejectedValueOnce(new Error("network drop")).mockResolvedValueOnce("connection");
    expect(await openConnection({ connect })).toBe("connection");
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("gives up after the second failure", async () => {
    const connect = vi.fn().mockRejectedValue(new Error("offline"));
    await expect(openConnection({ connect })).rejects.toThrow("offline");
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
