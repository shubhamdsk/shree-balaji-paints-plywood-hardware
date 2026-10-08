import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppLink from "@/components/ui/AppLink";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { linkNavigated } from "@/test/mocks/next-link";
import { pathname, router } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const { push } = router;

beforeEach(() => {
  linkNavigated.mockClear();
  router.push.mockClear();
  pathname.mockReturnValue("/");
});

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
    expect(screen.getByRole("status").textContent).toContain("Loading page...");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ignores repeat clicks while navigation is in progress", () => {
    renderWithProviders(<EditableForm />);
    const link = screen.getByRole("link", { name: "Products" });

    fireEvent.click(link);
    fireEvent.click(link);

    expect(linkNavigated).toHaveBeenCalledTimes(1);
  });

  it("clears completed navigation progress before returning to the previous route", async () => {
    const { user, rerender } = renderWithProviders(<EditableForm />);
    await user.click(screen.getByRole("link", { name: "Products" }));
    expect(screen.getByRole("status").textContent).toContain("Loading page...");

    pathname.mockReturnValue("/products");
    rerender(<EditableForm />);
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());

    pathname.mockReturnValue("/");
    rerender(<EditableForm />);
    expect(screen.queryByRole("status")).toBeNull();
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
