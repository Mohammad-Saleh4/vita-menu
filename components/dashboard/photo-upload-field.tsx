"use client";

import { ImagePlus } from "lucide-react";
import type { ChangeEvent } from "react";

type PhotoUploadFieldProps = {
  preview: string | null;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
};

export function PhotoUploadField({
  preview,
  onFileChange,
}: PhotoUploadFieldProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onFileChange(null, null);
      return;
    }
    onFileChange(file, URL.createObjectURL(file));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">
        Photo <span className="font-normal text-zinc-400">(optional)</span>
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 transition hover:border-zinc-400 hover:bg-zinc-100">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected photo preview"
            className="h-32 w-32 rounded-lg object-cover"
          />
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-zinc-400" />
            <span className="text-sm text-zinc-600">Tap to upload a photo</span>
            <span className="text-xs text-zinc-400">JPG, PNG, or WebP · max 5 MB</span>
          </>
        )}
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {preview && (
        <p className="text-xs text-zinc-500">
          Tap the image to choose a different photo.
        </p>
      )}
    </div>
  );
}
