import { and, desc, eq, ne } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { todayInIndia } from "@/lib/dates";
import { offerStatus, type OfferInput } from "@/lib/offer-input";
import { writeAudit } from "@/server/audit";
import { getDb, withTransaction } from "@/server/db/client";
import { offers, type OfferRow } from "@/server/db/schema";
import type { AdminUser, Offer } from "@/types";

function toOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    image: row.image ?? undefined,
    startsOn: row.startsOn,
    endsOn: row.endsOn,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function fields(input: OfferInput) {
  return { title: input.title.trim(), body: input.body.trim(), startsOn: input.startsOn, endsOn: input.endsOn };
}

const readAllOffers = unstable_cache(
  async (): Promise<Offer[]> => {
    try {
      const db = await getDb();
      const rows = await db.select().from(offers).orderBy(offers.startsOn, offers.createdAt);
      return rows.map(toOffer);
    } catch {
      return [];
    }
  },
  ["offers"],
  { tags: [CACHE_TAGS.offers] },
);

export async function getLiveOffers(today = todayInIndia()): Promise<Offer[]> {
  return (await readAllOffers()).filter((offer) => offerStatus(offer, today) === "live");
}

export async function getAdminOffers(): Promise<Offer[]> {
  const db = await getDb();
  const rows = await db.select().from(offers).orderBy(desc(offers.startsOn), desc(offers.createdAt));
  return rows.map(toOffer);
}

export async function getAdminOffer(id: string): Promise<Offer | null> {
  const db = await getDb();
  const [row] = await db.select().from(offers).where(eq(offers.id, id));
  return row ? toOffer(row) : null;
}

export async function createOffer(actor: AdminUser, input: OfferInput, image?: string): Promise<Offer> {
  return withTransaction(async (tx) => {
    const [row] = await tx
      .insert(offers)
      .values({ id: `offer-${crypto.randomUUID()}`, ...fields(input), image: image ?? null })
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "offer_create", entity: "offer", entityId: row.id, after: row });
    return toOffer(row);
  });
}

export async function updateOffer(
  actor: AdminUser,
  id: string,
  input: OfferInput,
  image?: string,
): Promise<{ offer: Offer; replacedImage?: string } | null> {
  return withTransaction(async (tx) => {
    const [before] = await tx.select().from(offers).where(eq(offers.id, id));
    if (!before) return null;
    const [after] = await tx
      .update(offers)
      .set({ ...fields(input), ...(image && { image }), updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "offer_update", entity: "offer", entityId: id, before, after });
    const replaced = image && before.image && before.image !== image ? before.image : undefined;
    return { offer: toOffer(after), replacedImage: replaced };
  });
}

export async function deleteOffer(actor: AdminUser, id: string): Promise<Offer | null> {
  return withTransaction(async (tx) => {
    const [before] = await tx.select().from(offers).where(eq(offers.id, id));
    if (!before) return null;
    await tx.delete(offers).where(eq(offers.id, id));
    await writeAudit(tx, { userId: actor.id, action: "offer_delete", entity: "offer", entityId: id, before });
    return toOffer(before);
  });
}

export async function isOfferImageShared(image: string, exceptId: string): Promise<boolean> {
  const db = await getDb();
  const [row] = await db
    .select({ id: offers.id })
    .from(offers)
    .where(and(eq(offers.image, image), ne(offers.id, exceptId)))
    .limit(1);
  return Boolean(row);
}
