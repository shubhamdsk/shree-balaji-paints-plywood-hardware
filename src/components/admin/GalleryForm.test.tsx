import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GalleryForm from "@/components/admin/GalleryForm";
import { renderWithProviders } from "@/test/render";
import type { GalleryItem } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const item = {
  id: "gal_1",
  title: "Villa exterior painting",
  category: "Painting Works",
  caption: "",
  image: "/images/gallery/villa-painting.jpg",
  isActive: true,
} as GalleryItem;

function description(field: HTMLElement) {
  return document.getElementById(field.getAttribute("aria-describedby") ?? "")?.textContent;
}

describe("GalleryForm", () => {
  it("asks for a title and a photo before uploading a new work photo", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<GalleryForm item={null} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Save Work Photo" }));

    expect(description(screen.getByLabelText(/Project Title/))).toBe("Enter a project title");
    expect(description(screen.getByLabelText("Photo"))).toBe("Choose a photo of the finished work");
    expect(screen.getByRole("alert").textContent).toBe("Fix the 2 highlighted fields to continue.");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps the current photo when editing, so only the text is checked", async () => {
    const { user } = renderWithProviders(<GalleryForm item={item} onClose={vi.fn()} />);
    await user.clear(screen.getByLabelText(/Project Title/));
    await user.click(screen.getByRole("button", { name: "Save Work Photo" }));
    expect(screen.getByRole("alert").textContent).toBe("Fix the highlighted field to continue.");
    expect(screen.getByLabelText("Photo").getAttribute("aria-describedby")).toBeNull();
  });

  it("asks before closing with unsaved changes", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<GalleryForm item={item} onClose={onClose} />);
    await user.type(screen.getByLabelText(/Project Title/), " at Kotul");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });
});
