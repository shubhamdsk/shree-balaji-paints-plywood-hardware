"use client";

import { useMemo, useState, type FormEvent } from "react";
import { PaintRoller, WhatsAppIcon } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { whatsappLink } from "@/config/shop";
import { useConfirm } from "@/hooks/use-confirm";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  buildEstimateMessage,
  estimatePaint,
  formatPacks,
  validateRoom,
  ROOM_PRESETS,
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

const UNIT_OPTIONS = [
  { value: "ft", label: "Feet" },
  { value: "m", label: "Metres" },
];

const COAT_OPTIONS = ["1", "2", "3"].map((coats) => ({ value: coats, label: coats }));

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
  const paintOptions = useMemo(
    () => [
      { value: "", label: "Choose a paint" },
      ...products.map((p) => ({ value: p.id, label: `${p.label} (${p.type})` })),
    ],
    [products],
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

  const handleApplyPreset = (preset: (typeof ROOM_PRESETS)[0]) => {
    const factor = values.unit === "m" ? 0.3048 : 1;
    setValues((current) => ({
      ...current,
      length: String(Math.round(preset.length * factor * 10) / 10),
      width: String(Math.round(preset.width * factor * 10) / 10),
      height: String(Math.round(preset.height * factor * 10) / 10),
    }));
    setErrors((current) => ({ ...current, length: undefined, width: undefined, height: undefined }));
    setEstimate(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateRoom(values);
    setErrors(validationErrors);
    setEstimate(product && Object.keys(validationErrors).length === 0 ? estimatePaint(values, product) : null);
  };

  const handleSend = () => {
    if (!estimate || !product) return;
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
      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-card border border-line bg-card p-5 card-shadow sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <FormField label="Paint" htmlFor="productId" error={errors.productId} required>
            <SelectMenu
              id="productId"
              label="Paint"
              value={values.productId}
              onChange={(value) => update("productId", value)}
              options={paintOptions}
              invalid={Boolean(errors.productId)}
              describedBy={describedBy("productId")}
            />
          </FormField>
          <FormField label="Measure in" htmlFor="unit">
            <SelectMenu
              id="unit"
              label="Measure in"
              value={values.unit}
              onChange={(value) => update("unit", value === "m" ? "m" : "ft")}
              options={UNIT_OPTIONS}
            />
          </FormField>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold text-muted">Common room sizes</span>
          <div className="flex flex-wrap gap-2">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="rounded-md border border-line bg-surface-muted px-3 py-1.5 text-xs font-semibold text-heading hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {preset.name} ({preset.length}×{preset.width} ft)
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {sizeFields.map(({ key, label }) => numberInput(key, `${label} (${values.unit})`))}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {numberInput("doors", "Doors", "About 7 × 3 ft each")}
          {numberInput("windows", "Windows", "About 4 × 3 ft each")}
          <FormField label="Coats" htmlFor="coats" hint="2 coats for a new colour">
            <SelectMenu
              id="coats"
              label="Coats"
              value={values.coats}
              onChange={(value) => update("coats", value)}
              options={COAT_OPTIONS}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-3 text-sm font-bold text-heading">
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
          <section aria-labelledby="estimate-heading" className="rounded-card border border-paint-100 bg-accent-50 p-5 sm:p-8 space-y-6">
            <h2 id="estimate-heading" className="text-lg font-extrabold text-heading">
              You need about {estimate.litres} L of {product.label}
            </h2>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-card bg-card border border-line p-4">
                <dt className="font-bold text-heading">Area to paint</dt>
                <dd className="mt-1 text-2xl font-black text-brand-700">About {estimate.areaSqft} sq ft</dd>
                <dd className="mt-2 text-xs text-muted">
                  Gross wall: {estimate.grossAreaSqft} sq ft · Deductions: -{estimate.deductionsSqft} sq ft
                  {values.includeCeiling ? ` · Ceiling: +${estimate.ceilingAreaSqft} sq ft` : ""}
                </dd>
              </div>
              <div className="rounded-card bg-card border border-line p-4">
                <dt className="font-bold text-heading">Suggested packs</dt>
                <dd className="mt-1 text-2xl font-black text-brand-700">{formatPacks(estimate.packs)}</dd>
                <dd className="mt-2 text-xs text-muted">Optimized minimum cans for least wastage</dd>
              </div>
            </dl>

            {(estimate.primerLitres || estimate.puttyKg) && (
              <div className="rounded-card border border-line bg-card p-4">
                <h3 className="text-sm font-bold text-heading mb-3">Recommended Preparation Materials:</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {estimate.primerLitres && (
                    <div className="flex justify-between items-center p-2.5 rounded bg-surface-muted border border-line">
                      <span className="font-semibold text-heading">Wall Primer (1 coat)</span>
                      <span className="font-extrabold text-brand-700">~{estimate.primerLitres} L</span>
                    </div>
                  )}
                  {estimate.puttyKg && (
                    <div className="flex justify-between items-center p-2.5 rounded bg-surface-muted border border-line">
                      <span className="font-semibold text-heading">Wall Putty (Fresh surface, 2 coats)</span>
                      <span className="font-extrabold text-brand-700">~{estimate.puttyKg} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted">
              This is an estimate. Wall condition, colour change and brand affect coverage, so the shop will confirm the final quantity.
            </p>
            <Button variant="whatsapp" onClick={handleSend} className="mt-2">
              <WhatsAppIcon className="h-4 w-4" />
              Send estimate on WhatsApp
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
