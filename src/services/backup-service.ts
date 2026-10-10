import { DAY_MS, todayInIndia } from "@/lib/dates";
import { getDb } from "@/server/db/client";
import { categories, enquiries, gallery, offers, products, subcategories } from "@/server/db/schema";
import { deleteBackup, saveBackup } from "@/server/storage/photos";

export const BACKUP_KEEP_DAYS = 30;

export async function createDailyBackup(now = new Date()) {
  const db = await getDb();
  const [categoryRows, subcategoryRows, productRows, offerRows, galleryRows, enquiryRows] = await Promise.all([
    db.select().from(categories),
    db.select().from(subcategories),
    db.select().from(products),
    db.select().from(offers),
    db.select().from(gallery),
    db.select().from(enquiries),
  ]);
  const tables = {
    categories: categoryRows,
    subcategories: subcategoryRows,
    products: productRows,
    offers: offerRows,
    gallery: galleryRows,
    enquiries: enquiryRows,
  };

  const date = todayInIndia(now);
  await saveBackup(date, JSON.stringify({ createdAt: now.toISOString(), tables }));
  await deleteBackup(todayInIndia(new Date(now.getTime() - BACKUP_KEEP_DAYS * DAY_MS)));

  const rows = Object.fromEntries(Object.entries(tables).map(([name, list]) => [name, list.length]));
  return { date, rows };
}
