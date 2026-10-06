import { vi } from "vitest";

export const router = { push: vi.fn(), replace: vi.fn() };
export const pathname = vi.fn(() => "/");

export function useRouter() {
  return router;
}

export function usePathname() {
  return pathname();
}
