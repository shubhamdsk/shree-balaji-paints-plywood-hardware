import { shop } from "@/config/shop";
import { isPhoneText, longTextProblem, personNameProblem, plainTextProblem } from "@/lib/text-rules";

export interface EnquiryInput {
  name: string;
  phone: string;
  productId: string;
  quantity: string;
  message: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
export const ENQUIRY_LIMITS = { name: 80, phone: 16, quantity: 40, message: 1000, notes: 500 } as const;

export function normalisePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function validateEnquiry(input: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = input.name.trim();
  const nameProblem = personNameProblem(name);
  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > ENQUIRY_LIMITS.name) errors.name = `Keep your name under ${ENQUIRY_LIMITS.name} characters.`;
  else if (nameProblem) errors.name = `${nameProblem}.`;
  const phone = normalisePhone(input.phone);
  if (!isPhoneText(input.phone)) errors.phone = "Use digits only.";
  else if (phone && !INDIAN_MOBILE.test(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  const quantity = input.quantity.trim();
  const quantityProblem = plainTextProblem(quantity);
  if (quantity.length > ENQUIRY_LIMITS.quantity) {
    errors.quantity = `Keep the quantity under ${ENQUIRY_LIMITS.quantity} characters.`;
  } else if (quantityProblem) {
    errors.quantity = `${quantityProblem}.`;
  }
  const message = input.message.trim();
  const messageProblem = longTextProblem(message);
  if (!input.productId && message.length < 5) {
    errors.message = "Tell us what you need, or choose a product above.";
  } else if (message.length > ENQUIRY_LIMITS.message) {
    errors.message = `Keep the details under ${ENQUIRY_LIMITS.message} characters.`;
  } else if (messageProblem) {
    errors.message = `${messageProblem}.`;
  }
  return errors;
}

export function productEnquiryMessage(productLabel: string, size?: string) {
  return [
    "Hi, I'm interested in:",
    "",
    `Product: ${productLabel}`,
    ...(size ? [`Size: ${size}`] : []),
    "",
    "Can you please share the latest price and availability?",
  ].join("\n");
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
