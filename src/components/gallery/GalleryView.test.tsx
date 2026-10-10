import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GalleryView from "@/components/gallery/GalleryView";
import { renderWithProviders } from "@/test/render";
import type { GalleryItem } from "@/types";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const item: GalleryItem = {
  id: "g1",
  title: "Kotul villa exterior",
  category: "Painting Works",
  caption: "Weatherproof finish",
  image: "/images/gallery/villa.jpg",
  sortOrder: 0,
  isActive: true,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

describe("GalleryView", () => {
  it("shows each photo with its title, caption and a WhatsApp link that names it", () => {
    renderWithProviders(<GalleryView items={[item]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Gallery" })).toBeDefined();
    expect(screen.getByRole("img", { name: "Kotul villa exterior" })).toBeDefined();
    expect(screen.getByText("Weatherproof finish")).toBeDefined();
    const link = screen.getByRole("link", { name: "Ask about similar work" });
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain('"Kotul villa exterior"');
  });

  it("says so when there are no photos", () => {
    renderWithProviders(<GalleryView items={[]} />);
    expect(screen.getByText("No photos yet. Check back soon.")).toBeDefined();
  });
});
