"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Eye } from "lucide-react";
import { completeOnboarding, saveBasics, savePalette, startOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { Container } from "@/components/ui/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/layout/section";
import { FieldRow, FormError } from "@/components/dashboard/form-parts";
import { useActionForm } from "@/components/dashboard/use-action-form";
import { ThemePreview } from "@/components/dashboard/theme-preview";
import { PublishButton } from "@/components/dashboard/publish-button";
import { ImportFlow } from "@/components/import/import-flow";
import { palettes, getPalette } from "@/lib/themes/palettes";
import { isLive } from "@/lib/payments/plans";
import { tenantUrl } from "@/lib/config";
import type { AiAllowance } from "@/lib/ai/usage";
import { cn } from "@/lib/utils";
import type { PortfolioContent, Tenant } from "@/types";

type Step = "basics" | "content" | "theme" | "done";
const STEPS: { id: Exclude<Step, "done">; label: string }[] = [
  { id: "basics", label: "About you" },
  { id: "content", label: "Your work" },
  { id: "theme", label: "Your look" },
];

const stepKey = (tenantId: string) => `folio:onboarding:${tenantId}`;
const readStep = (tenantId: string): Step => {
  try {
    const s = window.localStorage.getItem(stepKey(tenantId));
    return s === "content" || s === "theme" ? s : "basics";
  } catch {
    return "basics";
  }
};
const writeStep = (tenantId: string, step: Step | null) => {
  try {
    if (step) window.localStorage.setItem(stepKey(tenantId), step);
    else window.localStorage.removeItem(stepKey(tenantId));
  } catch {
    /* storage unavailable */
  }
};

interface OnboardingWizardProps {
  tenant: Tenant;
  content: PortfolioContent;
  allowance: AiAllowance;
  address: string;
  skipFailed: boolean;
  paymentsReady: boolean;
}

function OnboardingWizard({ tenant, content, allowance, address, skipFailed, paymentsReady }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStepState] = useState<Step>("basics");

  const setStep = (next: Step) => {
    setStepState(next);
    writeStep(tenant.id, next === "done" ? null : next);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    setStepState(readStep(tenant.id)); // eslint-disable-line react-hooks/set-state-in-effect -- resume where they left off
    if (tenant.onboarding === "pending") void startOnboarding();
  }, [tenant.id, tenant.onboarding]);

  const index = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      {step !== "done" && (
        <Container className="pt-8">
          <ol className="flex flex-wrap gap-x-8 gap-y-2" aria-label="Setup steps">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 label-mono",
                  i === index ? "text-[var(--foreground)]" : "text-[var(--text-tertiary)]"
                )}
              >
                <span className={i < index ? "text-[var(--success)]" : "text-[var(--accent)]"}>
                  {i < index ? <Check size={12} aria-hidden /> : `0${i + 1}`}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
        </Container>
      )}

      {skipFailed && (
        <Container className="pt-6">
          <FormMessage tone="error">We couldn&apos;t skip setup just now. Please try again.</FormMessage>
        </Container>
      )}

      {step === "basics" && <BasicsStep content={content} onDone={() => setStep("content")} />}
      {step === "content" && (
        <>
          <PageHeader
            stacked
            label="Your work"
            title={
              <>
                Where should we <em className="text-[var(--accent)]">start?</em>
              </>
            }
            lede="Give us your CV or answer a few questions, and Folio writes a first draft. You check everything before it's saved."
          />
          <Container className="pb-16">
            <ImportFlow
              tenantId={tenant.id}
              profile={content.profile}
              allowance={allowance}
              submitLabel="Import and continue"
              onImported={() => {
                router.refresh(); // the theme step previews the imported content
                setStep("theme");
              }}
              onStartEmpty={() => setStep("theme")}
              onBack={() => setStep("basics")}
            />
          </Container>
        </>
      )}
      {step === "theme" && (
        <ThemeStep content={content} address={address} onBack={() => setStep("content")} onDone={() => setStep("done")} />
      )}
      {step === "done" && <DoneStep tenant={tenant} paymentsReady={paymentsReady} />}
    </>
  );
}

/* ─── Step 1: name + headline ─── */

