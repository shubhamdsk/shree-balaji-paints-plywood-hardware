"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { whatsappLink } from "@/config/shop";
import { useConfirm } from "@/hooks/use-confirm";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { buildEnquiryMessage, validateEnquiry, type EnquiryErrors, type EnquiryInput } from "@/lib/enquiry";

export interface EnquiryProductOption {
  id: string;
  label: string;
}

interface EnquiryFormProps {
  products: EnquiryProductOption[];
  initialProductId?: string;
}

export default function EnquiryForm({ products, initialProductId = "" }: EnquiryFormProps) {
  const initialValues = useMemo<EnquiryInput>(
    () => ({ name: "", phone: "", productId: initialProductId, quantity: "", message: "" }),
    [initialProductId],
  );
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [sent, setSent] = useState(false);
  const confirm = useConfirm();

  const isDirty = (Object.keys(values) as (keyof EnquiryInput)[]).some((key) => values[key] !== initialValues[key]);
  useUnsavedChanges(isDirty);

  const update = (key: keyof EnquiryInput, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSent(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateEnquiry(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const confirmed = await confirm({
      title: "Send this enquiry on WhatsApp?",
      message: "WhatsApp will open with your enquiry ready. Press Send there to reach the shop.",
      confirmLabel: "Open WhatsApp",
    });
    if (!confirmed) return;

    const productLabel = products.find((p) => p.id === values.productId)?.label;
    window.open(whatsappLink(buildEnquiryMessage(values, productLabel)), "_blank", "noopener,noreferrer");
    reset();
    setSent(true);
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: "Clear the form?",
      message: "Everything you have typed will be removed.",
      confirmLabel: "Clear form",
      tone: "danger",
    });
    if (confirmed) reset();
  };

  const describedBy = (key: keyof EnquiryInput) => (errors[key] ? `${key}-error` : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 card-shadow sm:p-8">
      {sent && (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Enquiry ready in WhatsApp. We usually reply within shop hours.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Your name" htmlFor="name" error={errors.name} required>
          <input
            id="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={fieldClasses}
          />
        </FormField>
        <FormField label="Mobile number" htmlFor="phone" error={errors.phone} hint="Optional, so we can call you back">
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={fieldClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
        <FormField label="Product" htmlFor="productId" hint="Leave empty for a general enquiry">
          <select
            id="productId"
            value={values.productId}
            onChange={(e) => update("productId", e.target.value)}
            className={fieldClasses}
          >
            <option value="">General enquiry</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Quantity" htmlFor="quantity" hint="For example 2 x 20 L">
          <input
            id="quantity"
            value={values.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            className={fieldClasses}
          />
        </FormField>
      </div>

      <FormField label="What do you need?" htmlFor="message" error={errors.message}>
        <textarea
          id="message"
          rows={4}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          className={`${fieldClasses} resize-y`}
          placeholder="Shade, size, site details or delivery location"
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={handleClear} disabled={!isDirty}>
          Clear
        </Button>
        <Button type="submit" variant="whatsapp">
          <MessageCircle className="h-4 w-4" />
          Send on WhatsApp
        </Button>
      </div>
    </form>
  );
}
