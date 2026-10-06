import { getProductById, getProducts } from "@/services/catalog-service";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }));
}

export async function GET(_request: Request, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const product = await getProductById(id);
  if (!product) return Response.json({ message: "Product not found" }, { status: 404 });
  return Response.json(product);
}
