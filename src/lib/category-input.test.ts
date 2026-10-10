import { describe, expect, it } from "vitest";
import { readCategoryForm, validateCategoryInput } from "@/lib/category-input";

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe("validateCategoryInput", () => {
  it("trims the text, turns the position into a number and drops empty optional fields", () => {
    const raw = readCategoryForm(form({ name: "  Glass  ", sortOrder: " 7 ", tagline: "   ", seoTitle: "Glass in Kotul" }));
    expect(validateCategoryInput(raw)).toEqual({
      ok: true,
      input: { name: "Glass", sortOrder: 7, seoTitle: "Glass in Kotul" },
    });
  });

  it("reports one message per field", () => {
    const result = validateCategoryInput(
      readCategoryForm(form({ name: "G", sortOrder: "-1", seoDescription: "x".repeat(161) })),
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Enter the name",
        sortOrder: "Enter a whole number from 0 to 9999",
        seoDescription: "Keep the search description under 160 characters",
      },
    });
  });

  it("rejects emojis in names and titles but allows them in descriptions", () => {
    const result = validateCategoryInput(
      readCategoryForm(form({ name: "Glass 🪟", sortOrder: "1", tagline: "1234", description: "Clear glass ✨" })),
    );
    expect(result).toEqual({
      ok: false,
      errors: { name: "Emojis aren't allowed here", tagline: "Use at least one letter" },
    });
  });
});
