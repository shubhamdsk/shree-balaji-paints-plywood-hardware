import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1`);

    return Response.json({ ok: true, status: "healthy" }, { status: 200 });
  } catch (error) {
    console.error("Database health check failed", error);
    return Response.json({ ok: false, status: "unhealthy" }, { status: 503 });
  }
}
