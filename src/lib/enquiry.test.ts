import { describe, expect, it } from "vitest";
import {
  buildEnquiryMessage,
  normalisePhone,
  productEnquiryMessage,
  validateEnquiry,
  type EnquiryInput,
} from "@/lib/enquiry";

const valid: EnquiryInput = { name: "Ramesh Patil", phone: "9876543210", productId: "", quantity: "", message: "Need 20 L white" };

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

  it("rejects names made of digits, symbols or emojis", () => {
    expect(validateEnquiry({ ...valid, name: "12" }).name).toBe("Use at least one letter.");
    expect(validateEnquiry({ ...valid, name: "Ramesh99" }).name).toBe("Use letters only.");
    expect(validateEnquiry({ ...valid, name: "😀😀" }).name).toBe("Emojis aren't allowed here.");
  });

  it("rejects a phone number with letters or emojis instead of dropping them", () => {
    expect(validateEnquiry({ ...valid, phone: "98765abc43210" }).phone).toBe("Use digits only.");
    expect(validateEnquiry({ ...valid, phone: "9876543210😀" }).phone).toBe("Use digits only.");
    expect(validateEnquiry({ ...valid, phone: "+91 98765-43210" }).phone).toBeUndefined();
  });

  it("rejects emojis in the quantity but allows them in the details", () => {
    expect(validateEnquiry({ ...valid, quantity: "20 🪣" }).quantity).toBe("Emojis aren't allowed here.");
    expect(validateEnquiry({ ...valid, message: "Need 20 L white 👍" }).message).toBeUndefined();
    expect(validateEnquiry({ ...valid, message: "Need\u200B 20 L white" }).message).toBe(
      "Remove hidden characters or line breaks.",
    );
  });

  it("caps the name, quantity and details so a huge message can't be sent", () => {
    expect(
      validateEnquiry({ ...valid, name: "R".repeat(81), quantity: "2".repeat(41), message: "x".repeat(1001) }),
    ).toEqual({
      name: "Keep your name under 80 characters.",
      quantity: "Keep the quantity under 40 characters.",
      message: "Keep the details under 1000 characters.",
    });
  });

  it("requires a valid mobile number", () => {
    expect(validateEnquiry({ ...valid, phone: "" }).phone).toBe("Please enter your mobile number.");
    expect(validateEnquiry({ ...valid, phone: " - " }).phone).toBe("Please enter your mobile number.");
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
    expect(buildEnquiryMessage(valid)).not.toMatch(/Product:|Quantity:/);
  });
});
