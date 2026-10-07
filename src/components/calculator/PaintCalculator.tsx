"use client";

import { useMemo, useState, type FormEvent } from "react";
import { MessageCircle, PaintRoller } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { whatsappLink } from "@/config/shop";
import { useConfirm } from "@/hooks/use-confirm";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  buildEstimateMessage,
  estimatePaint,
  formatPacks,
  validateRoom,
  type PaintEstimate,
  type RoomErrors,
  type RoomValues,
} from "@/lib/paint-calculator";

export interface CalculatorProduct {
  id: string;
  label: string;
  type: string;
  sizes: string[];
}

interface PaintCalculatorProps {
  products: CalculatorProduct[];
  initialProductId?: string;
}

type TextField = "length" | "width" | "height" | "doors" | "windows";

const sizeFields: { key: TextField; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
];

export default function PaintCalculator({ products, initialProductId = "" }: PaintCalculatorProps) {
  const initialValues = useMemo<RoomValues>(
    () => ({
      productId: initialProductId,
      unit: "ft",
      length: "",
      width: "",
      height: "10",
      doors: "1",
      windows: "1",
      coats: "2",
      includeCeiling: false,
    }),
    [initialProductId],
  );
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RoomErrors>({});
  const [estimate, setEstimate] = useState<PaintEstimate | null>(null);
  const confirm = useConfirm();

  const isDirty = (Object.keys(values) as (keyof RoomValues)[]).some((key) => values[key] !== initialValues[key]);
  useUnsavedChanges(isDirty);

  const product = products.find((p) => p.id === values.productId);

  const update = <K extends keyof RoomValues>(key: K, value: RoomValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setEstimate(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateRoom(values);
    setErrors(validationErrors);
    setEstimate(product && Object.keys(validationErrors).length === 0 ? estimatePaint(values, product) : null);
  };

  const handleSend = async () => {
    if (!estimate || !product) return;
    const confirmed = await confirm({
      title: "Send this estimate on WhatsApp?",
      message: "WhatsApp will open with your room size and estimate ready. Press Send there to ask the shop for a price.",
      confirmLabel: "Open WhatsApp",
    });
    if (!confirmed) return;
    window.open(whatsappLink(buildEstimateMessage(values, estimate, product.label)), "_blank", "noopener,noreferrer");
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: "Clear the calculator?",
      message: "The room sizes you entered will be removed.",
      confirmLabel: "Clear sizes",
      tone: "danger",
    });
    if (!confirmed) return;
    setValues(initialValues);
    setErrors({});
    setEstimate(null);
  };

  const describedBy = (key: keyof RoomValues) => (errors[key] ? `${key}-error` : undefined);

  const numberInput = (key: TextField, label: string, hint?: string) => (
    <FormField key={key} label={label} htmlFor={key} error={errors[key]} hint={hint}>
      <input
        id={key}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={describedBy(key)}
        className={fieldClasses}
      />
    </FormField>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-card border border-line bg-white p-5 card-shadow sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <FormField label="Paint" htmlFor="productId" error={errors.productId} required>
            <select
              id="productId"
              value={values.productId}
              onChange={(e) => update("productId", e.target.value)}
              aria-invalid={Boolean(errors.productId)}
              aria-describedby={describedBy("productId")}
              className={fieldClasses}
            >
              <option value="">Choose a paint</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.type})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Measure in" htmlFor="unit">
            <select
              id="unit"
              value={values.unit}
              onChange={(e) => update("unit", e.target.value === "m" ? "m" : "ft")}
              className={fieldClasses}
            >
              <option value="ft">Feet</option>
              <option value="m">Metres</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {sizeFields.map(({ key, label }) => numberInput(key, `${label} (${values.unit})`))}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {numberInput("doors", "Doors", "About 7 × 3 ft each")}
          {numberInput("windows", "Windows", "About 4 × 3 ft each")}
          <FormField label="Coats" htmlFor="coats" hint="2 coats for a new colour">
            <select id="coats" value={values.coats} onChange={(e) => update("coats", e.target.value)} className={fieldClasses}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </FormField>
        </div>

        <label className="flex items-center gap-3 text-sm font-bold text-brand-900">
          <input
            type="checkbox"
            checked={values.includeCeiling}
            onChange={(e) => update("includeCeiling", e.target.checked)}
            className="h-5 w-5 rounded border-line accent-accent-600"
          />
          Paint the ceiling too
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleClear} disabled={!isDirty}>
            Clear
          </Button>
          <Button type="submit">
            <PaintRoller className="h-4 w-4" />
            Calculate
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {estimate && product && (
          <section aria-labelledby="estimate-heading" className="rounded-card border border-paint-100 bg-accent-50 p-5 sm:p-8">
            <h2 id="estimate-heading" className="text-lg font-extrabold text-brand-900">
              You need about {estimate.litres} L of {product.label}
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-900">Area to paint</dt>
                <dd className="text-ink">About {estimate.areaSqft} sq ft</dd>
              </div>
              <div>
                <dt className="font-bold text-brand-900">Suggested packs</dt>
                <dd className="text-ink">{formatPacks(estimate.packs)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              This is an estimate. Wall condition, colour change and brand affect coverage, so the shop will confirm the final quantity.
            </p>
            <Button variant="whatsapp" onClick={handleSend} className="mt-5">
              <MessageCircle className="h-4 w-4" />
              Send estimate on WhatsApp
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
