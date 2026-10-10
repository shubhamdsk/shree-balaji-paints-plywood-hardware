"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { validateEnquiry, type EnquiryInput } from "@/lib/enquiry";
import { requireOwner } from "@/server/auth/guard";
import { keyedHash } from "@/server/auth/session-token";
import {
  createCustomerEnquiry,
  isEnquiryLimitReached,
  listAdminEnquiries,
  updateEnquiryStatus,
} from "@/services/enquiry-service";
import type { EnquiryPage, EnquiryQuery, EnquiryStatus } from "@/types";

const statusSchema = z.strictObject({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "closed"]),
  notes: z.string().optional(),
});

const querySchema = z.strictObject({
  status: z.enum(["all", "new", "contacted", "closed"]).optional(),
  search: z.string().max(100).optional(),
  after: z.strictObject({ createdAt: z.iso.datetime(), id: z.string().min(1).max(100) }).optional(),
});

async function clientHash() {
  const address = (await headers()).get("cf-connecting-ip");
  return address ? keyedHash(`enquiry-client:${address}`) : null;
}

export async function submitEnquiryAction(input: EnquiryInput, website = "") {
  const errors = validateEnquiry(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  if (website) return { ok: true };

  try {
    const client = await clientHash();
    if (await isEnquiryLimitReached(client)) {
      return { ok: false, message: "We have received several enquiries from you. Please call or WhatsApp the shop instead." };
    }
    const record = await createCustomerEnquiry(input, client);
    return { ok: true, id: record.id };
  } catch (err) {
    console.error("submitEnquiryAction error:", err);
    return { ok: false, message: "Could not save your enquiry right now. Please try again." };
  }
}

export async function loadEnquiriesAction(query: EnquiryQuery): Promise<EnquiryPage | null> {
  await requireOwner();
  const parsed = querySchema.safeParse(query);
  return parsed.success ? listAdminEnquiries(parsed.data) : null;
}

export async function updateEnquiryStatusAction(id: string, status: EnquiryStatus, notes?: string) {
  const owner = await requireOwner();
  const parsed = statusSchema.safeParse({ id, status, notes });
  if (!parsed.success) return { ok: false, message: "Invalid parameters." };

  const updated = await updateEnquiryStatus(owner, parsed.data.id, parsed.data.status, parsed.data.notes);
  if (!updated) return { ok: false, message: "Enquiry not found." };

  return { ok: true };
}
