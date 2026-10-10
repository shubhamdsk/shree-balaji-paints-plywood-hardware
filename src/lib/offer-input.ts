import { z } from "zod";
import { todayInIndia } from "@/lib/dates";

export interface OfferInput {
  title: string;
  body: string;
  startsOn: string;
  endsOn: string;
}

export type OfferField = keyof OfferInput | "photo";
export type OfferFieldErrors = Partial<Record<OfferField, string>>;
export type OfferStatus = "upcoming" | "live" | "ended";

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  upcoming: "Starts soon",
  live: "Live",
  ended: "Ended",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function offerStatus(offer: Pick<OfferInput, "startsOn" | "endsOn">, today = todayInIndia()): OfferStatus {
  if (today < offer.startsOn) return "upcoming";
  return today > offer.endsOn ? "ended" : "live";
}

export function formatOfferDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

function isRealDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readOfferForm(formData: FormData) {
  return {
    title: text(formData, "title"),
    body: text(formData, "body"),
    startsOn: text(formData, "startsOn"),
    endsOn: text(formData, "endsOn"),
  };
}

const offerInputSchema = z
  .strictObject({
    title: z.string().trim().min(2, "Enter the offer title").max(80, "Keep the title under 80 characters"),
    body: z.string().trim().min(2, "Describe the offer").max(300, "Keep the text under 300 characters"),
    startsOn: z.string().refine(isRealDate, "Choose the start date"),
    endsOn: z.string().refine(isRealDate, "Choose the end date"),
  })
  .superRefine((input, ctx) => {
    if (isRealDate(input.startsOn) && isRealDate(input.endsOn) && input.endsOn < input.startsOn) {
      ctx.addIssue({ code: "custom", path: ["endsOn"], message: "The end date must be on or after the start date" });
    }
  });

export function validateOfferInput(raw: unknown): { ok: true; input: OfferInput } | { ok: false; errors: OfferFieldErrors } {
  const result = offerInputSchema.safeParse(raw);
  if (result.success) return { ok: true, input: result.data };
  const errors: OfferFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as OfferField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
