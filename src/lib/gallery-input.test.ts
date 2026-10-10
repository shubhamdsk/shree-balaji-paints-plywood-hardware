import { describe, expect, it } from "vitest";
import { readGalleryForm, validateGalleryInput } from "@/lib/gallery-input";

const valid = { title: "Villa exterior painting", category: "Painting Works", caption: "" };

describe("readGalleryForm", () => {
  it("reads the three text fields", () => {
    const formData = new FormData();
    formData.set("title", valid.title);
    formData.set("category", valid.category);
    expect(readGalleryForm(formData)).toEqual(valid);
  });
});

describe("validateGalleryInput", () => {
  it("accepts a complete item", () => {
    expect(validateGalleryInput(valid, { needsPhoto: false })).toEqual({ ok: true, input: valid });
  });

  it("reports one message per field, including a missing photo", () => {
    expect(validateGalleryInput({ title: " ", category: "Tiles", caption: "x".repeat(301) }, { needsPhoto: true })).toEqual({
      ok: false,
      errors: {
        title: "Enter a project title",
        category: "Choose a category",
        caption: "Keep the caption under 300 characters",
        photo: "Choose a photo of the finished work",
      },
    });
  });

  it("needs a photo even when the text is fine", () => {
    expect(validateGalleryInput(valid, { needsPhoto: true })).toEqual({
      ok: false,
      errors: { photo: "Choose a photo of the finished work" },
    });
  });
});
