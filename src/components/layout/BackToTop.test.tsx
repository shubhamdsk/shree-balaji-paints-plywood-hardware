import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BackToTop from "@/components/layout/BackToTop";
import { renderWithProviders } from "@/test/render";

function scrollPageTo(y: number) {
  act(() => {
    window.scrollY = y;
    fireEvent.scroll(window);
  });
}

describe("BackToTop", () => {
  it("stays out of reach until the page is scrolled down", () => {
    renderWithProviders(<BackToTop />);
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();

    scrollPageTo(1200);
    expect(screen.getByRole("button", { name: "Back to top" })).toBeDefined();

    scrollPageTo(0);
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();
  });

  it("scrolls back to the top", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const { user } = renderWithProviders(<BackToTop />);

    scrollPageTo(1200);
    await user.click(screen.getByRole("button", { name: "Back to top" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });
});
