import { describe, expect, it } from "vitest";
import {
  buildEnquiryMessage,
  normalisePhone,
  productEnquiryMessage,
  validateEnquiry,
  type EnquiryInput,
} from "@/lib/enquiry";

const valid: EnquiryInput = { name: "Ramesh Patil", phone: "", productId: "", quantity: "", message: "Need 20 L white" };

describe("normalisePhone", () => {
  it("strips spaces, symbols and the +91 prefix", () => {
    expect(normalisePhone("+91 98765 43210")).toBe("9876543210");
    expect(normalisePhone("98765-43210")).toBe("9876543210");
  });

  it("keeps a plain 10-digit number unchanged", () => {
    expect(normalisePhone("9876543210")).toBe("9876543210");
  });
});

describe("validateEnquiry", () => {
  it("accepts a complete enquiry", () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it("requires a name of at least two characters", () => {
    expect(validateEnquiry({ ...valid, name: " A " }).name).toBeDefined();
  });

  it("accepts an empty phone but rejects an invalid one", () => {
    expect(validateEnquiry({ ...valid, phone: "" }).phone).toBeUndefined();
    expect(validateEnquiry({ ...valid, phone: "12345" }).phone).toBeDefined();
    expect(validateEnquiry({ ...valid, phone: "5876543210" }).phone).toBeDefined();
    expect(validateEnquiry({ ...valid, phone: "+91 98765 43210" }).phone).toBeUndefined();
  });

  it("needs either a product or a message", () => {
    expect(validateEnquiry({ ...valid, message: "" }).message).toBeDefined();
    expect(validateEnquiry({ ...valid, message: "", productId: "ap-royale-luxury" }).message).toBeUndefined();
  });
});

describe("productEnquiryMessage", () => {
  it("names the product and asks for the latest price and availability", () => {
    expect(productEnquiryMessage("Asian Paints Royale Luxury Emulsion").split("\n")).toEqual([
      "Hi, I'm interested in:",
      "",
      "Product: Asian Paints Royale Luxury Emulsion",
      "",
      "Can you please share the latest price and availability?",
    ]);
  });

  it("adds the chosen size when there is one", () => {
    expect(productEnquiryMessage("Asian Paints Royale Luxury Emulsion", "4 L")).toContain("\nSize: 4 L\n");
  });
});

describe("buildEnquiryMessage", () => {
  it("includes only the fields that were filled in", () => {
    const message = buildEnquiryMessage({ ...valid, phone: "+91 98765 43210", quantity: " 2 x 20 L " }, "Asian Paints Royale");
    expect(message.split("\n")).toEqual([
      "Hello Shree Balaji, I have an enquiry.",
      "Name: Ramesh Patil",
      "Phone: 9876543210",
      "Product: Asian Paints Royale",
      "Quantity: 2 x 20 L",
      "Details: Need 20 L white",
    ]);
  });

  it("leaves out empty optional lines", () => {
    expect(buildEnquiryMessage(valid)).not.toMatch(/Phone:|Product:|Quantity:/);
  });
});
