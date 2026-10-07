import { screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import SelectMenu, { type SelectOption } from "@/components/ui/SelectMenu";
import { renderWithProviders } from "@/test/render";

const brands: SelectOption[] = [
  "All Brands",
  "Asian Paints",
  "Berger",
  "Dulux",
  "Fevicol",
  "Hafele",
  "Hettich",
  "Legrand",
  "Nerolac",
].map((label) => ({ value: label === "All Brands" ? "" : label, label }));

function Harness({ options = brands, initial = "" }: { options?: SelectOption[]; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <SelectMenu label="Brand" value={value} onChange={setValue} options={options} />;
}

describe("SelectMenu", () => {
  it("shows the selected option and opens a list with it marked", async () => {
    const { user } = renderWithProviders(<Harness initial="Berger" />);
    const trigger = screen.getByRole("button", { name: "Brand: Berger" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("option", { name: "Berger" }).getAttribute("aria-selected")).toBe("true");
  });

  it("filters long lists as you type and picks with the keyboard", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "Brand: All Brands" }));

    const search = screen.getByRole("combobox", { name: "Search brand" });
    expect(document.activeElement).toBe(search);
    await user.type(search, "le");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Hafele", "Legrand"]);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Brand: Legrand" }));
  });

  it("says when nothing matches", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "Brand: All Brands" }));
    await user.type(screen.getByRole("combobox", { name: "Search brand" }), "zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/No matches/)).toBeDefined();
  });

  it("skips the search box on short lists and closes on Escape", async () => {
    const short = brands.slice(0, 3);
    const { user } = renderWithProviders(<Harness options={short} />);
    await user.click(screen.getByRole("button", { name: "Brand: All Brands" }));

    expect(screen.queryByRole("combobox")).toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes when clicking outside", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByRole("button", { name: "Brand: All Brands" }));
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
