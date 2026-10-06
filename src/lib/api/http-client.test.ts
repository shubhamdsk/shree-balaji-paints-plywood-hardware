import { describe, expect, it, vi } from "vitest";
import { ApiError, httpClient } from "@/lib/api/http-client";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("httpClient", () => {
  it("GETs JSON from the base URL and path", async () => {
    const fetchMock = mockFetch(200, [{ id: "a" }]);
    await expect(httpClient.get("/api/products", { baseUrl: "https://backend.test" })).resolves.toEqual([{ id: "a" }]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://backend.test/api/products");
    expect(init.method).toBe("GET");
    expect(init.headers).toEqual({ Accept: "application/json" });
  });

  it("sends a JSON body with a content type on POST", async () => {
    const fetchMock = mockFetch(201, { ok: true });
    await httpClient.post("/api/enquiries", { name: "Ramesh" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"name":"Ramesh"}');
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("throws an ApiError with the status when the response is not ok", async () => {
    mockFetch(404, { message: "Not found" });
    const error = await httpClient.get("/api/products/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
  });
});
