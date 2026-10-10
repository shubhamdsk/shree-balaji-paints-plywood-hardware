import { default as handler } from "./.open-next/worker.js";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,
  scheduled(_event: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(handler.fetch(new Request(`https://worker.internal${API_ENDPOINTS.health}`), env, ctx));
  },
} satisfies ExportedHandler<CloudflareEnv>;
