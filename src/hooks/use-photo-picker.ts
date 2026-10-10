"use client";

import { useEffect, useState } from "react";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photo";
import { resizePhoto } from "@/lib/resize-photo";

export interface PickedPhoto {
  blob: Blob;
  preview: string;
}

export function usePhotoPicker() {
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  const choose = async (file: File | undefined) => {
    setError(undefined);
    if (!file) return;
    if (!(file.type in PHOTO_TYPES)) {
      setError("Choose a JPEG, PNG or WebP photo.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("This photo is over 8 MB. Choose a smaller one.");
      return;
    }
    try {
      const blob = await resizePhoto(file);
      setPhoto({ blob, preview: URL.createObjectURL(blob) });
    } catch {
      setError("This photo couldn't be read. Try another one.");
    }
  };

  return { photo, error, choose };
}
