import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormMessageProps {
  tone: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

/** Form-level notice (field errors live on each Input). */
function FormMessage({ tone, children, className }: FormMessageProps) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "border-[var(--error)]/30 bg-[var(--error-light)] text-[var(--error)]"
          : "border-[var(--success)]/30 bg-[var(--success-light)] text-[var(--success)]",
        className
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export { FormMessage };
