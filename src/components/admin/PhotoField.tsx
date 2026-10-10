"use client";

import Image from "next/image";
import FormField from "@/components/ui/FormField";
import type { PickedPhoto } from "@/hooks/use-photo-picker";
import { PHOTO_ACCEPT } from "@/lib/photo";

interface PhotoFieldProps {
  photo: PickedPhoto | null;
  currentImage?: string;
  error?: string;
  hint: string;
  onChoose: (file: File | undefined) => void;
}

export default function PhotoField({ photo, currentImage, error, hint, onChoose }: PhotoFieldProps) {
  const label = photo ? "New photo" : "Current photo";
  return (
    <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-[1fr_auto] sm:p-6">
      <FormField label="Photo" htmlFor="photo" error={error} hint={hint}>
        <input
          id="photo"
          type="file"
          accept={PHOTO_ACCEPT}
          onChange={(event) => onChoose(event.target.files?.[0])}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "photo-error" : undefined}
          className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-surface-muted file:px-4 file:font-semibold file:text-heading"
        />
      </FormField>
      {(photo || currentImage) && (
        <figure className="w-32">
          <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-line bg-surface-muted">
            <Image
              src={photo?.preview ?? currentImage ?? ""}
              alt={label}
              fill
              sizes="128px"
              unoptimized={Boolean(photo)}
              className="object-cover"
            />
          </div>
          <figcaption className="mt-1 text-center text-xs text-muted">{label}</figcaption>
        </figure>
      )}
    </section>
  );
}
