"use client";

import { Toaster as Sonner } from "sonner";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

/**
 * Toasts confirm actions that finish away from the form that started them
 * (saved, deleted, reordered) and report failures of one-shot actions.
 * Form validation errors stay inline next to their fields, never in a toast.
 */
function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      duration={4000}
      icons={{
        success: <CheckCircle2 size={16} className="text-[var(--success)]" aria-hidden />,
        error: <AlertCircle size={16} className="text-[var(--error)]" aria-hidden />,
        info: <Info size={16} className="text-[var(--text-secondary)]" aria-hidden />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-md)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!shadow-[var(--shadow-lg)] !text-sm",
          description: "!text-[var(--text-secondary)]",
          error: "!border-[var(--error)]/40",
        },
      }}
    />
  );
}

export { Toaster };
