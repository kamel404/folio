# Folio — AI Portfolio Builder Platform

**Product Name**: Folio (working name — short, memorable, domain-friendly)

> A platform where professionals sign up, answer guided questions or upload a CV, pick a theme, and receive a live, hosted portfolio website in under 5 minutes.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Design System](#design-system)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Multi-Tenancy Design](#multi-tenancy-design)
6. [Onboarding Flow](#onboarding-flow)
7. [Theme Engine](#theme-engine)
8. [AI Integration](#ai-integration)
9. [Admin Panel (Tenant Dashboard)](#admin-panel-tenant-dashboard)
10. [Platform Admin (Super Admin)](#platform-admin-super-admin)
11. [Payment & Subscription](#payment--subscription)
12. [Infrastructure & Costs](#infrastructure--costs)
13. [API & Route Design](#api--route-design)
14. [Security Architecture](#security-architecture)
15. [File & Folder Structure](#file--folder-structure)
16. [Supabase Setup](#supabase-setup)
17. [Development Phases](#development-phases)

---

# Product Vision

## What Folio Is

A **multi-tenant portfolio builder** that generates professional, minimal developer portfolios. Users sign up, complete a guided onboarding (AI-assisted or manual), choose a visual theme, and get a live portfolio URL immediately.

## What Folio Is Not

- Not a generic website builder (no drag-and-drop, no blocks)
- Not a design tool (no Figma-like canvas)
- Not heavily animated or "AI-styled" — portfolios look like something a human developer would hand-build

## Core Product Loop

```
Sign Up (email + password)
     ↓
Onboarding Interview
  → Upload CV (PDF/DOCX) for AI extraction
  → OR answer 10–15 structured questions
     ↓
Pick Theme Palette (5 curated palettes + custom)
     ↓
Review & Edit generated content in dashboard
     ↓
Private preview (everything above costs nothing)
     ↓
Choose a plan — Starter or Pro (no free tier)
     ↓
Portfolio goes live at: username.getfolio.dev
     ↓
Share link. Done.
```

> **Business model:** Folio has **no free plan**. Signing up, onboarding, AI import, editing and a private preview are open to everyone; **publishing requires a paid plan** (Starter or Pro). See [Payment & Subscription](#payment--subscription).

## Target Users

| Segment | Priority |
|---|---|
| Software developers & engineers | Primary |
| Designers & creatives | Secondary |
| Freelancers (tech & non-tech) | Secondary |
| Bootcamp / university graduates | High value |
| Arab diaspora professionals | Strategic differentiator |

---

# Design System

## Design Philosophy

The platform and the generated portfolios must feel:

- **Clean** — generous whitespace, no clutter
- **Professional** — appropriate for sending to recruiters and clients
- **Modern** — current typographic and layout conventions
- **Human** — warm, not sterile or corporate
- **Content-focused** — the person's work is the star, not the UI

Explicitly avoid:

- Neon gradients and glassmorphism
- Particle backgrounds and 3D effects
- "AI-generated" aesthetic (glowing orbs, neural-net lines)
- Cursor-following animations
- Dark-mode-by-default hacker aesthetics
- Skill percentage bars
- Stock photos and generic illustrations

## Platform Color Palette (Folio Dashboard & Marketing Site)

**Direction: "Paper & Vermilion" — editorial.** The platform itself (marketing pages, auth, onboarding, dashboard) looks like a well-set printed publication: warm newsprint paper, near-black ink, hairline rules instead of shadows, and a single vermilion accent. This is separate from the user's portfolio theme (see [Theme Engine](#theme-engine)).

Tokens live in `src/app/globals.css` (`:root`) and are bridged to Tailwind via `@theme inline`.

```
┌──────────────────────────────────────────────────────────────┐
│  PLATFORM PALETTE — PAPER & VERMILION                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Background        #F3F0E8    warm newsprint page            │
│  Surface           #FBFAF6    card stock                     │
│  Surface Raised    #ECE8DD    hover states, alternating rows │
│  Foreground        #16150F    ink: text, primary buttons     │
│  Text Secondary    #5C584D    body copy, descriptions        │
│  Text Tertiary     #8C8676    placeholders, hints, meta      │
│                                                              │
│  Border            #D9D3C4    hairline rules, dividers       │
│  Border Subtle     #E6E1D5    light separators               │
│  Border Strong     #16150F    emphasis rules (table heads)   │
│                                                              │
│  Accent            #C63D1B    vermilion: highlights, focus   │
│  Accent Hover      #A93215    accent hover                   │
│  Accent Light      #F6E2D8    accent tint                    │
│  Accent FG         #FBFAF6    text on accent                 │
│  Proof             = Accent   fixed vermilion for annotations│
│                               inside tenant-palette previews │
│                                                              │
│  Ink (inverted)    #16150F    dark closing band background   │
│  Ink FG            #F3F0E8    text on ink                    │
│  Ink Muted         #A9A392    secondary text on ink          │
│  Ink Border        #34322A    rules on ink                   │
│                                                              │
│  Success           #2F7A4A    confirmations, live status     │
│  Warning           #A86A08    caution notices                │
│  Error             #B42318    destructive, validation errors │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Why This Palette

- **Vermilion accent (#C63D1B)** — printer's red. Used sparingly (one italic word per headline, section numbers, focus), so it reads as editorial emphasis, not "SaaS brand colour". Passes WCAG AA against the accent-fg text.
- **Warm paper (#F3F0E8)** — distinctly not white, which is the single biggest move away from the generic Tailwind/shadcn look.
- **Ink, not grey** — primary buttons are near-black ink and turn vermilion on hover.
- **Rules over shadows** — structure comes from 1px hairlines and a strong top rule on lists/tables; shadows are almost absent.

## Typography

```
Display:     Instrument Serif (400, + italic)   h1, h2 — page & section titles, big numerals
Primary:     Inter                              body, navigation, buttons, h3–h6 inside components
Monospace:   JetBrains Mono                     eyebrows, labels, meta, URLs, code

Loaded via next/font/google in src/app/layout.tsx as
--font-instrument / --font-inter / --font-jetbrains, exposed to Tailwind as
font-display / font-sans / font-mono.

Display sizes (fluid):
  hero h1        clamp(3rem, 7.5vw, 6.25rem)
  page h1        clamp(2.75rem, 6vw, 4.75rem)
  section h2     clamp(2.25rem, 4.5vw, 3.5rem)

Text sizes: Tailwind defaults (xs 12 · sm 14 · base 16 · lg 18 · xl 20 …)
Label:       .label-mono — 11px mono, uppercase, 0.08em tracking
```

### Typography Rules

- **Three families, fixed roles** — serif for titles, Inter for everything inside components, mono for labels. (Deliberate change from the earlier "Inter only" rule: the serif display is what makes Folio look hand-set rather than template-generated.)
- `h1`/`h2` default to the serif at **weight 400 — never bold it** (Instrument Serif has a single weight; bolding would be faked).
- `h3`–`h6` default to Inter 600.
- Emphasis in headlines = one *italic* phrase, coloured accent or secondary.
- Body text uses regular (400); line height 1.6; `text-wrap: balance` on headings, `pretty` on paragraphs.

## Page Grammar (shared layout — every page)

Every page in every route group is assembled from the same primitives in `src/components/layout/section.tsx`, so marketing, auth, onboarding and dashboard read as one publication:

```
<Eyebrow index="01" label="How it works" />     01 ──── HOW IT WORKS   (mono, accent number)
<SectionHeader … />                             eyebrow + serif title (cols 1–7) + lede (cols 9–12)
<Section index label title lede tone>           ruled band, py-20/28; tone = paper | surface | ink
<PageHeader index label title lede actions />   top of any non-landing page (serif h1)
```

- **12-column grid** everywhere: `grid-12` utility (12 cols, 24px gutter) inside `Container` (max 1200px, px-6).
- Sections are separated by a **1px hairline**; lists/tables inside them start with a **strong ink top rule**.
- Sections are **numbered** (`00`, `01`, `02` …) in page order.
- At most **one ink (inverted) band** per page, used for the closing call to action.

Other editorial utilities in `globals.css`: `label-mono`, `link-underline`, `leader` (dotted table-of-contents leader).

## Spacing Scale

```
0     0px
1     4px
2     8px
3     12px
4     16px
5     20px
6     24px
8     32px
10    40px
12    48px
16    64px
20    80px
24    96px
```

All spacing uses this 4px base grid. No ad-hoc pixel values.

## Border Radius

```
none    0
sm      2px      badges, inner buttons
md      4px      buttons, inputs
lg      6px      cards, previews
xl      10px     modals, panels
2xl     14px     images, large cards
full    9999px   status dots, avatars
```

Kept tight on purpose — editorial, not bubbly.

## Shadow Scale

```
sm      0 1px 0 rgba(22,21,15,0.04)                                   hairline lift
md      0 1px 2px rgba(22,21,15,0.05), 0 4px 12px rgba(22,21,15,0.04)  interactive cards
lg      0 2px 4px rgba(22,21,15,0.05), 0 12px 32px rgba(22,21,15,0.07) previews, dropdowns
xl      0 4px 8px rgba(22,21,15,0.06), 0 24px 48px rgba(22,21,15,0.09) modals
```

Shadows are ink-tinted and rare. Structure comes from rules, not elevation.

## Component Standards

### Buttons (`components/ui/button.tsx`)

```
Primary:     ink bg, paper text → hover: vermilion bg       (main CTA)
Accent:      vermilion bg, accent-fg text → hover: accent-hover
Secondary:   transparent, 1px ink border → hover: ink fill, paper text
Ghost:       transparent, text-secondary → hover: surface-raised
Danger:      error bg
Link:        accent text, underline on hover

Radius md (4px) · disabled → opacity 50% · transition 150ms
Links styled as buttons use buttonVariants() on <Link>.
```

### Badges (`components/ui/badge.tsx`)

```
Mono, 11px, uppercase, 0.08em tracking, radius sm (2px)
Variants: default · accent · success · warning · error · outline
```

### Inputs

```
Default:     bg-surface border border-border rounded-md px-3.5 py-2.5 text-base
Focus:       border-accent ring-2 ring-accent/20
Error:       border-error ring-2 ring-error/20
Placeholder: text-tertiary
URL/slug fields use font-mono (see ClaimForm).
```

### Cards

```
Default:     bg-surface border border-border rounded-lg p-6
Hover:       shadow-md (on interactive cards only)
Transition:  shadow 200ms ease
Prefer ruled lists (strong top rule + hairline rows) over grids of cards.
```

### Brand

```
Wordmark:    "folio." — Instrument Serif, vermilion full stop (components/ui/wordmark.tsx)
Styleguide:  /styleguide renders every token and component (noindex)
```

## Animation Guidelines

Animations are **functional only** — they communicate state changes, not decoration.

Allowed:
- Opacity transitions on page/section mount (300ms)
- `translateY(8px) → 0` entrance for content sections
- Button/link hover color transitions (150ms)
- Modal/dropdown open/close (200ms ease-out)
- Skeleton loaders for async content
- Smooth scroll to section anchors

Forbidden:
- Parallax scrolling
- Particle/canvas backgrounds
- 3D transforms
- Spring physics animations
- Auto-playing animated backgrounds
- Animations that delay content visibility beyond 300ms
- Cursor-following effects

All animations must respect `prefers-reduced-motion: reduce`.

## Responsive Breakpoints

```
sm     640px      large phones
md     768px      tablets
lg     1024px     small laptops
xl     1280px     desktops
2xl    1536px     large screens

Container max-width: 1200px (centered, px-6 on mobile)
```

---

# System Architecture

## High-Level Architecture

```
                      ┌────────────────────────────┐
                      │     DNS (Cloudflare)        │
                      │  *.getfolio.dev → Vercel    │
                      └──────────┬─────────────────┘
                                 │
                      ┌──────────▼─────────────────┐
                      │     Vercel (Next.js App)    │
                      │                             │
                      │  ┌───────────────────────┐  │
                      │  │     Proxy (proxy.ts)   │  │
                      │  │  • Subdomain parsing   │  │
                      │  │  • Tenant resolution   │  │
                      │  │  • Auth gate           │  │
                      │  └───────────┬───────────┘  │
                      │              │              │
                      │  ┌───────────▼───────────┐  │
                      │  │     Route Groups       │  │
                      │  │                        │  │
                      │  │  (marketing)           │  │
                      │  │    /                   │  │
                      │  │    /pricing            │  │
                      │  │    /login              │  │
                      │  │    /signup             │  │
                      │  │                        │  │
                      │  │  (dashboard)           │  │
                      │  │    /dashboard          │  │
                      │  │    /dashboard/projects │  │
                      │  │    /dashboard/profile  │  │
                      │  │    /dashboard/settings │  │
                      │  │    /dashboard/theme    │  │
                      │  │                        │  │
                      │  │  (portfolio)           │  │
                      │  │    [subdomain].*       │  │
                      │  │    → renders portfolio │  │
                      │  │      for that tenant   │  │
                      │  │                        │  │
                      │  │  (super-admin)         │  │
                      │  │    /admin              │  │
                      │  │    → platform owner    │  │
                      │  └───────────────────────┘  │
                      └──────────┬─────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
      ┌──────────▼──┐  ┌────────▼───┐  ┌────────▼───┐
      │  Supabase   │  │ Gemini API │  │ Lemon      │
      │  • Auth     │  │ (AI)       │  │ Squeezy    │
      │  • Database │  │            │  │ (Payments) │
      │  • Storage  │  │            │  │            │
      │  • RLS      │  │            │  │            │
      └─────────────┘  └────────────┘  └────────────┘
```

## Request Flow — Portfolio Rendering

```
Browser requests: kamel.getfolio.dev
          │
          ▼
Proxy (src/proxy.ts — Next 16's name for middleware)
  1. Parse hostname → extract "kamel"
  2. Skip reserved subdomains (www, app, api, admin, …)
  3. Rewrite the request to /sites/kamel/<path>
          │
          ▼
Portfolio route (src/app/sites/[slug]/page.tsx)
  1. Read slug from route params
  2. Look up the tenant with the service-role client (tenants are not publicly readable)
  3. Not found → not-found.tsx · plan = 'none' or inactive → <PortfolioOffline />
  4. Live → fetch profile, projects, experiences, skills, theme_config WHERE tenant_id = tenant.id
  5. Render portfolio with tenant's data and theme
          │
          ▼
ISR-cached HTML response (revalidate = 60)
```

## Request Flow — Dashboard

```
Browser requests: getfolio.dev/dashboard
          │
          ▼
Proxy (optimistic guard only)
  1. Refresh the session cookie; verify the JWT with getClaims()
  2. No session → redirect to /login?next=/dashboard…
  3. Signed-in user on /login or /signup → redirect to /dashboard
          │
          ▼
Dashboard Layout (the real check — proxy is never the only line of defence)
  1. getUser() against Supabase Auth (cached per request: lib/data/tenant.ts → getCurrentTenant)
  2. Fetch tenant + profile WHERE user_id = auth.user.id
  3. Render sidebar + content
  (RLS enforces tenant isolation on every query regardless)
```

---

# Database Schema

## Overview of Tables

```
auth.users (Supabase managed)
     │
     └── 1:1 ──── tenants
                      │
                      ├── 1:1 ──── profiles
                      ├── 1:N ──── projects ──── N:M ──── technologies
                      ├── 1:N ──── experiences
                      ├── 1:N ──── skills
                      └── 1:1 ──── theme_configs
                      └── 1:1 ──── subscriptions
```

## Table Definitions

> **The authoritative, runnable schema is `supabase/schema.sql`.** The SQL below is the design reference; the file differs from it in these deliberate ways:
>
> - `gen_random_uuid()` instead of `uuid_generate_v4()` (built in; no extension needed).
> - `tenants.plan` / `subscriptions.plan` default to `'none'` and are CHECK-constrained to `none | starter | pro`.
> - **Signup trigger** `handle_new_user()` on `auth.users`: reads `slug` + `full_name` from the signup metadata and creates the `tenants`, `profiles` and `theme_configs` rows. It runs in the database so it works while email confirmation is pending (no session yet). A taken/invalid/reserved slug makes the insert fail, which rejects the signup.
> - Helper functions `owns_tenant(tid)` and `tenant_is_live(tid)` (SECURITY DEFINER) keep the policies short and avoid RLS recursion.
> - `updated_at` is maintained by a trigger.
> - Security changes are described under [Security Architecture](#security-architecture).

### tenants

The central table that links a Supabase auth user to their portfolio identity.

```sql
CREATE TABLE public.tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,                    -- subdomain: slug.getfolio.dev
  custom_domain TEXT UNIQUE,                             -- Pro: yourdomain.com
  plan          TEXT NOT NULL DEFAULT 'none',             -- none (unpaid, cannot publish) | starter | pro
  onboarding    TEXT NOT NULL DEFAULT 'pending',         -- pending | in_progress | completed
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_tenants_custom_domain ON public.tenants(custom_domain) WHERE custom_domain IS NOT NULL;
```

### profiles

One profile per tenant. Replaces the old single-row `profile` table.

```sql
CREATE TABLE public.profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID UNIQUE NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  title                TEXT NOT NULL DEFAULT 'Software Developer',
  short_bio            TEXT,
  long_bio             TEXT,
  email                TEXT,
  phone                TEXT,
  linkedin_url         TEXT,
  github_url           TEXT,
  cv_url               TEXT,
  profile_image_url    TEXT,
  location             TEXT,
  availability_status  TEXT,
  updated_at           TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);
```

### projects

```sql
CREATE TABLE public.projects (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  slug               TEXT NOT NULL,
  short_description  TEXT NOT NULL,
  description        TEXT,
  image_url          TEXT,
  github_url         TEXT,
  live_url           TEXT,
  category           TEXT NOT NULL DEFAULT 'Web Application',
  featured           BOOLEAN NOT NULL DEFAULT false,
  published          BOOLEAN NOT NULL DEFAULT true,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_projects_tenant ON public.projects(tenant_id);
```

### technologies (shared global table)

```sql
CREATE TABLE public.technologies (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT UNIQUE NOT NULL,
  category TEXT
);
```

### project_technologies (pivot)

```sql
CREATE TABLE public.project_technologies (
  project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES public.technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);
```

### experiences

```sql
CREATE TABLE public.experiences (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  company      TEXT NOT NULL,
  position     TEXT NOT NULL,
  description  TEXT NOT NULL,
  start_date   TEXT NOT NULL,
  end_date     TEXT,
  current      BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_experiences_tenant ON public.experiences(tenant_id);
```

### skills

```sql
CREATE TABLE public.skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_skills_tenant ON public.skills(tenant_id);
```

### theme_configs

Stores each tenant's chosen color palette and layout preferences.

```sql
CREATE TABLE public.theme_configs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID UNIQUE NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  palette_id     TEXT NOT NULL DEFAULT 'warm-earth',     -- references a preset palette
  custom_colors  JSONB,                                  -- Pro: full custom overrides
  font_heading   TEXT DEFAULT 'Inter',
  font_body      TEXT DEFAULT 'Inter',
  layout_variant TEXT DEFAULT 'classic',                  -- classic | sidebar | minimal
  show_photo     BOOLEAN DEFAULT true,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### subscriptions

Tracks payment status from Lemon Squeezy webhooks.

```sql
CREATE TABLE public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID UNIQUE NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  ls_subscription_id    TEXT,                             -- Lemon Squeezy subscription ID
  ls_customer_id        TEXT,                             -- Lemon Squeezy customer ID
  plan                  TEXT NOT NULL DEFAULT 'none',     -- none | starter | pro
  status                TEXT NOT NULL DEFAULT 'active',   -- active | cancelled | past_due | expired
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

---

# Multi-Tenancy Design

## Subdomain Resolution

All tenant portfolios are served from `{slug}.getfolio.dev`. The main app lives at `getfolio.dev` (no subdomain or `www`).

### Reserved Subdomains

The following subdomains must never be assigned to tenants:

```
www, app, api, admin, dashboard, mail, smtp, ftp,
blog, docs, help, support, status, cdn, assets,
staging, dev, test, beta, demo
```

### Proxy Logic (`src/proxy.ts`)

> Next.js 16 renamed `middleware.ts` to **`proxy.ts`** (exported function `proxy`). Same job, new name.

```typescript
export async function proxy(request: NextRequest) {
  const slug = tenantSlugFromHost(request.headers.get("host")); // null for root / www / reserved / *.vercel.app

  // 1. Tenant portfolio:  lina.getfolio.dev/x  →  /sites/lina/x
  if (slug) return NextResponse.rewrite(/* url with pathname = `/sites/${slug}${pathname}` */);

  // 2. /sites/* is an internal rewrite target — 404 if hit directly on the main domain
  // 3. Refresh Supabase session (updateSession → getClaims), then:
  //      /dashboard/*                  and no session  → redirect /login?next=…
  //      /login /signup /forgot-password and session   → redirect /dashboard
}
```

- Root domain comes from `NEXT_PUBLIC_ROOT_DOMAIN` (default `getfolio.dev`; use `localhost:3000` locally, then `lina.localhost:3000` works in browsers).
- Slug validation + the reserved list live in `src/lib/utils/slug.ts` (mirrored in `supabase/schema.sql`).
- **The portfolio route is `app/sites/[slug]`, not `app/_portfolio`** — in the App Router a folder prefixed with `_` is a *private folder* and is excluded from routing, so a rewrite to it would 404.

### DNS Setup (Cloudflare)

```
Type    Name               Content              Proxy
A       getfolio.dev       76.76.21.21          ✓
CNAME   *.getfolio.dev     cname.vercel-dns.com ✓
```

Vercel Pro project configured with:
- `getfolio.dev` (primary)
- `*.getfolio.dev` (wildcard)

---

# Onboarding Flow

## Step-by-Step Flow

```
Step 1: Account Creation
  └── Email + Password + Full Name
  └── Choose username (becomes subdomain: username.getfolio.dev)
  └── Validate slug uniqueness in real-time (SlugField → /api/tenant/check-slug, 400ms debounce)
  └── Slug is pre-filled from the landing page "Claim your address" form (/signup?slug=…)
  └── Server action creates the auth user; a DB trigger creates tenant + profile + theme
  └── If email confirmation is on: "check your inbox" → /auth/callback → /dashboard

Step 2: Content Source (choose one)
  ├── Option A: Upload CV (PDF / DOCX)
  │     └── AI extracts: name, title, bio, experiences, projects, skills
  │     └── Uses existing cv-parser.ts + Gemini API
  │
  ├── Option B: Guided Questions (AI Interview)
  │     └── 10–15 structured questions presented one at a time
  │     └── Examples:
  │           "What is your professional title?"
  │           "Describe what you do in one sentence."
  │           "List your top 3 projects and what each one does."
  │           "What technologies are you most experienced with?"
  │           "Where have you worked? Include roles and dates."
  │           "What's your GitHub username?"
  │           "What's your LinkedIn profile URL?"
  │
  └── Option C: Start Empty
        └── Skip onboarding, go straight to dashboard
        └── User fills in manually

Step 3: Review Extracted Content
  └── Show parsed/generated content in editable cards
  └── User can edit, remove, reorder before importing
  └── "Regenerate with AI" button for individual sections

Step 4: Choose Theme
  └── Show 5 preset palettes (live preview)
  └── All 5 palettes + "Customize colors" (included in every plan)
  └── Pick layout variant (if multiple available)

Step 5: Preview & Choose Plan
  └── Full private preview of the portfolio (not publicly reachable)
  └── Pick Starter or Pro → Lemon Squeezy checkout
  └── Slug pre-filled from the landing page "Claim your address" form (/signup?slug=…)
  └── Plan pre-selected if user came from pricing (/signup?plan=starter|pro)

Step 6: Portfolio Live (after successful payment webhook)
  └── Redirect to dashboard
  └── Show live URL prominently: username.getfolio.dev
  └── "Share" button with copy-to-clipboard
```

## Onboarding State Machine

```
pending → in_progress → completed
             │
             └── Can return to onboarding from dashboard settings
```

The `tenants.onboarding` column tracks this. If a user logs in with `onboarding != completed`, redirect them back to the onboarding flow.

---

# Theme Engine

## How Themes Work

Each portfolio's visual identity is driven by CSS custom properties injected at render time. The portfolio page reads the tenant's `theme_configs` row and generates inline CSS variables.

### Preset Palettes

| ID | Name | Background | Surface | Text | Accent | Use |
|---|---|---|---|---|---|---|
| `warm-earth` | Warm Earth | #F7F6F2 | #FFFFFF | #1F1F1C | #D97757 | Default for new tenants |
| `midnight` | Midnight | #0F172A | #1E293B | #F1F5F9 | #38BDF8 | Dark mode, dev-oriented |
| `forest` | Forest | #F8FAF5 | #FFFFFF | #1A2E1A | #4A7C59 | Natural, organic feel |
| `slate-blue` | Slate Blue | #F8FAFC | #FFFFFF | #0F172A | #3B82F6 | Corporate, trustworthy |
| `sand` | Sand | #FAF9F6 | #FFFFFF | #292524 | #B45309 | Warm, creative |

All five palettes (and custom colours) are available on every plan. Definitions live in `src/lib/themes/palettes.ts`, which also exports `getPalette(id)` and `paletteVars(palette)` (returns the CSS variables as a `style` object — used by the landing page theme previews and later by the theme picker).

Each preset defines the full set of CSS variables:

```typescript
interface ThemePalette {
  id: string;
  name: string;
  note: string;         // one-line description for the theme picker
  colors: {
    background: string;
    surface: string;
    foreground: string;
    textMuted: string;
    accent: string;
    accentDark: string;
    border: string;
    warmBg: string;     // subtle background variation
  };
}
```

### Theme Injection (Server-Side)

When rendering a tenant's portfolio, the Server Component reads `theme_configs` and generates:

```tsx
<style>{`
  :root {
    --background: ${theme.colors.background};
    --surface: ${theme.colors.surface};
    --foreground: ${theme.colors.foreground};
    --text-muted: ${theme.colors.textMuted};
    --accent: ${theme.colors.accent};
    --accent-dark: ${theme.colors.accentDark};
    --border: ${theme.colors.border};
    --warm-bg: ${theme.colors.warmBg};
  }
`}</style>
```

All portfolio components reference these variables — the same component code works for every palette. No conditional class logic needed.

---

# AI Integration

## AI Provider

**Google Gemini API** (already integrated in current codebase).

| Feature | Model | Estimated Tokens | Cost per Call |
|---|---|---|---|
| CV parsing | Gemini 1.5 Flash | ~10K | ~$0.003 |
| Interview answer → content | Gemini 1.5 Flash | ~15K | ~$0.005 |
| Bio/description rewrite | Gemini 1.5 Flash | ~5K | ~$0.002 |
| Portfolio feedback/score | Gemini 1.5 Flash | ~8K | ~$0.003 |

## AI Features by Tier

| Feature | Before paying (onboarding) | Starter | Pro |
|---|---|---|---|
| CV parsing on signup | ✓ (1x) | ✓ (unlimited) | ✓ |
| Interview-based generation | ✓ (1x) | ✓ | ✓ |
| Rewrite content section | ✗ | ✓ (3x/month) | ✓ (unlimited) |
| Portfolio quality score | ✗ | ✗ | ✓ |

## Rate Limiting

- Unpaid accounts (`plan = 'none'`): 1 AI import during onboarding, then locked until a plan is chosen
- Starter: 3 AI regeneration calls per calendar month
- Pro: 20 AI calls per day

Track usage in a `ai_usage` table:

```sql
CREATE TABLE public.ai_usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,     -- 'cv_parse' | 'generate' | 'rewrite' | 'score'
  tokens_in   INTEGER DEFAULT 0,
  tokens_out  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

---

# Admin Panel (Tenant Dashboard)

This is where users manage their portfolio content after onboarding. Accessible at `getfolio.dev/dashboard`.

## Dashboard Sections

```
/dashboard
├── Overview (stats, live link, quick actions)
├── /dashboard/profile        Edit personal information
├── /dashboard/projects       CRUD projects
├── /dashboard/experience     CRUD experiences
├── /dashboard/skills         CRUD skills
├── /dashboard/theme          Change palette, layout, fonts
├── /dashboard/import         Re-import from CV
├── /dashboard/settings       Account, subscription, custom domain
└── /dashboard/analytics      View counts, referral sources (basic on Starter, full on Pro)
```

## Dashboard Overview Page

```
┌──────────────────────────────────────────────────────┐
│  Your Portfolio                                       │
│                                                       │
│  🔗 kamel.getfolio.dev              [Copy] [Visit]   │
│                                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │  5   │  │  2   │  │  12  │  │  47  │              │
│  │Proj  │  │Exp   │  │Skills│  │Views │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
│                                                       │
│  Quick Actions                                        │
│  [+ Add Project]  [Edit Profile]  [Change Theme]     │
│                                                       │
│  Plan: Starter  [Upgrade to Pro — $9.99/mo]          │
└──────────────────────────────────────────────────────┘
```

## Plan Limits (Enforced in Dashboard)

There is **no free tier**. Plan definitions live in `src/lib/payments/plans.ts` (single source for the pricing UI and enforcement).

| Resource | Unpaid (`none`) | Starter | Pro |
|---|---|---|---|
| Edit content & private preview | ✓ | ✓ | ✓ |
| Public portfolio | ✗ (offline) | ✓ | ✓ |
| Projects / experiences / skills | Unlimited | Unlimited | Unlimited |
| Theme palettes | All 5 + custom | All 5 + custom colors | All + full custom |
| Custom domain | No | No | Yes |
| Analytics | No | Basic | Full |

When an unpaid user tries to publish, show the plan picker — not an error.

---

# Platform Admin (Super Admin)

A separate admin panel at `getfolio.dev/admin` for you (the platform owner). Protected by email allowlist.

## Super Admin Capabilities

```
/admin
├── Dashboard (total tenants, revenue, signups this week)
├── /admin/tenants          List all tenants, search, filter by plan
├── /admin/tenants/[id]     View tenant details, impersonate, suspend
├── /admin/subscriptions    Revenue overview, payment events
├── /admin/themes           Manage available palettes
└── /admin/settings         Platform config, allowed admin emails
```

## Super Admin Authorization

```sql
CREATE TABLE public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'admin'   -- admin | super_admin
);
```

`proxy.ts` and the admin layout check: if the route starts with `/admin`, verify the user is in `platform_admins`.

---

# Payment & Subscription

## Provider: Lemon Squeezy

Lemon Squeezy acts as Merchant of Record — handles tax, invoicing, compliance globally. You receive net payouts.

## Products to Create in Lemon Squeezy

| Product | Price | Billing |
|---|---|---|
| Folio Starter Monthly | $4.99/mo | Recurring |
| Folio Starter Annual | $39/year ($3.25/mo) | Recurring |
| Folio Pro Monthly | $9.99/mo | Recurring |
| Folio Pro Annual | $79/year ($6.58/mo) | Recurring |

## Webhook Flow

```
User clicks "Upgrade" → Lemon Squeezy Checkout (hosted)
          │
          ▼
Payment processed → Lemon Squeezy sends webhook to:
  POST getfolio.dev/api/webhooks/lemon-squeezy
          │
          ▼
Webhook handler:
  1. Verify webhook signature (HMAC)
  2. Parse event type:
     • subscription_created → update tenant plan + subscription record
     • subscription_updated → update period dates
     • subscription_cancelled → mark subscription as cancelled
     • subscription_expired → set tenant plan to 'none' (portfolio goes offline)
  3. Revalidate affected paths
```

## Downgrade Logic

When a subscription expires:
1. Set `tenants.plan = 'none'`
2. Keep all content (never delete user data)
3. Take the public portfolio offline — the subdomain shows a neutral "This portfolio is offline" page
4. Hide analytics from dashboard
5. Dashboard stays accessible with a "Choose a plan to go live again" banner

---

# Infrastructure & Costs

## Service Matrix

| Service | Provider | Plan | Monthly Cost | Purpose |
|---|---|---|---|---|
| Hosting | Vercel | Pro | $20 | Next.js app, wildcard subdomains, edge functions |
| Database | Supabase | Free → Pro | $0 → $25 | PostgreSQL, Auth, Storage, RLS |
| AI | Google Gemini | Pay-as-you-go | $2–$30 | CV parsing, content generation |
| Payments | Lemon Squeezy | Free (5% fee) | $0 | Subscription management |
| Email | Resend | Free tier | $0 | Transactional emails (welcome, reset) |
| DNS | Cloudflare | Free | $0 | DNS management, wildcard CNAME |
| Domain | Cloudflare/Namecheap | — | ~$1.25 | getfolio.dev or similar |

### Total Cost by Phase

| Phase | Users | Infra Cost | Revenue (10% of signups subscribe) | Profit |
|---|---|---|---|---|
| Beta | 0–100 | ~$25/mo | $0–$50 | — |
| Launch | 100–500 | ~$50/mo | $50–$250 | $0–$200 |
| Growth | 500–2,000 | ~$75/mo | $250–$1,000 | $175–$925 |
| Scale | 2,000–10,000 | ~$150/mo | $1,000–$5,000 | $850–$4,850 |

---

# API & Route Design

## Route Groups

```
app/
├── (marketing)/                 Public marketing pages
│   ├── page.tsx                 Landing page
│   ├── pricing/page.tsx         Pricing page
│   └── layout.tsx               Marketing layout (navbar + footer)
│
├── (auth)/                      Authentication
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── actions.ts               signUp, logIn, requestPasswordReset, resetPassword, signOut
│   └── layout.tsx               Header + centered page frame (AuthShell)
│
├── auth/callback/route.ts       Email-link target: exchanges ?code for a session, then → ?next
│
├── (dashboard)/                 Tenant dashboard (authenticated)
│   ├── dashboard/page.tsx       Overview (built)
│   ├── dashboard/projects/      Project CRUD
│   ├── dashboard/experience/    Experience CRUD
│   ├── dashboard/skills/        Skills CRUD
│   ├── dashboard/profile/       Profile editing
│   ├── dashboard/theme/         Theme picker
│   ├── dashboard/import/        CV import
│   ├── dashboard/settings/      Account & subscription
│   ├── dashboard/analytics/     Portfolio analytics
│   └── layout.tsx               Auth check + sidebar layout (built)
│
├── (onboarding)/                New user onboarding
│   ├── onboarding/page.tsx      Multi-step wizard
│   └── layout.tsx               Minimal centered layout
│
├── sites/                       Internal rewrite target for tenant subdomains (proxy.ts)
│   └── [slug]/
│       ├── page.tsx             Renders tenant portfolio (placeholder until Phase 3)
│       └── not-found.tsx        Unclaimed address
│
├── (admin)/                     Platform super admin
│   ├── admin/page.tsx
│   ├── admin/tenants/
│   └── layout.tsx               Admin layout
│
├── api/
│   ├── webhooks/
│   │   └── lemon-squeezy/route.ts
│   ├── ai/
│   │   ├── parse-cv/route.ts
│   │   └── generate/route.ts
│   └── tenant/
│       └── check-slug/route.ts
│
├── styleguide/page.tsx          Design-system reference (noindex)
├── layout.tsx                   Root layout
└── globals.css                  Global styles
```

## API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai/parse-cv` | Required | Parse uploaded CV file |
| POST | `/api/ai/generate` | Required | Generate content from interview answers |
| GET | `/api/tenant/check-slug?slug=kamel` | None | `{ available: true|false|null, reason? }` — validates format/reserved words, then checks the DB. `null` = could not check (the DB unique constraint is the final authority) |
| GET | `/auth/callback?code=…&next=…` | None | Completes email confirmation / password-reset links |
| POST | `/api/webhooks/lemon-squeezy` | Webhook signature | Handle payment events |

## Server Actions (Next.js)

All CRUD operations use Server Actions (like your current `actions.ts`), not API routes. Server Actions are simpler and already proven in your current codebase.

```
dashboard/actions.ts
├── updateProfile(formData)
├── saveProject(formData)
├── deleteProject(id)
├── saveExperience(formData)
├── deleteExperience(id)
├── saveSkill(formData)
├── deleteSkill(id)
├── updateTheme(formData)
├── importFromCv(formData)
└── deleteAccount()
```

Each action starts with:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const tenant = await getTenantByUserId(user.id);
// All queries scoped to tenant.id
```

---

# Security Architecture

## Row Level Security (RLS) Policies

Every table with `tenant_id` uses identical RLS patterns:

### Public Portfolio Read Access

Public content is visible **only while the tenant is live** (`plan <> 'none'` and `active`). An unpaid tenant's data is not readable through the API at all — not merely hidden by the UI.

```sql
CREATE POLICY public_read_profiles ON public.profiles FOR SELECT TO anon, authenticated
  USING (public.tenant_is_live(tenant_id));

CREATE POLICY public_read_projects ON public.projects FOR SELECT TO anon, authenticated
  USING (published AND public.tenant_is_live(tenant_id));

-- same for experiences, skills, theme_configs, project_technologies
```

### Tenant Write Access (Owner Only)

```sql
CREATE POLICY owner_all_profiles ON public.profiles FOR ALL TO authenticated
  USING (public.owns_tenant(tenant_id)) WITH CHECK (public.owns_tenant(tenant_id));

-- same pattern for projects, experiences, skills, theme_configs, project_technologies
```

> **Always add `.eq("tenant_id", …)` to dashboard queries.** The public-read policies are OR-ed with the owner policy, so an unfiltered query by a signed-in user would also match *other* live tenants' rows.

### Tenant Table Access

```sql
CREATE POLICY owner_select_tenant ON public.tenants FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY owner_update_tenant ON public.tenants FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.tenants FROM anon, authenticated;
GRANT UPDATE (onboarding) ON public.tenants TO authenticated;   -- the ONLY column a user may change
```

**Why the column grant matters:** without it a user could run `update tenants set plan = 'pro'` from the browser console and upgrade themselves for free. `plan`, `slug`, `active` and `custom_domain` change only from server code using the service-role client (payment webhook, slug change, admin panel). Likewise `subscriptions` and `ai_usage` are read-only for owners, and `platform_admins` has no policies (service role only).

### Service-role client

`src/lib/supabase/admin.ts` bypasses RLS. It is used for: slug availability (`/api/tenant/check-slug`), the signup pre-check, public tenant lookup by slug, and (later) webhooks and the admin panel. Server-side only; select explicit columns.

## Storage Bucket Policies

```sql
-- Storage organized by tenant: portfolio-images/{tenant_id}/...
CREATE POLICY "tenant_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "public_read_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');
```

## Additional Security Measures

- CSRF protection via Server Actions (automatic in Next.js)
- Lemon Squeezy webhook signature verification (HMAC-SHA256)
- Rate limiting on AI endpoints and `/api/tenant/check-slug` (via proxy or Vercel edge config)
- Environment secrets: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `LEMON_SQUEEZY_WEBHOOK_SECRET` — never exposed client-side
- All `NEXT_PUBLIC_*` variables contain only public-safe values

---

# File & Folder Structure

> Application code lives under `src/` (`src/app`, `src/components`, `src/lib`); the tree below omits that prefix. Component files use kebab-case, matching the shadcn convention.

```
folio/
│
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    Landing page
│   │   ├── pricing/page.tsx            Pricing
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (onboarding)/
│   │   ├── onboarding/page.tsx         Multi-step wizard
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                Overview
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx            List
│   │   │   │   ├── new/page.tsx        Create
│   │   │   │   └── [id]/page.tsx       Edit
│   │   │   ├── experience/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── theme/page.tsx
│   │   │   ├── import/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── actions.ts                  All dashboard server actions
│   │   └── layout.tsx                  Sidebar layout
│   │
│   ├── sites/                          Rewrite target for slug.getfolio.dev
│   │   └── [slug]/
│   │       ├── page.tsx                Render tenant portfolio
│   │       └── not-found.tsx           404 for invalid slugs
│   │
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx                Platform stats
│   │   │   └── tenants/
│   │   │       ├── page.tsx            Tenant list
│   │   │       └── [id]/page.tsx       Tenant detail
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── lemon-squeezy/route.ts
│   │   ├── ai/
│   │   │   ├── parse-cv/route.ts
│   │   │   └── generate/route.ts
│   │   └── tenant/
│   │       └── check-slug/route.ts
│   │
│   ├── styleguide/page.tsx             Design system reference (noindex)
│   ├── layout.tsx                      Root layout (loads the 3 fonts)
│   ├── globals.css                     Tokens + editorial utilities
│   ├── icon.svg
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── layout/                         Shared page grammar (used by EVERY page)
│   │   └── section.tsx                 Eyebrow, SectionHeader, Section, PageHeader
│   │
│   ├── marketing/                      Landing page components (kebab-case files)
│   │   ├── marketing-navbar.tsx
│   │   ├── marketing-footer.tsx
│   │   ├── marketing-hero.tsx          00 — hero + facts strip
│   │   ├── how-it-works.tsx            01 — three steps with mini UI artifacts
│   │   ├── feature-index.tsx           02 — features as a ruled table of contents
│   │   ├── theme-gallery.tsx           03 — all palettes rendered live
│   │   ├── principles.tsx              04 — "what we leave out"
│   │   ├── pricing-table.tsx           PricingGrid: "before you pay" + Starter / Pro (used on /pricing)
│   │   ├── faq-list.tsx                Ruled Q&A list (used on /pricing)
│   │   ├── closing-cta.tsx             05 — ink band with claim form (index prop; 02 on /pricing)
│   │   ├── claim-form.tsx              "Claim your address" → GET /signup?slug=
│   │   └── portfolio-specimen.tsx      Mini portfolio rendered in any palette
│   │
│   ├── auth/                           Auth screens
│   │   ├── auth-shell.tsx              AuthShell + AsideList (shared frame for all auth pages)
│   │   ├── login-form.tsx · signup-form.tsx · forgot-password-form.tsx · reset-password-form.tsx
│   │   ├── slug-field.tsx              Address input with live availability check
│   │   ├── submit-button.tsx           Pending-aware submit (useFormStatus)
│   │   └── form-message.tsx            Form-level error / success notice
│   │
│   ├── dashboard/                      Dashboard components
│   │   ├── dashboard-sidebar.tsx       Built: address + status, nav, sign out
│   │   ├── dashboard-nav.tsx           Built: active state; unbuilt sections show "Soon"
│   │   ├── DashboardSidebar.tsx
│   │   ├── StatsCards.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ExperienceForm.tsx
│   │   ├── SkillForm.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── ThemePicker.tsx
│   │   ├── CvImportModal.tsx           (migrated from current admin)
│   │   ├── CvDropzone.tsx              (migrated)
│   │   ├── ImageDropzone.tsx           (migrated)
│   │   ├── DeleteButton.tsx            (migrated)
│   │   └── SubmitButton.tsx            (migrated)
│   │
│   ├── onboarding/                     Onboarding wizard components
│   │   ├── OnboardingWizard.tsx
│   │   ├── StepAccount.tsx
│   │   ├── StepContentSource.tsx
│   │   ├── StepReview.tsx
│   │   ├── StepTheme.tsx
│   │   ├── StepPlan.tsx                Preview + choose Starter / Pro
│   │   └── StepComplete.tsx
│   │
│   ├── portfolio/                      Portfolio rendering components
│   │   ├── PortfolioHero.tsx
│   │   ├── PortfolioAbout.tsx
│   │   ├── PortfolioProjects.tsx
│   │   ├── PortfolioExperience.tsx
│   │   ├── PortfolioSkills.tsx
│   │   ├── PortfolioContact.tsx
│   │   ├── PortfolioNavbar.tsx
│   │   ├── PortfolioFooter.tsx
│   │   └── PortfolioOffline.tsx        Shown when tenant plan = 'none'
│   │
│   └── ui/                             Shared UI primitives (kebab-case files)
│       ├── button.tsx                  + buttonVariants() for links
│       ├── input.tsx                   Input + Textarea
│       ├── container.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── wordmark.tsx                "folio." brand mark
│       ├── modal.tsx
│       ├── icons.tsx
│       └── skeleton.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── env.ts                      getSupabaseEnv / isSupabaseConfigured / isAdminConfigured
│   │   ├── server.ts                   Server-side client (acts as the signed-in user)
│   │   ├── client.ts                   Browser-side client
│   │   ├── admin.ts                    Service-role client (bypasses RLS; server only)
│   │   └── proxy.ts                    updateSession() for src/proxy.ts
│   ├── config.ts                       ROOT_DOMAIN, SITE_URL
│   ├── data/
│   │   ├── tenant.ts                   getCurrentTenant (cached), getTenantBySlug
│   │   ├── profile.ts                  getProfileByTenantId
│   │   ├── projects.ts                 getProjectsByTenantId
│   │   ├── experience.ts               getExperiencesByTenantId
│   │   ├── skills.ts                   getSkillsByTenantId
│   │   └── theme.ts                    getThemeByTenantId
│   ├── ai/
│   │   ├── cv-parser.ts                (migrated from current lib/cv-parser.ts)
│   │   ├── content-generator.ts        Interview answers → portfolio content
│   │   └── gemini-client.ts            Shared Gemini API wrapper
│   ├── payments/
│   │   ├── lemon-squeezy.ts            Webhook verification, checkout URL generation
│   │   └── plans.ts                    Plan definitions and limits
│   ├── themes/
│   │   └── palettes.ts                 Palette definitions
│   └── utils/
│       ├── date.ts                     (migrated)
│       ├── slug.ts                     RESERVED_SLUGS, normalizeSlug, validateSlug
│       └── url.ts                      safeNext (open-redirect guard for ?next=)
│
├── types/
│   └── index.ts                        All TypeScript interfaces
│
├── proxy.ts                             Subdomain rewrite + auth guard (Next 16; formerly middleware.ts)
│
├── supabase/
│   └── schema.sql                      Complete multi-tenant schema
│
├── public/
│   ├── favicon/
│   └── images/
│
├── .env.example                         Template for .env.local (committed)
├── .env.local                           Real keys (git-ignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# Supabase Setup

One-time setup for a new environment. Nothing here needs code changes.

1. **Create a project** at supabase.com → *New project*. Name it `folio` (separate from any personal-portfolio project), pick the region closest to your users, and save the database password somewhere safe.
2. **Run the schema:** *SQL Editor → New query* → paste all of `supabase/schema.sql` → *Run*. It is safe to re-run. Verify under *Table Editor* that `tenants`, `profiles`, `projects`, … exist, and under *Storage* that the `portfolio-images` bucket exists.
3. **Auth settings** (*Authentication*):
   - *Sign In / Providers → Email*: enabled. *Confirm email* is your choice: **on** is the production setting; **off** lets you test signup without opening an inbox.
   - *URL Configuration*: **Site URL** = `http://localhost:3000` (switch to `https://getfolio.dev` for production). **Redirect URLs** → add `http://localhost:3000/auth/callback` (and `https://getfolio.dev/auth/callback` for production).
4. **Copy the keys** from *Project Settings → API* (or *API Keys*): the Project URL, the `anon` / *publishable* key, and the `service_role` / *secret* key.
5. **Create `.env.local`** in the project root from `.env.example` and fill in the three Supabase values. Restart `npm run dev`.

| Variable | Exposed to browser? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon / publishable key; protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **no — server only** | Bypasses RLS. Never commit it, never prefix it with `NEXT_PUBLIC_`, never paste it in chat or tickets |
| `NEXT_PUBLIC_SITE_URL` | yes | Origin used in email links (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | yes | `localhost:3000` locally (so `lina.localhost:3000` works); `getfolio.dev` in production |

Without these keys the app still runs: auth screens show a "not connected to Supabase" notice and `/dashboard` redirects to `/login`.

**Testing a subdomain locally:** with `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000`, open `http://lina.localhost:3000`. Chrome, Edge and Firefox resolve `*.localhost` to your machine automatically.

**Manually activating a plan (until Phase 6 payments exist):** in the SQL Editor run `update public.tenants set plan = 'starter' where slug = 'lina';` and the subdomain switches from the offline page to the live placeholder.

---

# Development Phases

## Phase 0 — New Project Setup (Week 1)

> [!IMPORTANT]
> Start a new Next.js project from scratch. Do **not** try to refactor the portfolio codebase in-place — it's faster and cleaner to build fresh and migrate the reusable pieces (CV parser, form components, Supabase patterns).

- [ ] Initialize new Next.js 16 project with TypeScript + Tailwind
- [x] Configure Supabase project (new project, not shared with personal portfolio) — see [Supabase Setup](#supabase-setup)
- [ ] Set up Cloudflare DNS for chosen domain
- [ ] Connect Vercel Pro with wildcard domain
- [x] Set up environment variables (Supabase done; Gemini, Lemon Squeezy later) — template in `.env.example`
- [x] Implement global design system in `globals.css` (Paper & Vermilion palette, 3-font typography, page grammar)
- [x] Build shared UI components: Button, Input, Card, Container, Badge, Skeleton, Wordmark (Modal still to do)
- [x] Write complete multi-tenant schema (`supabase/schema.sql`)
- [x] Run `supabase/schema.sql` on the Supabase project (verified: 10 tables, storage bucket, signup trigger, RLS)

### What to migrate from kamelportfolio

| File | Action |
|---|---|
| `lib/cv-parser.ts` | Copy → `lib/ai/cv-parser.ts`, remove hardcoded names |
| `components/admin/CvDropzone.tsx` | Copy → `components/dashboard/CvDropzone.tsx` |
| `components/admin/CvImportModal.tsx` | Copy → `components/dashboard/CvImportModal.tsx`, adapt for multi-tenant |
| `components/admin/ImageDropzone.tsx` | Copy → `components/dashboard/ImageDropzone.tsx` |
| `components/admin/DeleteButton.tsx` | Copy → `components/dashboard/DeleteButton.tsx` |
| `components/admin/SubmitButton.tsx` | Copy → `components/dashboard/SubmitButton.tsx` |
| `lib/supabase/server.ts` | Superseded — rewritten for `@supabase/ssr` 0.12 with `getAll`/`setAll` cookies |
| `lib/supabase/client.ts` | Superseded — see above |
| `lib/utils/date.ts` | Copy as-is |

---

## Phase 1 — Core Multi-Tenancy + Auth (Weeks 2–3)

- [x] Implement proxy.ts with subdomain parsing + auth guard
- [x] Implement signup flow (email + password + slug selection) — *built; needs Supabase keys to test*
- [x] Implement login/logout
- [x] Implement forgot-password + reset-password + `/auth/callback`
- [x] Create `tenants` / `profiles` / `theme_configs` records on signup (DB trigger in `schema.sql`)
- [x] Build real-time slug availability checker (`/api/tenant/check-slug`)
- [x] Dashboard layout with sidebar navigation
- [x] Dashboard overview page (address, status, counts, next steps)
- [x] `/sites/[slug]` with offline + not-found states (full portfolio is Phase 3)
- [x] Test end to end with a real Supabase project: signup → dashboard → visit `slug.localhost:3000` → "offline" page → set plan → live → sign out → guards → login. *(Passed 21/21 in a headless browser. Note: email confirmation is currently OFF in Supabase, so signup logs you straight in; turn it ON before launch and re-test the "check your inbox" → `/auth/callback` path with a real inbox.)*

---

## Phase 2 — Dashboard CRUD (Weeks 3–4)

- [ ] Profile editing page (name, bio, links, image upload)
- [ ] Project CRUD (list, create, edit, delete, reorder, publish/unpublish)
- [ ] Experience CRUD (list, create, edit, delete, reorder)
- [ ] Skills CRUD (list, add, delete, categorize)
- [ ] All server actions scoped to `tenant_id`
- [ ] Publishing gate: unpaid tenants (`plan = 'none'`) can edit and preview but not publish
- [ ] Test: full CRUD cycle, verify data isolation between tenants

---

## Phase 3 — Portfolio Rendering (Weeks 4–5)

- [ ] Portfolio page component (`sites/[slug]/page.tsx`; placeholder + offline/404 states already exist)
- [ ] Port and adapt portfolio components from kamelportfolio:
  - [ ] PortfolioNavbar
  - [ ] PortfolioHero
  - [ ] PortfolioAbout
  - [ ] PortfolioProjects
  - [ ] PortfolioExperience
  - [ ] PortfolioSkills
  - [ ] PortfolioContact
  - [ ] PortfolioFooter
- [ ] Theme injection (CSS variables from `theme_configs`)
- [ ] PortfolioOffline page for tenants without an active plan
- [ ] Dynamic SEO metadata per tenant (title, description, Open Graph)
- [ ] ISR caching with `revalidate = 60`
- [ ] 404 page for invalid subdomains
- [ ] Test: create tenant data, visit subdomain, verify correct rendering with chosen theme

---

## Phase 4 — Theme Engine (Week 5)

- [ ] Define 5 preset palettes in `lib/themes/palettes.ts`
- [ ] Theme picker page in dashboard with live preview
- [ ] Save theme selection to `theme_configs`
- [ ] Custom color picker (Starter+ plans)
- [ ] Font selection: Inter, Plus Jakarta Sans, DM Sans (3 safe choices)
- [ ] Test: switch themes, verify portfolio renders correctly with each

---

## Phase 5 — Onboarding + AI (Weeks 6–7)

- [ ] Onboarding wizard component (multi-step form)
- [ ] Step 1: Account info (already done during signup, can pre-fill)
- [ ] Step 2: Content source selector (CV upload / guided questions / skip)
- [ ] Step 3: CV parsing integration (migrate cv-parser.ts)
- [ ] Step 3 alt: Guided question flow → Gemini content generation
- [ ] Step 4: Review & edit extracted content
- [ ] Step 5: Theme selection
- [ ] Step 6: "Your portfolio is live!" confirmation
- [ ] AI content generation endpoint (`/api/ai/generate`)
- [ ] AI rewrite button for individual sections (Starter+)
- [ ] AI usage tracking (`ai_usage` table)
- [ ] Test: complete onboarding via both CV and questions paths

---

## Phase 6 — Payments (Week 8)

- [ ] Create Lemon Squeezy account and products
- [ ] Build upgrade/pricing page in dashboard
- [ ] Implement Lemon Squeezy checkout link generation
- [ ] Implement webhook handler (`/api/webhooks/lemon-squeezy`)
- [ ] Subscription status tracking in `subscriptions` table
- [ ] Plan enforcement logic (publishing gate, AI limits, custom domain, analytics)
- [ ] Downgrade logic when subscription expires
- [ ] Test: full payment cycle (use Lemon Squeezy test mode)

---

## Phase 7 — Marketing Site (Week 9)

- [x] Landing page (hero + claim form, how-it-works, features, themes, house style, closing CTA; pricing lives on /pricing)
- [x] Pricing page (`/pricing`: Before you pay + Starter / Pro + FAQ; the landing page links to it instead of repeating it)
- [x] Marketing navbar and footer
- [ ] SEO: meta tags, Open Graph, sitemap, robots.txt
- [ ] Favicon and brand assets

---

## Phase 8 — Polish & Beta (Weeks 10–12)

- [ ] Settings page (change password, delete account, manage subscription)
- [ ] Email integration (Resend: welcome email, password reset)
- [ ] Portfolio analytics (basic view counter, tracked via proxy)
- [ ] Error handling and loading states across all pages
- [ ] Mobile responsiveness audit (dashboard + portfolio)
- [ ] Accessibility audit (keyboard nav, contrast, ARIA)
- [ ] Performance audit (Lighthouse, Core Web Vitals)
- [ ] Security audit (RLS policies, API access, env variables)
- [ ] Beta launch: invite 20–50 users
- [ ] Collect feedback, fix critical issues
- [ ] Public launch

---

## Future Phases (Post-Launch)

These are not part of the MVP. Build only after validating product-market fit.

- [ ] Custom domain support (Pro tier, Vercel API domain assignment)
- [ ] Arabic / RTL support
- [ ] LinkedIn URL import (scrape public profile data)
- [ ] Blog / case study section
- [ ] PDF export of portfolio
- [ ] Multiple layout variants (sidebar, minimal, two-column)
- [ ] Portfolio quality score (AI-generated feedback)
- [ ] Testimonial / recommendation section
- [ ] Dark mode toggle per portfolio
- [ ] Referral program
- [ ] Team plan (agencies managing multiple portfolios)
