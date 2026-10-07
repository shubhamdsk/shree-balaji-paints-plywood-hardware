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
      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-card border border-line bg-card p-5 card-shadow sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
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
          <section aria-labelledby="estimate-heading" className="rounded-card border border-paint-100 bg-accent-50 p-5 sm:p-8">
            <h2 id="estimate-heading" className="text-lg font-extrabold text-heading">
              You need about {estimate.litres} L of {product.label}
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-heading">Area to paint</dt>
                <dd className="text-ink">About {estimate.areaSqft} sq ft</dd>
              </div>
              <div>
                <dt className="font-bold text-heading">Suggested packs</dt>
                <dd className="text-ink">{formatPacks(estimate.packs)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              This is an estimate. Wall condition, colour change and brand affect coverage, so the shop will confirm the final quantity.
            </p>
            <Button variant="whatsapp" onClick={handleSend} className="mt-5">
              <WhatsAppIcon className="h-4 w-4" />
              Send estimate on WhatsApp
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
