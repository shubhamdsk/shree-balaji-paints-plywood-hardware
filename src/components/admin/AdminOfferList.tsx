"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Plus, Trash2 } from "@/components/ui/icons";
import { useConfirm } from "@/hooks/use-confirm";
import { formatOfferDate, OFFER_STATUS_LABELS, offerStatus, type OfferStatus } from "@/lib/offer-input";
import { ROUTES } from "@/lib/routes";
import { deleteOfferAction } from "@/server/actions/offers";
import type { Offer } from "@/types";

const STATUS_CLASSES: Record<OfferStatus, string> = {
  live: "bg-success/15 text-success",
  upcoming: "bg-gold-100 text-heading",
  ended: "bg-surface-muted text-muted",
};

interface AdminOfferListProps {
  offers: Offer[];
  today: string;
}

export default function AdminOfferList({ offers: initialOffers, today }: AdminOfferListProps) {
  const [offers, setOffers] = useState(initialOffers);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  const handleDelete = async (offer: Offer) => {
    const confirmed = await confirm({
      title: `Delete "${offer.title}"?`,
      message: "The offer is removed from the website and the owner panel. This can't be undone.",
      confirmLabel: "Delete offer",
      tone: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deleteOfferAction(offer.id);
      if (result.ok) {
        setOffers((current) => current.filter((o) => o.id !== offer.id));
        setError("");
      } else {
        setError("This offer couldn't be deleted. Refresh the page and try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Offers</h1>
          <p className="mt-1 text-muted">Each offer shows on the home page and the offers page only between its dates.</p>
        </div>
        <AppLink href={ROUTES.adminNewOffer} className={buttonClasses("primary")}>
          <Plus aria-hidden className="h-4 w-4" /> Add offer
        </AppLink>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {error}
        </p>
      )}

      {offers.length === 0 ? (
        <p className="rounded-card border border-line bg-card p-10 text-center text-muted">
          No offers yet. Add one for the next festival or a seasonal sale.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => {
            const status = offerStatus(offer, today);
            return (
              <li key={offer.id} className="flex gap-4 rounded-card border border-line bg-card p-4 shadow-card">
                {offer.image && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                    <Image src={offer.image} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-heading">{offer.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CLASSES[status]}`}>
                      {OFFER_STATUS_LABELS[status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {formatOfferDate(offer.startsOn)} to {formatOfferDate(offer.endsOn)}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <AppLink href={ROUTES.adminOffer(offer.id)} aria-label={`Edit ${offer.title}`} className={buttonClasses("secondary")}>
                      Edit
                    </AppLink>
                    <AppLink href={ROUTES.adminCopyOffer(offer.id)} aria-label={`Copy ${offer.title}`} className={buttonClasses("secondary")}>
                      Copy
                    </AppLink>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer)}
                      aria-label={`Delete ${offer.title}`}
                      disabled={isPending}
                      className={buttonClasses("secondary")}
                    >
                      <Trash2 aria-hidden className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
