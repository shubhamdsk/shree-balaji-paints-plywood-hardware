"use client";

import { useTransition } from "react";
import AppLink from "@/components/ui/AppLink";
import { AlertTriangle, CheckCircle2 } from "@/components/ui/icons";
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

  if (outOfStockProducts.length === 0) {
    return (
      <div className="rounded-card border border-line bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 text-success">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-heading">100% Stock Availability!</h3>
            <p className="text-xs font-semibold text-muted">All items in your catalog are currently marked in stock.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent-600" />
            <h3 className="text-base font-bold text-heading">Out of Stock Items ({outOfStockProducts.length})</h3>
          </div>
          <p className="text-xs font-semibold text-muted">Products currently marked unavailable for customers</p>
        </div>
        <AppLink
          href={ROUTES.adminProducts}
          className="text-xs font-bold text-accent-600 hover:text-accent-700 hover:underline"
        >
          Manage all products →
        </AppLink>
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
                className="rounded-lg border border-line bg-surface-muted px-3 py-1.5 text-xs font-bold text-heading transition hover:border-success hover:bg-success/10 hover:text-success disabled:opacity-50"
              >
                Mark In Stock
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
          + {outOfStockProducts.length - 5} more items marked out of stock.{" "}
          <AppLink href={ROUTES.adminProducts} className="text-accent-600 font-bold hover:underline">
            View full list
          </AppLink>
        </p>
      )}
    </div>
  );
}
