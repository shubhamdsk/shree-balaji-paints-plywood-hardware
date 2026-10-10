"use client";

import { useTransition } from "react";
import AppLink from "@/components/ui/AppLink";
import { AlertTriangle } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import { setProductFlagAction } from "@/server/actions/products";
import type { AdminProduct } from "@/types";

export default function StockAlertList({ outOfStockProducts }: { outOfStockProducts: AdminProduct[] }) {
  const [isPending, startTransition] = useTransition();

  const toggleStock = (product: AdminProduct) => {
    startTransition(() => {
      void setProductFlagAction(product.id, "inStock", !product.inStock);
    });
  };

  if (outOfStockProducts.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-accent-600" aria-hidden />
        <h2 className="text-base font-bold text-heading">Out of stock ({outOfStockProducts.length})</h2>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {outOfStockProducts.slice(0, 5).map((product) => (
          <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 hover:bg-surface-muted">
            <div className="min-w-0">
              <p className="text-sm font-bold text-heading">{product.name}</p>
              <p className="text-xs font-semibold text-muted">
                {product.brand} · {product.category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggleStock(product)}
                aria-label={`Mark ${product.name} in stock`}
                className="rounded-lg border border-line bg-surface-muted px-3 py-1.5 text-xs font-bold text-heading transition hover:border-success hover:bg-success/10 hover:text-success disabled:opacity-50"
              >
                Mark in stock
              </button>
              <AppLink
                href={ROUTES.adminProduct(product.id)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-heading"
              >
                Edit
              </AppLink>
            </div>
          </div>
        ))}
      </div>
      {outOfStockProducts.length > 5 && (
        <p className="mt-3 text-center text-xs font-semibold text-muted">
          {outOfStockProducts.length - 5} more.{" "}
          <AppLink href={ROUTES.adminProducts} className="font-bold text-accent-600 hover:underline">
            See all products
          </AppLink>
        </p>
      )}
    </section>
  );
}
