import { getBrandNames, listStockedSubtypes } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { CategoryGroup, Product } from "@/types";

export function sitemapPaths(products: Product[], groups: CategoryGroup[]): string[] {
  return [
    ROUTES.home,
    ROUTES.products,
    ROUTES.brands,
    ROUTES.offers,
    ROUTES.about,
    ROUTES.contact,
    ROUTES.enquiry(),
    ROUTES.paintCalculator(),
    ...groups.map((g) => ROUTES.category(g.id)),
    ...listStockedSubtypes(products, groups).map(({ group, subtype }) => ROUTES.category(group.id, subtype)),
    ...getBrandNames(products).map((brand) => ROUTES.brand(brand)),
    ...products.map((p) => ROUTES.product(p.id)),
  ];
}
