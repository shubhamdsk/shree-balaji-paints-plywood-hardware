import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CoverImage from "@/components/ui/CoverImage";
import { renderWithProviders } from "@/test/render";

describe("CoverImage", () => {
  it("shows the photo when there is one", () => {
    renderWithProviders(<CoverImage src="/images/categories/paints.jpg" alt="Paints" sizes="100vw" />);
    expect(screen.getByRole("img", { name: "Paints" }).getAttribute("src")).toContain("paints.jpg");
  });

  it("shows a labelled placeholder instead of a stock photo when there is none", () => {
    renderWithProviders(<CoverImage alt="Screws, Nails & Fasteners" sizes="100vw" />);
    const placeholder = screen.getByRole("img", { name: "Screws, Nails & Fasteners" });
    expect(placeholder.tagName).toBe("SPAN");
  });
});
