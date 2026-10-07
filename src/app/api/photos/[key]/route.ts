import { photoTypeFromKey } from "@/lib/photo";
import { readPhoto } from "@/server/storage/photos";

export async function GET(_request: Request, { params }: RouteContext<"/api/photos/[key]">) {
  const { key } = await params;
  const data = await readPhoto(key);
  if (!data) return Response.json({ error: "Photo not found" }, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": photoTypeFromKey(key),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
