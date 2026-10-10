"use client";

import { useRef, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { MessageCircle, Phone, Search, WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/config/shop";
import { ENQUIRY_LIMITS } from "@/lib/enquiry";
import { loadEnquiriesAction, updateEnquiryStatusAction } from "@/server/actions/enquiry";
import type { EnquiryCounts, EnquiryPage, EnquiryQuery, EnquiryRecord, EnquiryStatus, EnquiryStatusFilter } from "@/types";

interface AdminEnquiryListProps {
  initialPage: EnquiryPage;
  initialCounts: EnquiryCounts;
}

type StatusFilter = EnquiryStatusFilter;

const SEARCH_DELAY_MS = 300;

const STATUSES: { value: EnquiryStatus; label: string; badge: string; active: string }[] = [
  { value: "new", label: "New", badge: "bg-accent-50 text-accent-700 ring-accent-200", active: "bg-accent-600 text-white" },
  {
    value: "contacted",
    label: "Contacted",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    active: "bg-amber-600 text-white",
  },
  { value: "closed", label: "Closed", badge: "bg-green-50 text-green-800 ring-green-200", active: "bg-green-600 text-white" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [{ value: "all", label: "All" }, ...STATUSES];

export default function AdminEnquiryList({ initialPage, initialCounts }: AdminEnquiryListProps) {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(initialPage.items);
  const [next, setNext] = useState(initialPage.next);
  const [counts, setCounts] = useState(initialCounts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [, startTransition] = useTransition();
  const latestRequest = useRef(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const load = async (filter: EnquiryQuery, append = false) => {
    const request = ++latestRequest.current;
    setLoading(true);
    setError("");
    try {
      const page = await loadEnquiriesAction(filter);
      if (request !== latestRequest.current) return;
      if (!page) throw new Error("Invalid enquiry filter");
      setEnquiries((current) => (append ? [...current, ...page.items] : page.items));
      setNext(page.next);
    } catch {
      if (request === latestRequest.current) setError("Could not load enquiries. Please try again.");
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  const chooseStatus = (status: StatusFilter) => {
    clearTimeout(searchTimer.current);
    setStatusFilter(status);
    void load({ status, search: query });
  };

  const changeQuery = (search: string) => {
    setQuery(search);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => void load({ status: statusFilter, search }), SEARCH_DELAY_MS);
  };

  const loadMore = () => {
    if (next) void load({ status: statusFilter, search: query, after: next }, true);
  };

  const handleStatusChange = (item: EnquiryRecord, newStatus: EnquiryStatus, notes?: string) => {
    const { id, status: oldStatus } = item;
    setPendingId(id);
    setError("");
    startTransition(async () => {
      try {
        const res = await updateEnquiryStatusAction(id, newStatus, notes);
        if (res.ok) {
          const leavesView = statusFilter !== "all" && newStatus !== statusFilter;
          setEnquiries((current) =>
            leavesView
              ? current.filter((entry) => entry.id !== id)
              : current.map((entry) =>
                  entry.id === id ? { ...entry, status: newStatus, ...(notes !== undefined && { notes }) } : entry,
                ),
          );
          if (newStatus !== oldStatus) {
            setCounts((current) => ({ ...current, [oldStatus]: current[oldStatus] - 1, [newStatus]: current[newStatus] + 1 }));
          }
        } else {
          setError(res.message || "Failed to update enquiry status.");
        }
      } catch {
        setError("Failed to update enquiry status. Please try again.");
      } finally {
        setPendingId(null);
        setEditingNotesId(null);
      }
    });
  };

  const handleSaveNotes = (item: EnquiryRecord) => {
    handleStatusChange(item, item.status, noteInput);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <FormField label="Search enquiries" htmlFor="enquiry-search">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="enquiry-search"
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Name, phone, product or message text"
              className={`${fieldClasses} pl-9`}
            />
          </div>
        </FormField>
        <div role="group" aria-label="Show" className="flex flex-wrap items-end gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={statusFilter === f.value}
              onClick={() => chooseStatus(f.value)}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold transition ${
                statusFilter === f.value ? "bg-heading text-card" : "border border-line bg-card text-heading hover:bg-surface-muted"
              }`}
            >
              {f.label} <span className="font-extrabold">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {error}
        </p>
      )}

      {/* Enquiry List */}
      {enquiries.length === 0 && !loading ? (
        <div className="rounded-card border border-dashed border-line bg-card p-10 text-center text-muted">
          <MessageCircle aria-hidden className="mx-auto mb-3 h-8 w-8 text-subtle" />
          No enquiries here.
        </div>
      ) : (
        <ul className="grid gap-4">
          {enquiries.map((item) => {
            const isPending = pendingId === item.id;
            const isEditingNotes = editingNotesId === item.id;
            const formattedDate = new Date(item.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <li
                key={item.id}
                className="rounded-card border border-line bg-card p-5 shadow-card transition hover:border-brand-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-heading">{item.name}</h2>
                      {STATUSES.filter((s) => s.value === item.status).map((s) => (
                        <span key={s.value} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${s.badge}`}>
                          {s.label}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted">{formattedDate}</p>
                  </div>

                  {/* Actions for contacting customer */}
                  <div className="flex items-center gap-2">
                    {item.phone && (
                      <>
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-muted px-3 text-xs font-bold text-heading hover:bg-card"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call {item.phone}
                        </a>
                        <a
                          href={whatsappLink(`Hello ${item.name}, regarding your enquiry: "${item.message.slice(0, 40)}..."`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-whatsapp-strong px-3 text-xs font-bold text-white shadow-xs hover:opacity-90"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    {item.productName && (
                      <p className="text-sm font-semibold text-heading">
                        <span className="text-muted">Product:</span> {item.productName}
                        {item.quantity && <span className="ml-2 font-normal text-muted">({item.quantity})</span>}
                      </p>
                    )}
                    <p className="rounded-xl bg-surface-muted p-3 text-sm text-ink">{item.message}</p>

                    {/* Owner Notes */}
                    {item.notes && !isEditingNotes && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900">
                        <span className="font-bold">Note:</span> {item.notes}
                      </div>
                    )}

                    {isEditingNotes && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={2}
                          aria-label="Owner note"
                          maxLength={ENQUIRY_LIMITS.notes}
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Only you can see this note"
                          className={`${fieldClasses} text-xs`}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(item)}
                            disabled={isPending}
                            className="rounded-lg bg-heading px-3 py-1 text-xs font-bold text-card"
                          >
                            Save note
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="rounded-lg border border-line px-3 py-1 text-xs font-bold text-heading"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Controls */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-xs font-bold text-muted">Mark as</span>
                    <div role="group" aria-label={`Status of ${item.name}`} className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          disabled={isPending || item.status === s.value}
                          onClick={() => handleStatusChange(item, s.value)}
                          className={`min-h-9 rounded-lg px-2.5 text-xs font-bold transition ${
                            item.status === s.value ? s.active : "border border-line bg-card text-muted hover:bg-surface-muted"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {!isEditingNotes && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNoteInput(item.notes ?? "");
                        }}
                        className="mt-1 text-xs font-semibold text-accent-600 hover:underline"
                      >
                        {item.notes ? "Edit note" : "+ Add note"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {next && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more enquiries"}
          </Button>
        </div>
      )}
    </div>
  );
}
