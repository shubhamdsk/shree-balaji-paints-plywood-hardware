import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LocalBusinessJsonLd from "@/components/layout/LocalBusinessJsonLd";

describe("LocalBusinessJsonLd", () => {
  it("renders LocalBusiness JSON-LD script tag with shop info", () => {
    const { container } = render(<LocalBusinessJsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent || "{}");
    expect(data["@context"]).toBe("https://schema.org");
    expect(data.name).toContain("Shree Balaji");
    expect(data.address.addressLocality).toBe("Kotul");
  });
});
