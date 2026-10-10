import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminGalleryList from "@/components/admin/AdminGalleryList";
import { renderWithProviders } from "@/test/render";
import type { GalleryItem } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const sampleGallery: GalleryItem[] = [
  {
    id: "gal_1",
    title: "Kotul Bungalow Painting",
    category: "Painting Works",
    caption: "Full exterior Apex Ultima finish",
    image: "/images/sample.jpg",
    sortOrder: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("AdminGalleryList", () => {
  it("renders gallery items and open upload modal", async () => {
    const { user } = renderWithProviders(<AdminGalleryList initialItems={sampleGallery} />);
    expect(screen.getByRole("heading", { name: "Gallery" })).toBeDefined();
    expect(screen.getByText("Kotul Bungalow Painting")).toBeDefined();
    expect(screen.getByRole("switch", { name: "Kotul Bungalow Painting on the website" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete Kotul Bungalow Painting" })).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Add photo" }));
    expect(screen.getByRole("heading", { name: "Add photo" })).toBeDefined();
  });
});
