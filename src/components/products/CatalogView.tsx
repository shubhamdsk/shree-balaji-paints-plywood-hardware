import ProductCatalog from "@/components/products/ProductCatalog";
import PageHeader from "@/components/ui/PageHeader";
import { ROUTES } from "@/lib/routes";
import { getCategoryGroups, getProducts } from "@/services/catalog-service";
import type { CategoryGroup } from "@/types";

const ALL_PRODUCTS_DESCRIPTION =
  "Genuine brands, fair local pricing. Filter by category or message us on WhatsApp for rates and availability.";

interface CatalogViewProps {
  group?: CategoryGroup;
  subtype?: string;
}

export default async function CatalogView({ group, subtype }: CatalogViewProps) {
  const [products, categoryGroups] = await Promise.all([getProducts(), getCategoryGroups()]);

  const parents = [
    ...(group ? [{ label: "Products", href: ROUTES.products }] : []),
    ...(group && subtype ? [{ label: group.name, href: ROUTES.category(group.id) }] : []),
  ];
  const title = subtype ?? group?.name ?? "Products";
  const description = group
    ? `${subtype ? `${subtype} ${group.name.toLowerCase()}` : group.name} from trusted brands at fair local prices. Ask on WhatsApp for rates and availability.`
    : ALL_PRODUCTS_DESCRIPTION;

  return (
    <div className="bg-surface">
      <PageHeader title={title} parents={parents} description={description} />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <ProductCatalog
          products={products}
          categoryGroups={categoryGroups}
          category={group?.id ?? "all"}
          subtype={subtype}
        />
      </section>
    </div>
  );
}
