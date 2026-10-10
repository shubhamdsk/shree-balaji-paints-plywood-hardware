import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import { seedCatalog } from "@/server/db/seed";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    if (process.env.WORKERS_CI === "1") {
      console.error("DATABASE_URL is not set in the Cloudflare build variables.");
      process.exit(1);
    }
    console.log("DATABASE_URL is not set: skipping migrations (the app uses the local in-process database).");
    return;
  }

  const db = drizzle({ connection: { connectionString: url, max: 1 }, schema });
  await migrate(db, { migrationsFolder: "src/server/db/migrations" });
  console.log("Migrations applied.");
  if (await seedCatalog(db as unknown as Database)) console.log("Empty catalogue tables seeded with the demo data.");
  await db.$client.end();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
