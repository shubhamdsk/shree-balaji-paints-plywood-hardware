import { getCategoryGroups } from "@/services/catalog-service";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(await getCategoryGroups());
}
