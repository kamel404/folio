import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Globe, Zap } from "lucide-react";

export const metadata = { title: "Styleguide", robots: { index: false } };

export default function Styleguide() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ── Top bar ── */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container className="flex items-center justify-between h-16">
          <span className="font-display text-2xl text-[var(--foreground)]">
            folio
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button size="sm">Get started</Button>
          </div>
        </Container>
      </header>

      {/* ── Hero ── */}
      <section className="py-24 text-center">
        <Container size="sm">
          <Badge variant="accent" dot className="mb-6">
            Styleguide
          </Badge>
          <h1 className="text-6xl text-[var(--foreground)] mb-6">
            Build your portfolio<br />in 5 minutes
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
            Folio generates professional, hosted portfolio websites for developers and creatives.
            Upload a CV or answer a few questions — your portfolio goes live instantly.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg">
              Get started
              <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" size="lg">
              See examples
            </Button>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-4">
            Build and preview before you pay · Plans from $4.99/month
          </p>
        </Container>
      </section>

      {/* ── Design system tokens demo ── */}
      <section className="py-16 border-t border-[var(--border)]">
        <Container>
          <h2 className="text-4xl text-[var(--foreground)] mb-2">
            Design system tokens
          </h2>
          <p className="text-[var(--text-secondary)] mb-10">
            Platform color palette, typography, and component variants.
          </p>

          {/* Palette swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {[
              { name: "Background",   color: "var(--background)",    text: "#F3F0E8" },
              { name: "Surface",      color: "var(--surface)",        text: "#FBFAF6" },
              { name: "Surface+",     color: "var(--surface-raised)", text: "#ECE8DD" },
              { name: "Foreground",   color: "var(--foreground)",     text: "#16150F" },
              { name: "Secondary",    color: "var(--text-secondary)", text: "#5C584D" },
              { name: "Accent",       color: "var(--accent)",         text: "#C63D1B" },
              { name: "Success",      color: "var(--success)",        text: "#2F7A4A" },
              { name: "Error",        color: "var(--error)",          text: "#B42318" },
            ].map((swatch) => (
              <div key={swatch.name} className="flex flex-col gap-2">
                <div
                  className="h-12 rounded-lg border border-[var(--border)]"
                  style={{ backgroundColor: swatch.color }}
                />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{swatch.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono">{swatch.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3 items-center">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="link">Link</Button>
              <Button isLoading loadingText="Saving…">Save</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center mt-3">
              <Button size="sm">Small</Button>
              <Button>Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge>Default</Badge>
              <Badge variant="accent" dot>Accent</Badge>
              <Badge variant="success" dot>Live</Badge>
              <Badge variant="warning" dot>Trial</Badge>
              <Badge variant="error" dot>Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Cards</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Showcase your best work</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Unlimited projects on every plan.
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="accent">Starter</Badge>
                </CardFooter>
              </Card>

              <Card hoverable>
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-2">
                    <Zap size={20} className="text-[var(--accent)]" />
                  </div>
                  <CardTitle>AI Onboarding</CardTitle>
                  <CardDescription>Upload your CV or answer guided questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Gemini AI extracts your profile, projects, skills, and experience automatically.
                  </p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center mb-2">
                    <Globe size={20} className="text-[var(--success)]" />
                  </div>
                  <CardTitle>Live Portfolio</CardTitle>
                  <CardDescription>Your own subdomain, instantly</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Goes live at <span className="font-mono text-xs text-[var(--accent)]">username.getfolio.dev</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Input */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Inputs</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Default"
                placeholder="Enter your name"
              />
              <Input
                label="With hint"
                placeholder="kamel"
                hint="This becomes your portfolio URL"
                prefix={<span className="text-xs text-[var(--text-tertiary)]">getfolio.dev/</span>}
              />
              <Input
                label="With error"
                placeholder="taken-username"
                error="This username is already taken"
                defaultValue="taken-username"
              />
            </div>
          </div>

          {/* Skeleton */}
          <div className="mb-12">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Skeleton loaders</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4" />
                <SkeletonText lines={3} />
              </div>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] py-8">
        <Container>
          <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)]">
            <span>© 2026 Folio</span>
            <span className="flex items-center gap-1">
              <Sparkles size={14} />
              Paper &amp; Vermilion design system
            </span>
          </div>
        </Container>
      </footer>
    </main>
  );
}
