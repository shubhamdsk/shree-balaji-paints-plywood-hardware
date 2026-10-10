"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, WhatsAppIcon } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { whatsappLink } from "@/config/shop";
import { useConfirm } from "@/hooks/use-confirm";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  ENQUIRY_LIMITS,
  buildEnquiryMessage,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryInput,
} from "@/lib/enquiry";
import { submitEnquiryAction } from "@/server/actions/enquiry";

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
  const productOptions = useMemo(
    () => [{ value: "", label: "General enquiry" }, ...products.map((p) => ({ value: p.id, label: p.label }))],
    [products],
  );
  const [values, setValues] = useState(initialValues);
  const validation = useFormValidation<keyof EnquiryInput>(() => validateEnquiry(values));
  const [serverMessage, setServerMessage] = useState("");
  const errors: EnquiryErrors = validation.errors;
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastWaMsg, setLastWaMsg] = useState("");
  const confirm = useConfirm();

  const isDirty = (Object.keys(values) as (keyof EnquiryInput)[]).some((key) => values[key] !== initialValues[key]);
  useUnsavedChanges(isDirty);

  const update = (key: keyof EnquiryInput, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    validation.clearError(key);
    setServerMessage("");
    setSent(false);
  };

  const reset = () => {
    setValues(initialValues);
    validation.reset();
    setServerMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.checkForm(event.currentTarget)) return;

    setSubmitting(true);
    const productLabel = products.find((p) => p.id === values.productId)?.label;
    const waMsg = buildEnquiryMessage(values, productLabel);
    
    const res = await submitEnquiryAction(values);
    setSubmitting(false);

    if (res.ok) {
      setLastWaMsg(waMsg);
      reset();
      setSent(true);
    } else {
      setServerMessage(res.message ?? "Please check the highlighted fields.");
    }
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
    <form
      onSubmit={handleSubmit}
      onBlur={validation.checkField}
      noValidate
      className="space-y-5 rounded-card border border-line bg-card p-5 card-shadow sm:p-8"
    >
      <FormAlert>{validation.summary ?? serverMessage}</FormAlert>
      {sent && (
        <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100">
          <div className="flex items-center gap-2.5 font-bold text-emerald-800 dark:text-emerald-300 text-base">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            Enquiry Submitted Successfully!
          </div>
          <p className="mt-1.5 text-sm text-emerald-800/90 dark:text-emerald-200">
            Thank you! Your enquiry has been received directly in our shop inbox. We will contact you shortly.
          </p>
          {lastWaMsg && (
            <div className="mt-4">
              <a
                href={whatsappLink(lastWaMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <WhatsAppIcon className="h-4 w-4" /> Want an instant response? Chat on WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Your name" htmlFor="name" error={errors.name} required>
          <input
            id="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            maxLength={ENQUIRY_LIMITS.name}
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
          <SelectMenu
            id="productId"
            label="Product"
            value={values.productId}
            onChange={(value) => update("productId", value)}
            options={productOptions}
          />
        </FormField>
        <FormField label="Quantity" htmlFor="quantity" error={errors.quantity} hint="For example 2 x 20 L">
          <input
            id="quantity"
            value={values.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            maxLength={ENQUIRY_LIMITS.quantity}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={describedBy("quantity")}
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
          maxLength={ENQUIRY_LIMITS.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          className={`${fieldClasses} resize-y`}
          placeholder="Shade, size, site details or delivery location"
        />
      </FormField>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={handleClear} disabled={!isDirty || submitting}>
          Clear
        </Button>
        <Button type="submit" variant="cta" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Enquiry"}
        </Button>
      </div>
    </form>
  );
}
