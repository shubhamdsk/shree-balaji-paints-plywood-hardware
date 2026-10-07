import "server-only";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "@/server/db/schema";
import { seedCatalog } from "@/server/db/seed";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "src/server/db/migrations");
const LOCAL_DATA_DIR = path.join(process.cwd(), ".data/pglite");

const MIGRATIONS_JOURNAL = path.join(MIGRATIONS_FOLDER, "meta/_journal.json");

const globalForDb = globalThis as typeof globalThis & {
  shopDatabase?: Promise<Database>;
  shopMigrations?: { journal: string; applied: Promise<void> };
};

export async function getDb(): Promise<Database> {
  globalForDb.shopDatabase ??= connect().catch((error: unknown) => {
    globalForDb.shopDatabase = undefined;
    throw error;
  });
  const db = await globalForDb.shopDatabase;
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) await migrateDevDatabase(db);
  return db;
}

// The dev server keeps its database open across hot reloads, so migrations added while it runs are applied here.
async function migrateDevDatabase(db: Database) {
  const journal = await readFile(MIGRATIONS_JOURNAL, "utf8");
  if (globalForDb.shopMigrations?.journal !== journal) {
    const applied = migrateLocalDatabase(db).catch((error: unknown) => {
      globalForDb.shopMigrations = undefined;
      throw error;
    });
    globalForDb.shopMigrations = { journal, applied };
  }
  await globalForDb.shopMigrations?.applied;
}

async function migrateLocalDatabase(db: Database) {
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db as unknown as PgliteDatabase<typeof schema>, { migrationsFolder: MIGRATIONS_FOLDER });
}

export function setDatabase(db: Database) {
  globalForDb.shopDatabase = Promise.resolve(db);
}

async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    // Serverless functions each hold their own pool, so keep it small for Neon's connection limit.
    return drizzle({ connection: { connectionString: url, max: 3 }, schema }) as unknown as Database;
  }
  return createLocalDatabase(process.env.NODE_ENV === "development" ? LOCAL_DATA_DIR : undefined);
}

export async function createLocalDatabase(dataDir?: string): Promise<Database> {
  const [{ PGlite }, { drizzle }] = await Promise.all([import("@electric-sql/pglite"), import("drizzle-orm/pglite")]);
  if (dataDir) await mkdir(dataDir, { recursive: true });
  const db = drizzle({ client: new PGlite(dataDir), schema }) as unknown as Database;
  await migrateLocalDatabase(db);
  await seedCatalog(db);
  return db;
}
