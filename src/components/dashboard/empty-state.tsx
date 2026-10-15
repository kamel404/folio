import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  body: string;
  /** Optional call to action; omit when the add form is already on the page */
  action?: { href: string; label: string };
}

/** Shown in place of an empty list. */
function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="border-y border-dashed border-[var(--border)] px-6 py-14 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
      {action && (
        <Link href={action.href} className={buttonVariants({ className: "mt-6" })}>
          <Plus size={16} aria-hidden />
          {action.label}
        </Link>
      )}
    </div>
  );
}

export { EmptyState };
