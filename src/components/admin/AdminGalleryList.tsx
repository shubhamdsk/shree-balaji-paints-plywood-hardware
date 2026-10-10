"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Trash2, X } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { useConfirm } from "@/hooks/use-confirm";
import {
  deleteGalleryItemAction,
  saveGalleryItemAction,
  toggleGalleryActiveAction,
} from "@/server/actions/gallery";
import type { GalleryItem } from "@/types";

const categoryOptions = [
  { value: "Painting Works", label: "Painting Works" },
  { value: "Plywood & Interior", label: "Plywood & Interior" },
  { value: "Laminates & Finish", label: "Laminates & Finish" },
  { value: "Hardware & Fittings", label: "Hardware & Fittings" },
  { value: "General Work", label: "General Work" },
];

interface AdminGalleryListProps {
  initialItems: GalleryItem[];
}

export default function AdminGalleryList({ initialItems }: AdminGalleryListProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const confirm = useConfirm();

  const [form, setForm] = useState({
    title: "",
    category: "Painting Works",
    caption: "",
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ title: "", category: "Painting Works", caption: "" });
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      caption: item.caption || "",
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleToggle = (item: GalleryItem, value: boolean) => {
    startTransition(async () => {
      const res = await toggleGalleryActiveAction(item.id, value);
      if (res.ok) {
        setItems((current) =>
          current.map((i) => (i.id === item.id ? { ...i, isActive: value } : i)),
        );
      }
    });
  };

  const handleDelete = async (item: GalleryItem) => {
    const confirmed = await confirm({
      title: `Delete "${item.title}"?`,
      message: "This work photo will be permanently removed from the website.",
      confirmLabel: "Delete Photo",
      tone: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteGalleryItemAction(item.id);
      if (res.ok) {
        setItems((current) => current.filter((i) => i.id !== item.id));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">Our Work Gallery Management</h1>
          <p className="mt-1 text-sm text-muted">
            Upload and manage photos of finished local projects to showcase on the website.
          </p>
        </div>
        <Button variant="cta" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Upload Work Photo
        </Button>
      </div>

      {/* Gallery Cards Grid */}
      {items.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-12 text-center text-muted">
          No work photos uploaded yet. Click &quot;Upload Work Photo&quot; above to add your first project photo!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-card border bg-card card-shadow transition ${
                item.isActive ? "border-line" : "border-line/60 bg-surface-muted/40 opacity-75"
              }`}
            >
              <div className="relative aspect-4/3 w-full bg-surface-muted">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-bold text-heading shadow-xs">
                  {item.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-heading text-base leading-snug">{item.title}</h3>
                  {item.caption && <p className="mt-1 text-xs text-muted line-clamp-2">{item.caption}</p>}
                </div>

                <div className="flex items-center justify-between border-t border-line pt-3">
                  <ToggleSwitch
                    label={`${item.title} status`}
                    checked={item.isActive}
                    disabled={isPending}
                    onChange={(val) => handleToggle(item, val)}
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-heading hover:bg-surface-muted"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-card border border-line bg-card p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-heading">
                {editingItem ? "Edit Work Photo" : "Upload Work Photo"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-muted hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-300">
                {errorMsg}
              </p>
            )}

            <form
              action={async (formData) => {
                startTransition(async () => {
                  const res = await saveGalleryItemAction(editingItem?.id || null, {}, formData);
                  if (res.errors || res.message) {
                    setErrorMsg(res.message || "Validation failed.");
                  } else {
                    setModalOpen(false);
                  }
                });
              }}
              className="space-y-4 text-sm"
            >
              <FormField label="Project Title" htmlFor="title" required>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. Living Room Wall Painting at Kotul"
                />
              </FormField>

              <FormField label="Category" htmlFor="category" required>
                <SelectMenu
                  id="category"
                  label="Category"
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  options={categoryOptions}
                />
                <input type="hidden" name="category" value={form.category} />
              </FormField>

              <FormField label="Caption / Description" htmlFor="caption">
                <textarea
                  id="caption"
                  name="caption"
                  rows={3}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className={`${fieldClasses} resize-y`}
                  placeholder="Details about products used, finish quality or customer requirements"
                />
              </FormField>

              <FormField label={editingItem ? "Replace Photo (optional)" : "Upload Photo"} htmlFor="photo">
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={fieldClasses}
                />
              </FormField>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cta" disabled={isPending}>
                  {isPending ? "Uploading..." : "Save Work Photo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
