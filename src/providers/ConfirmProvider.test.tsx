import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useConfirm } from "@/hooks/use-confirm";
import { renderWithProviders } from "@/test/render";

function DeleteButton() {
  const confirm = useConfirm();
  const [result, setResult] = useState("none");

  const handleClick = async () => {
    const confirmed = await confirm({
      title: "Delete item?",
      message: "This cannot be undone.",
      confirmLabel: "Yes, delete",
      tone: "danger",
    });
    setResult(String(confirmed));
  };

  return (
    <>
      <button onClick={handleClick}>Delete</button>
      <output>{result}</output>
    </>
  );
}

describe("ConfirmProvider and useConfirm", () => {
  it("shows the dialog with the given text and resolves true on confirm", async () => {
    const { user } = renderWithProviders(<DeleteButton />);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = screen.getByRole("dialog", { name: "Delete item?" });
    expect(dialog).toHaveProperty("open", true);
    expect(screen.getByText("This cannot be undone.")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(screen.getByRole("status").textContent).toBe("true");
    expect(dialog).toHaveProperty("open", false);
  });

  it("resolves false on cancel", async () => {
    const { user } = renderWithProviders(<DeleteButton />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("status").textContent).toBe("false");
  });

  it("throws a clear error when used outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Orphan() {
      useConfirm();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow("useConfirm must be used inside <ConfirmProvider>");
  });
});
