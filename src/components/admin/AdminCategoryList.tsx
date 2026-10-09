"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { FolderPlus, Layers, Package, Plus, Search, Tag, X } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import {
  saveCategoryAction,
  saveSubcategoryAction,
  toggleCategoryActiveAction,
  toggleSubcategoryActiveAction,
} from "@/server/actions/categories";
import type { AdminCategoryRecord, AdminSubcategoryRecord, CategoryInput, SubcategoryInput } from "@/types";

interface AdminCategoryListProps {
  categories: AdminCategoryRecord[];
}

export default function AdminCategoryList({ categories }: AdminCategoryListProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryRecord | null>(null);
  const [catForm, setCatForm] = useState<CategoryInput>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  // Subcategory Modal State
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<AdminSubcategoryRecord | null>(null);
  const [subForm, setSubForm] = useState<SubcategoryInput>({
    categoryId: categories[0]?.id || "",
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState("");

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const totalSubcategories = categories.reduce((sum, c) => sum + c.subcategories.length, 0);
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;

    return categories
      .map((cat) => {
        const catMatch =
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));

        const matchedSubs = cat.subcategories.filter(
          (sub) =>
            sub.name.toLowerCase().includes(q) ||
            sub.slug.toLowerCase().includes(q) ||
            (sub.description && sub.description.toLowerCase().includes(q)),
        );

        if (catMatch || matchedSubs.length > 0) {
          return {
            ...cat,
            subcategories: catMatch ? cat.subcategories : matchedSubs,
          };
        }
        return null;
      })
      .filter((c): c is AdminCategoryRecord => c !== null);
  }, [categories, query]);

  // Handle Category Add/Edit Modal
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatForm({ name: "", slug: "", tagline: "", description: "", sortOrder: categories.length + 1, isActive: true });
    setErrorMsg("");
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (cat: AdminCategoryRecord) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline || "",
      description: cat.description || "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setErrorMsg("");
    setCatModalOpen(true);
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    startTransition(async () => {
      const res = await saveCategoryAction(editingCategory?.id || null, catForm);
      if (res.ok) {
        setCatModalOpen(false);
      } else {
        setErrorMsg(res.message || "Failed to save category.");
      }
    });
  };

  // Handle Subcategory Add/Edit Modal
  const openAddSubcategoryModal = (categoryId?: string) => {
    setEditingSubcategory(null);
    setSubForm({
      categoryId: categoryId || categories[0]?.id || "",
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    });
    setErrorMsg("");
    setSubModalOpen(true);
  };

  const openEditSubcategoryModal = (sub: AdminSubcategoryRecord) => {
    setEditingSubcategory(sub);
    setSubForm({
      categoryId: sub.categoryId,
      name: sub.name,
      slug: sub.slug,
      description: sub.description || "",
      sortOrder: sub.sortOrder,
      isActive: sub.isActive,
    });
    setErrorMsg("");
    setSubModalOpen(true);
  };

  const handleSubcategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim()) {
      setErrorMsg("Subcategory name is required.");
      return;
    }
    if (!subForm.categoryId) {
      setErrorMsg("Parent category is required.");
      return;
    }

    startTransition(async () => {
      const res = await saveSubcategoryAction(editingSubcategory?.id || null, subForm);
      if (res.ok) {
        setSubModalOpen(false);
      } else {
        setErrorMsg(res.message || "Failed to save subcategory.");
      }
    });
  };

  const handleToggleCategory = (cat: AdminCategoryRecord, value: boolean) => {
    startTransition(async () => {
      await toggleCategoryActiveAction(cat.id, value);
    });
  };

  const handleToggleSubcategory = (sub: AdminSubcategoryRecord, value: boolean) => {
    startTransition(async () => {
      await toggleSubcategoryActiveAction(sub.id, value);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">Category Management</h1>
          <p className="mt-1 text-sm text-muted">
            Manage categories, subcategories, and view dynamic database product counts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="cta" onClick={openAddCategoryModal}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
          <Button variant="secondary" onClick={() => openAddSubcategoryModal()}>
            <FolderPlus className="h-4 w-4" /> Add Subcategory
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-card p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 text-accent-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase">Categories</p>
              <p className="text-xl font-bold text-heading">
                {totalCategories} <span className="text-xs font-normal text-muted">({activeCategories} active)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-line bg-card p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase">Subcategories</p>
              <p className="text-xl font-bold text-heading">{totalSubcategories}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-line bg-card p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-paint-50 text-paint-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase">Total Products</p>
              <p className="text-xl font-bold text-heading">{totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter categories or subcategories..."
          className={`${fieldClasses} pl-10`}
        />
      </div>

      {/* Category List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-8 text-center text-muted">
            No categories found matching &quot;{query}&quot;.
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`rounded-card border bg-card p-5 card-shadow transition ${
                category.isActive ? "border-line" : "border-line/60 bg-surface-muted/40 opacity-75"
              }`}
            >
              {/* Category Header Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-bold text-heading">{category.name}</h2>
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {category.productCount} {category.productCount === 1 ? "product" : "products"}
                      </span>
                      {!category.isActive && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    {category.tagline && <p className="mt-0.5 text-xs font-semibold text-accent-600">{category.tagline}</p>}
                    {category.description && <p className="mt-1 text-xs text-muted">{category.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ToggleSwitch
                    label={`${category.name} status`}
                    checked={category.isActive}
                    disabled={isPending}
                    onChange={(val) => handleToggleCategory(category, val)}
                  />
                  <Button variant="secondary" onClick={() => openEditCategoryModal(category)}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => openAddSubcategoryModal(category.id)}>
                    + Subcategory
                  </Button>
                </div>
              </div>

              {/* Subcategories List */}
              <div className="mt-4 pl-2 sm:pl-4">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Subcategories ({category.subcategories.length})
                </p>
                {category.subcategories.length === 0 ? (
                  <p className="text-xs text-muted italic">No subcategories under this category.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between rounded-xl border border-line p-3 text-xs transition ${
                          sub.isActive ? "bg-card" : "bg-surface-muted/50 text-muted"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-heading truncate">{sub.name}</p>
                          <p className="text-[11px] text-muted">
                            <span className="font-semibold text-accent-600">{sub.productCount}</span> products
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ToggleSwitch
                            label={`${sub.name} status`}
                            checked={sub.isActive}
                            disabled={isPending}
                            onChange={(val) => handleToggleSubcategory(sub, val)}
                          />
                          <button
                            type="button"
                            onClick={() => openEditSubcategoryModal(sub)}
                            className="rounded-lg border border-line px-2 py-1 font-semibold text-heading hover:bg-surface-muted"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Add/Edit Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-card border border-line bg-card p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-heading">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-300">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-3 text-sm">
              <FormField label="Category Name" htmlFor="cat-name" required>
                <input
                  id="cat-name"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. Paints & Wall Care"
                />
              </FormField>

              <FormField label="Slug (optional)" htmlFor="cat-slug" hint="Auto-generated if left empty">
                <input
                  id="cat-slug"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. paints"
                />
              </FormField>

              <FormField label="Tagline" htmlFor="cat-tagline">
                <input
                  id="cat-tagline"
                  value={catForm.tagline}
                  onChange={(e) => setCatForm({ ...catForm, tagline: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. Authorized Paints Dealer"
                />
              </FormField>

              <FormField label="Description" htmlFor="cat-desc">
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className={`${fieldClasses} resize-y`}
                  placeholder="Brief summary of category products"
                />
              </FormField>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-heading">
                  <input
                    type="checkbox"
                    checked={catForm.isActive}
                    onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-line text-accent-600 focus:ring-accent-500"
                  />
                  Active Category
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" onClick={() => setCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cta" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Add/Edit Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-card border border-line bg-card p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-heading">
                {editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-300">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSubcategorySubmit} className="space-y-3 text-sm">
              <FormField label="Parent Category" htmlFor="sub-catId" required>
                <SelectMenu
                  id="sub-catId"
                  label="Parent Category"
                  value={subForm.categoryId}
                  onChange={(val) => setSubForm({ ...subForm, categoryId: val })}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </FormField>

              <FormField label="Subcategory Name" htmlFor="sub-name" required>
                <input
                  id="sub-name"
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. Interior Emulsion"
                />
              </FormField>

              <FormField label="Slug (optional)" htmlFor="sub-slug" hint="Auto-generated if left empty">
                <input
                  id="sub-slug"
                  value={subForm.slug}
                  onChange={(e) => setSubForm({ ...subForm, slug: e.target.value })}
                  className={fieldClasses}
                  placeholder="e.g. interior-emulsion"
                />
              </FormField>

              <FormField label="Description" htmlFor="sub-desc">
                <textarea
                  id="sub-desc"
                  rows={2}
                  value={subForm.description}
                  onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  className={`${fieldClasses} resize-y`}
                  placeholder="Brief details about this subcategory"
                />
              </FormField>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-heading">
                  <input
                    type="checkbox"
                    checked={subForm.isActive}
                    onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-line text-accent-600 focus:ring-accent-500"
                  />
                  Active Subcategory
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="secondary" onClick={() => setSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cta" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Subcategory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
