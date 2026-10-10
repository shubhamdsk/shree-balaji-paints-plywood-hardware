import "server-only";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "@/server/db/schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "src/server/db/migrations");
const LOCAL_DATA_DIR = path.join(process.cwd(), ".data/pglite");

const MIGRATIONS_JOURNAL = path.join(MIGRATIONS_FOLDER, "meta/_journal.json");

const globalForDb = globalThis as typeof globalThis & {
  shopDatabase?: Promise<Database>;
  shopMigrations?: { journal: string; applied: Promise<void> };
  injectedDatabase?: boolean;
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
  globalForDb.injectedDatabase = true;
}

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export async function withTransaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
  const db = await getDb();
  const url = globalForDb.injectedDatabase ? undefined : process.env.DATABASE_URL;
  if (!url) return db.transaction(work);
  const [{ Pool }, { drizzle }] = await Promise.all([
    import("@neondatabase/serverless"),
    import("drizzle-orm/neon-serverless"),
  ]);
  // The HTTP driver can't run transactions, and Workers can't share a socket between requests,
  // so each transaction opens its own WebSocket connection and closes it before returning.
  const pool = new Pool({ connectionString: url });
  try {
    return await (drizzle({ client: pool, schema }) as unknown as Database).transaction(work);
  } finally {
    await pool.end();
  }
}

async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = await import("drizzle-orm/neon-http");
    // Cloudflare Workers can't reuse a socket opened by another request, so queries go over HTTP, one request each.
    return drizzle({ connection: url, schema }) as unknown as Database;
  }
  return createLocalDatabase(process.env.NODE_ENV === "development" ? LOCAL_DATA_DIR : undefined);
}

export async function createLocalDatabase(dataDir?: string): Promise<Database> {
  const [{ PGlite }, { drizzle }, { seedCatalog }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("@/server/db/seed"),
  ]);
  if (dataDir) await mkdir(dataDir, { recursive: true });
  const db = drizzle({ client: new PGlite(dataDir), schema }) as unknown as Database;
  await migrateLocalDatabase(db);
  await seedCatalog(db);
  return db;
}
