import { vi } from "vitest";

export const router = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() };
export const pathname = vi.fn(() => "/");

export function useRouter() {
  return router;
}

export function usePathname() {
  return pathname();
}

export class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super(`Redirected to ${url}`);
  }
}

export function redirect(url: string): never {
  throw new RedirectSignal(url);
}
