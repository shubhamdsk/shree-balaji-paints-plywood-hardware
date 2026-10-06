import { shop } from "@/config/shop";

export interface EnquiryInput {
  name: string;
  phone: string;
  productId: string;
  quantity: string;
  message: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export function normalisePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function validateEnquiry(input: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (input.name.trim().length < 2) errors.name = "Please enter your name.";
  const phone = normalisePhone(input.phone);
  if (phone && !INDIAN_MOBILE.test(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!input.productId && input.message.trim().length < 5) {
    errors.message = "Tell us what you need, or choose a product above.";
  }
  return errors;
}

export function buildEnquiryMessage(input: EnquiryInput, productLabel?: string) {
  const phone = normalisePhone(input.phone);
  return [
    `Hello ${shop.shortName}, I have an enquiry.`,
    `Name: ${input.name.trim()}`,
    phone && `Phone: ${phone}`,
    productLabel && `Product: ${productLabel}`,
    input.quantity.trim() && `Quantity: ${input.quantity.trim()}`,
    input.message.trim() && `Details: ${input.message.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}
