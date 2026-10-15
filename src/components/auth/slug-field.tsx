"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ROOT_DOMAIN } from "@/lib/config";
import { normalizeSlug, validateSlug } from "@/lib/utils/slug";

interface SlugFieldProps {
  defaultValue?: string;
  /** Server-side error (taken / invalid) from the last submit */
  error?: string;
}

type Remote = { slug: string; available: boolean | null };

/** Address input with a live availability check against /api/tenant/check-slug. */
function SlugField({ defaultValue = "", error }: SlugFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [remote, setRemote] = useState<Remote | null>(null);

  const slug = normalizeSlug(value);
  const validity = slug ? validateSlug(slug) : null;
  const shouldCheck = validity?.ok === true;

  useEffect(() => {
    if (!shouldCheck) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tenant/check-slug?slug=${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        const json: { available: boolean | null } = await res.json();
        setRemote({ slug, available: json.available });
      } catch {
        if (!controller.signal.aborted) setRemote({ slug, available: null });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slug, shouldCheck]);

  const address = `${slug || "yourname"}.${ROOT_DOMAIN}`;
  let liveError: string | undefined;
  let hint = `Your portfolio will live at ${address}`;

  if (validity && !validity.ok) liveError = validity.reason;
  else if (shouldCheck) {
    if (remote?.slug !== slug) hint = `Checking ${address}…`;
    else if (remote.available === false) liveError = "That address is already taken.";
    else if (remote.available === true) hint = `✓ ${address} is available`;
  }

  return (
    <Input
      name="slug"
      label="Your address"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="yourname"
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      required
      maxLength={50}
      className="font-mono"
      hint={hint}
      error={liveError ?? error}
    />
  );
}

export { SlugField };
