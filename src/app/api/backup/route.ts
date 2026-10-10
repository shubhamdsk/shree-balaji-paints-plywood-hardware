import { timingSafeEqual } from "node:crypto";
import { BACKUP_TOKEN_HEADER, backupToken } from "@/lib/backup-token";
import { createDailyBackup } from "@/services/backup-service";

export const dynamic = "force-dynamic";

async function isAuthorised(request: Request) {
  const secret = process.env.SESSION_SECRET;
  const given = request.headers.get(BACKUP_TOKEN_HEADER);
  if (!secret || !given) return false;
  const expected = Buffer.from(await backupToken(secret));
  const received = Buffer.from(given);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  if (!(await isAuthorised(request))) return Response.json({ ok: false }, { status: 401 });
  try {
    return Response.json({ ok: true, ...(await createDailyBackup()) });
  } catch (error) {
    console.error("Daily backup failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
