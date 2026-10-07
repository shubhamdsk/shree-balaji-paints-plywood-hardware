import { vi } from "vitest";

export function unstable_cache<T>(fn: T): T {
  return fn;
}

export const updateTag = vi.fn();
export const revalidateTag = vi.fn();
export const revalidatePath = vi.fn();
