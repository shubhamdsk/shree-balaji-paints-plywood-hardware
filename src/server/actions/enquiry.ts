"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { validateEnquiry, type EnquiryInput } from "@/lib/enquiry";
import { requireOwner } from "@/server/auth/guard";
import { createCustomerEnquiry, updateEnquiryStatus } from "@/services/enquiry-service";
import type { EnquiryStatus } from "@/types";

const statusSchema = z.strictObject({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "closed"]),
  notes: z.string().optional(),
});

export async function submitEnquiryAction(input: EnquiryInput) {
  const errors = validateEnquiry(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  try {
    const record = await createCustomerEnquiry(input);
    updateTag(CACHE_TAGS.enquiries);
    return { ok: true, id: record.id };
  } catch (err) {
    console.error("submitEnquiryAction error:", err);
    return { ok: false, message: "Could not save your enquiry right now. Please try again." };
  }
}

export async function updateEnquiryStatusAction(id: string, status: EnquiryStatus, notes?: string) {
  const owner = await requireOwner();
  const parsed = statusSchema.safeParse({ id, status, notes });
  if (!parsed.success) return { ok: false, message: "Invalid parameters." };

  const updated = await updateEnquiryStatus(owner, parsed.data.id, parsed.data.status, parsed.data.notes);
  if (!updated) return { ok: false, message: "Enquiry not found." };

  updateTag(CACHE_TAGS.enquiries);
  return { ok: true };
}
