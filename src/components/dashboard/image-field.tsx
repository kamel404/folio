"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 4 * 1024 * 1024; // keep in sync with MAX_IMAGE_BYTES in lib/data/mutations.ts

interface ImageFieldProps {
  /** File input name; the server reads the file from this key */
  name: string;
  label: string;
  /** Currently saved image */
  currentUrl: string | null;
  hint?: string;
  error?: string;
  /** "square" for avatars, "wide" for project covers */
  shape?: "square" | "wide";
}

/**
 * Picks an image to upload with the rest of the form. Nothing is uploaded
 * until the form is saved; the preview is local. Removing an existing image
 * sends `${name}_remove=on` so the server clears it on save.
 */
function ImageField({ name, label, currentUrl, hint, error, shape = "square" }: ImageFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Revoke object URLs we created. (After a save the parent remounts this field, resetting it.)
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const shown = preview ?? (removed ? null : currentUrl);
  const message = localError ?? error;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLocalError(null);
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setLocalError("Use a JPG, PNG, WebP or GIF image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("Images must be 4 MB or smaller.");
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setLocalError(null);
    setRemoved(Boolean(currentUrl));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-5">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)]",
            shape === "square" ? "h-24 w-24 rounded-full" : "aspect-[16/10] w-48 rounded-md",
            message && "border-[var(--error)]"
          )}
        >
          {shown ? (
            // Local blob previews can't go through next/image
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-[var(--text-tertiary)]" aria-hidden />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={ACCEPT}
            onChange={onChange}
            aria-labelledby={`${id}-label`}
            aria-invalid={!!message}
            aria-describedby={message ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className="sr-only"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload size={14} aria-hidden />
            {shown ? "Replace" : "Upload"}
          </Button>
          {shown && (
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <Trash2 size={14} aria-hidden />
              Remove
            </Button>
          )}
          {removed && <input type="hidden" name={`${name}_remove`} value="on" />}
        </div>
      </div>

      {preview && !message && (
        <p className="text-sm text-[var(--text-secondary)]">New image selected. It uploads when you save.</p>
      )}
      {removed && !preview && (
        <p className="text-sm text-[var(--text-secondary)]">The image will be removed when you save.</p>
      )}
      {hint && !message && !preview && !removed && (
        <p id={`${id}-hint`} className="text-sm text-[var(--text-secondary)]">
          {hint}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} className="text-sm text-[var(--error)]" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export { ImageField };