function BasicsStep({ content, onDone }: { content: PortfolioContent; onDone: () => void }) {
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(saveBasics, { onSuccess: onDone, toast: false });
  return (
    <>
      <PageHeader
        stacked
        label="About you"
        title={
          <>
            Let&apos;s set up your <em className="text-[var(--accent)]">portfolio.</em>
          </>
        }
        lede="Three short steps. You can change everything later, and nothing is public until you choose a plan."
      />
      <Container className="pb-16">
        <form {...formProps} className="flex max-w-2xl flex-col gap-6 border-t border-[var(--foreground)] pt-8">
          <FormError error={state.error} />
          <FieldRow>
            <Input name="name" label="Your name" required autoComplete="name" defaultValue={content.profile.name} error={fe.name} />
            <Input
              name="title"
              label="Headline"
              required
              placeholder="Frontend engineer"
              hint="Shown under your name."
              defaultValue={content.profile.title}
              error={fe.title}
            />
          </FieldRow>
          <div className="flex justify-end border-t border-[var(--border)] pt-6">
            <Button type="submit" isLoading={pending} loadingText="Saving…">
              Continue
            </Button>
          </div>
        </form>
      </Container>
    </>
  );
}

/* ─── Step 3: palette ─── */

function ThemeStep({
  content,
  address,
  onBack,
  onDone,
}: {
  content: PortfolioContent;
  address: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const saved = getPalette(content.theme.palette_id).id;
  const [paletteId, setPaletteId] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Custom colours (set up earlier on the Theme page) are kept unless another palette is chosen
  const unchanged = paletteId === saved;
  const theme = unchanged ? content.theme : { ...content.theme, palette_id: paletteId, custom_colors: null };

  function finish() {
    setError(null);
    startTransition(async () => {
      try {
        if (!unchanged) {
          const r = await savePalette(paletteId);
          if (!r.ok) return setError(r.error);
        }
        const done = await completeOnboarding();
        if (!done.ok) return setError(done.error);
        onDone();
      } catch (e) {
        console.error(e);
        setError("Couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  return (
    <>
      <PageHeader
        stacked
        label="Your look"
        title={
          <>
            Pick a <em className="text-[var(--accent)]">palette.</em>
          </>
        }
        lede="Fonts and custom colours are on the Theme page in your dashboard."
      />
      <Container className="pb-16">
        <FormError error={error ?? undefined} className="mb-6" />
        <div className="grid gap-10 border-t border-[var(--foreground)] pt-8 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <fieldset>
            <legend className="sr-only">Palette</legend>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              {palettes.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors duration-150 hover:border-[var(--foreground)]",
                    "has-[:checked]:border-[var(--foreground)] has-[:checked]:ring-1 has-[:checked]:ring-[var(--foreground)]",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]"
                  )}
                >
                  <input
                    type="radio"
                    name="palette"
                    value={p.id}
                    checked={paletteId === p.id}
                    onChange={() => setPaletteId(p.id)}
                    className="sr-only"
                  />
                  <span aria-hidden className="flex h-8 w-14 shrink-0 overflow-hidden rounded-sm border border-[var(--border)]">
                    {[p.colors.background, p.colors.accent, p.colors.foreground].map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-[var(--text-tertiary)]">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <ThemePreview content={content} theme={theme} address={address} />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          <Button variant="ghost" onClick={onBack} disabled={pending}>
            Back
          </Button>
          <Button onClick={finish} isLoading={pending} loadingText="Finishing…">
            Finish setup
          </Button>
        </div>
      </Container>
    </>
  );
}

/* ─── Done ─── */

function DoneStep({ tenant, paymentsReady }: { tenant: Tenant; paymentsReady: boolean }) {
  const live = isLive(tenant);
  return (
    <>
      <PageHeader
        stacked
        label="Done"
        title={
          live ? (
            <>
              Your portfolio is <em className="text-[var(--accent)]">live.</em>
            </>
          ) : (
            <>
              Your portfolio is <em className="text-[var(--accent)]">ready.</em>
            </>
          )
        }
        lede={
          live
            ? "Your changes are on your site now. Share the link anywhere."
            : "Have a look at it privately. When you're happy, choose a plan and it goes live at your address."
        }
      />
      <Container className="pb-20">
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--foreground)] pt-8">
          {live ? (
            <a href={tenantUrl(tenant.slug)} target="_blank" rel="noreferrer" className={buttonVariants()}>
              Open your site
              <ArrowUpRight size={14} aria-hidden />
            </a>
          ) : (
            <>
              <Link href="/preview" className={buttonVariants()}>
                <Eye size={16} aria-hidden />
                Preview your portfolio
              </Link>
              <PublishButton tenant={tenant} paymentsReady={paymentsReady} />
            </>
          )}
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            Go to your dashboard
          </Link>
        </div>
      </Container>
    </>
  );
}

export { OnboardingWizard };
