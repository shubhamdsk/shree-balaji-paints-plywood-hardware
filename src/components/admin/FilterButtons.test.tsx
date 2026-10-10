import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FilterButtons from "@/components/admin/FilterButtons";
import { renderWithProviders } from "@/test/render";

const filters = [
  { value: "all", label: "All", count: 5 },
  { value: "hidden", label: "Hidden", count: 2 },
];

describe("FilterButtons", () => {
  it("shows each filter with its count and marks the chosen one", () => {
    renderWithProviders(<FilterButtons filters={filters} value="all" onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Show" })).toBeDefined();
    expect(screen.getByRole("button", { name: "All 5" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Hidden 2" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("reports the filter that was tapped", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<FilterButtons filters={filters} value="all" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Hidden 2" }));
    expect(onChange).toHaveBeenCalledWith("hidden");
  });
});
