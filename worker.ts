import { default as handler } from "./.open-next/worker.js";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { BACKUP_TOKEN_HEADER, DAILY_BACKUP_CRON, backupToken } from "@/lib/backup-token";

export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

async function runDailyBackup(env: CloudflareEnv, ctx: ExecutionContext) {
  const secret = (env as unknown as { SESSION_SECRET?: string }).SESSION_SECRET ?? "";
  const request = new Request(`https://worker.internal${API_ENDPOINTS.backup}`, {
    method: "POST",
    headers: { [BACKUP_TOKEN_HEADER]: await backupToken(secret) },
  });
  const response = await handler.fetch(request, env, ctx);
  if (!response.ok) console.error(`Daily backup failed with status ${response.status}`);
}

export default {
  fetch: handler.fetch,
  scheduled(event: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    if (event.cron === DAILY_BACKUP_CRON) ctx.waitUntil(runDailyBackup(env, ctx));
  },
} satisfies ExportedHandler<CloudflareEnv>;
