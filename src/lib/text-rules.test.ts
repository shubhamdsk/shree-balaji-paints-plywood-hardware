import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  TEXT_ERRORS,
  isPhoneText,
  keepDigits,
  keepPhoneChars,
  labelProblem,
  longTextProblem,
  personNameProblem,
  plainTextProblem,
  textRule,
} from "@/lib/text-rules";

describe("labelProblem", () => {
  it("accepts names and titles in any script, with brand symbols", () => {
    for (const text of ["Apex Ultima", "Asian Paints®", "Dulux™ Velvet Touch", "रंग 2 in 1", "18 mm BWP Ply"]) {
      expect(labelProblem(text)).toBeUndefined();
    }
  });

  it("rejects emojis, flags and keycaps", () => {
    for (const text of ["Diwali 🎉 sale", "Paint ❤️", "Made in 🇮🇳", "Pack 1️⃣"]) {
      expect(labelProblem(text)).toBe(TEXT_ERRORS.emoji);
    }
  });

  it("rejects hidden characters and line breaks", () => {
    for (const text of ["Apex\u200BUltima", "Apex\nUltima", "Apex\u202EUltima", "Apex\u0000"]) {
      expect(labelProblem(text)).toBe(TEXT_ERRORS.hidden);
    }
  });

  it("needs at least one letter", () => {
    expect(labelProblem("12345")).toBe(TEXT_ERRORS.letter);
    expect(labelProblem("--")).toBe(TEXT_ERRORS.letter);
    expect(labelProblem("")).toBeUndefined();
  });
});

describe("plainTextProblem", () => {
  it("allows digit-only text such as a quantity", () => {
    expect(plainTextProblem("20")).toBeUndefined();
    expect(plainTextProblem("20 L x 3")).toBeUndefined();
  });

  it("still rejects emojis and hidden characters", () => {
    expect(plainTextProblem("20 👍")).toBe(TEXT_ERRORS.emoji);
    expect(plainTextProblem("20\t")).toBe(TEXT_ERRORS.hidden);
  });
});

describe("personNameProblem", () => {
  it("accepts names in Latin and Indian scripts with dots, apostrophes and hyphens", () => {
    for (const text of ["Ramesh Patil", "R. K. D'Souza", "Anne-Marie", "रमेश पाटील", "  Shubham  "]) {
      expect(personNameProblem(text)).toBeUndefined();
    }
  });

  it("rejects digits, symbols and emojis", () => {
    expect(personNameProblem("12")).toBe(TEXT_ERRORS.letter);
    expect(personNameProblem("Ramesh2")).toBe(TEXT_ERRORS.personName);
    expect(personNameProblem("Ramesh@shop")).toBe(TEXT_ERRORS.personName);
    expect(personNameProblem("😀😀")).toBe(TEXT_ERRORS.emoji);
  });
});

describe("longTextProblem", () => {
  it("allows line breaks and emojis", () => {
    expect(longTextProblem("Need 20 L white 👍\nDelivery by Friday 👨‍👩‍👧")).toBeUndefined();
  });

  it("rejects hidden characters", () => {
    expect(longTextProblem("Need\u200B paint")).toBe(TEXT_ERRORS.hidden);
  });
});

describe("phone helpers", () => {
  it("recognises phone text", () => {
    expect(isPhoneText("+91 (987) 654-3210")).toBe(true);
    expect(isPhoneText("98765abc")).toBe(false);
    expect(isPhoneText("98765😀")).toBe(false);
  });

  it("filters typed characters", () => {
    expect(keepDigits("1,2a3😀")).toBe("123");
    expect(keepPhoneChars("+91 98a765-43😀210")).toBe("+91 98765-43210");
  });
});

describe("textRule", () => {
  it("turns a problem into a zod issue", () => {
    const schema = z.string().superRefine(textRule(labelProblem));
    expect(schema.safeParse("Apex").success).toBe(true);
    expect(schema.safeParse("Apex 🎉").error?.issues[0]?.message).toBe(TEXT_ERRORS.emoji);
  });
});
