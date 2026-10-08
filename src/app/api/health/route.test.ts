import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { createLocalDatabase, setDatabase } from "@/server/db/client";

beforeEach(async () => {
  setDatabase(await createLocalDatabase());
}, 30000);

describe("GET /api/health", () => {
  it("returns ok when the database is reachable", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, status: "healthy" });
  });
});
