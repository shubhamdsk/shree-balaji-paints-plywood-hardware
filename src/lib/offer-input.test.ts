import { describe, expect, it } from "vitest";
import { formatOfferDate, offerStatus, validateOfferInput } from "@/lib/offer-input";

const valid = { title: "Diwali offer", body: "10% off on Royale", startsOn: "2026-10-20", endsOn: "2026-10-27" };

describe("offerStatus", () => {
  it("is live from the start day through the whole end day", () => {
    expect(offerStatus(valid, "2026-10-19")).toBe("upcoming");
    expect(offerStatus(valid, "2026-10-20")).toBe("live");
    expect(offerStatus(valid, "2026-10-27")).toBe("live");
    expect(offerStatus(valid, "2026-10-28")).toBe("ended");
  });
});

describe("formatOfferDate", () => {
  it("shows the day without shifting it by timezone", () => {
    expect(formatOfferDate("2026-10-20")).toBe("20 Oct 2026");
  });
});

describe("validateOfferInput", () => {
  it("accepts a complete offer", () => {
    expect(validateOfferInput(valid)).toEqual({ ok: true, input: valid });
  });

  it("rejects an emoji title but allows emojis in the text", () => {
    expect(validateOfferInput({ ...valid, title: "Diwali 🪔 offer", body: "10% off 🎉" })).toEqual({
      ok: false,
      errors: { title: "Emojis aren't allowed here" },
    });
  });

  it("requires a title, text and both dates", () => {
    expect(validateOfferInput({ title: "", body: " ", startsOn: "", endsOn: "" })).toEqual({
      ok: false,
      errors: {
        title: "Enter the offer title",
        body: "Describe the offer",
        startsOn: "Choose the start date",
        endsOn: "Choose the end date",
      },
    });
  });

  it("rejects dates that don't exist and an end before the start", () => {
    expect(validateOfferInput({ ...valid, startsOn: "2026-02-30" })).toMatchObject({ errors: { startsOn: "Choose the start date" } });
    expect(validateOfferInput({ ...valid, endsOn: "2026-10-19" })).toMatchObject({
      errors: { endsOn: "The end date must be on or after the start date" },
    });
  });
});
