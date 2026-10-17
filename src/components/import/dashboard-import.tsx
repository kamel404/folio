"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { ImportFlow, summaryText } from "@/components/import/import-flow";
import type { AiAllowance } from "@/lib/ai/usage";
import type { ImportSummary } from "@/lib/data/import";
import type { Profile } from "@/types";

interface DashboardImportProps {
  tenantId: string;
  profile: Profile;
  allowance: AiAllowance;
}

/** /dashboard/import: the import flow, then where to go next. */
function DashboardImport({ tenantId, profile, allowance }: DashboardImportProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (summary) {
    return (
      <div className="border-t border-[var(--foreground)] pt-8">
        <h2 className="font-sans text-xl font-semibold tracking-normal">Imported.</h2>
        <p className="mt-2 text-[var(--text-secondary)]">{summaryText(summary)} Everything can be edited in its own section.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/preview" className={buttonVariants()}>
            <Eye size={16} aria-hidden />
            Preview your portfolio
          </Link>
          <Link href="/dashboard/projects" className={buttonVariants({ variant: "secondary" })}>
            Projects
          </Link>
          <Link href="/dashboard/experience" className={buttonVariants({ variant: "secondary" })}>
            Experience
          </Link>
          <Button variant="ghost" onClick={() => setSummary(null)}>
            Import something else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[var(--foreground)] pt-8">
      <ImportFlow
        tenantId={tenantId}
        profile={profile}
        allowance={allowance}
        submitLabel="Import into my portfolio"
        onImported={(s) => {
          setSummary(s);
          router.refresh(); // counts in the sidebar / overview
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

export { DashboardImport };
