import { fireEvent, screen } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import AppLink from "@/components/ui/AppLink";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { renderWithProviders } from "@/test/render";

const { push, replace, linkNavigated } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  linkNavigated: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    onNavigate,
    ...props
  }: ComponentProps<"a"> & { href: string; onNavigate?: (event: { preventDefault: () => void }) => void }) {
    return (
      <a
        href={href}
        {...props}
        onClick={(event) => {
          event.preventDefault();
          let prevented = false;
          onNavigate?.({ preventDefault: () => (prevented = true) });
          if (!prevented) linkNavigated(href);
        }}
      />
    );
  },
}));

function EditableForm() {
  const [value, setValue] = useState("");
  useUnsavedChanges(value !== "");
  return (
    <>
      <label htmlFor="note">Note</label>
      <input id="note" value={value} onChange={(e) => setValue(e.target.value)} />
      <AppLink href="/products">Products</AppLink>
    </>
  );
}

describe("AppLink with the unsaved-changes guard", () => {
  it("navigates normally when nothing is dirty", async () => {
    const { user } = renderWithProviders(<EditableForm />);
    await user.click(screen.getByRole("link", { name: "Products" }));
    expect(linkNavigated).toHaveBeenCalledWith("/products");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before leaving and stays when the user keeps editing", async () => {
    const { user } = renderWithProviders(<EditableForm />);
    await user.type(screen.getByLabelText("Note"), "draft");
    await user.click(screen.getByRole("link", { name: "Products" }));

    expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(linkNavigated).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Note")).toHaveProperty("value", "draft");
  });

  it("navigates with the router after the user discards", async () => {
    const { user } = renderWithProviders(<EditableForm />);
    await user.type(screen.getByLabelText("Note"), "draft");
    await user.click(screen.getByRole("link", { name: "Products" }));
    await user.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(push).toHaveBeenCalledWith("/products", { scroll: undefined });
  });

  it("warns on reload or tab close only while dirty", async () => {
    const { user } = renderWithProviders(<EditableForm />);
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    await user.type(screen.getByLabelText("Note"), "draft");
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    fireEvent(window, dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });
});
