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
    expect(screen.getByText("Our Work Gallery Management")).toBeDefined();
    expect(screen.getByText("Kotul Bungalow Painting")).toBeDefined();

    const uploadBtn = screen.getByRole("button", { name: /Upload Work Photo/ });
    await user.click(uploadBtn);
    expect(screen.getByRole("heading", { name: "Upload Work Photo" })).toBeDefined();
  });
});
