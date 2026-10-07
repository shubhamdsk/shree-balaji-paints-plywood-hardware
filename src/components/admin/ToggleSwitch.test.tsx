import { screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { renderWithProviders } from "@/test/render";

function Harness() {
  const [checked, setChecked] = useState(false);
  return <ToggleSwitch label="In stock" ariaLabel="Tractor Emulsion in stock" checked={checked} onChange={setChecked} />;
}

describe("ToggleSwitch", () => {
  it("is a switch named for its product that flips on click and with the keyboard", async () => {
    const { user } = renderWithProviders(<Harness />);
    const toggle = screen.getByRole("switch", { name: "Tractor Emulsion in stock" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    await user.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("true");

    await user.keyboard(" ");
    expect(toggle.getAttribute("aria-checked")).toBe("false");
  });
});
