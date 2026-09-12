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
16. [Development Phases](#development-phases)

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
Portfolio goes live at: username.getfolio.dev
     ↓
Share link. Done.
```

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

The platform itself (marketing pages, signup, dashboard) uses a fixed neutral palette with one signature accent. This is separate from the user's portfolio theme.

```
┌──────────────────────────────────────────────────────────────┐
│  PLATFORM PALETTE                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Background        #FAFAF8    warm off-white                 │
│  Surface           #FFFFFF    cards, panels                  │
│  Surface Raised    #F5F4F0    hover states, alternating rows │
│  Foreground        #18181B    primary text                   │
│  Text Secondary    #71717A    descriptions, labels           │
│  Text Tertiary     #A1A1AA    placeholders, hints            │
│                                                              │
│  Border            #E4E4E7    lines, dividers                │
│  Border Subtle     #F0EFEB    light separators               │
│                                                              │
│  Accent            #2563EB    links, primary buttons, focus  │
│  Accent Hover      #1D4ED8    button hover                   │
│  Accent Light      #EFF6FF    accent background tint         │
│                                                              │
│  Success           #16A34A    confirmations, live status      │
│  Warning           #CA8A04    caution, trial notices          │
│  Error             #DC2626    destructive, validation errors  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Why This Palette

- **Blue accent (#2563EB)** — trustworthy, professional, neutral across cultures. Works in both Arab and Western contexts. Does not feel "techy" or "startup-y" — it feels like a tool you can trust.
- **Warm off-white (#FAFAF8)** — not cold white, not beige. Slightly warm so it doesn't feel clinical.
- **Zinc-based grays** — modern, consistent, taken from a professional design scale (Tailwind zinc).

## Typography

```
Primary:     Inter              body, navigation, buttons, labels
Headings:    Inter (700/600)    all headings, page titles
Monospace:   JetBrains Mono     code snippets, technical labels (optional)

Font Sizes:
  xs     0.75rem / 12px    badges, captions
  sm     0.875rem / 14px   labels, secondary text
  base   1rem / 16px       body text
  lg     1.125rem / 18px   large body, descriptions
  xl     1.25rem / 20px    section titles
  2xl    1.5rem / 24px     page headings
  3xl    1.875rem / 30px   hero subheadings
  4xl    2.25rem / 36px    hero titles (mobile)
  5xl    3rem / 48px       hero titles (desktop)
```

### Typography Rules

- Maximum **two font families** across the entire platform (Inter + optional monospace)
- Headings use **semibold (600) or bold (700)** — never light or thin
- Body text uses **regular (400)** — never medium for paragraphs
- Line height: headings `1.2`, body `1.6`, tight `1.4`
- Letter spacing: headings `-0.025em`, body `normal`

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
sm      4px      small badges, tags
md      6px      buttons, inputs
lg      8px      cards
xl      12px     modals, panels
2xl     16px     images, large cards
full    9999px   pills, avatars
```

## Shadow Scale

```
sm      0 1px 2px rgba(0,0,0,0.04)           subtle lift
md      0 2px 8px rgba(0,0,0,0.06)           cards
lg      0 4px 16px rgba(0,0,0,0.08)          modals, dropdowns
xl      0 8px 32px rgba(0,0,0,0.10)          elevated panels
```

Shadows are intentionally subtle. No heavy drop shadows.

## Component Standards

### Buttons

```
Primary:     bg-accent text-white rounded-md px-4 py-2.5 font-medium
Secondary:   bg-transparent border border-border text-foreground rounded-md
Ghost:       bg-transparent text-secondary hover:bg-surface-raised rounded-md
Danger:      bg-error text-white rounded-md

States:      hover → darken 8%, active → darken 12%, disabled → opacity 50%
Transition:  all 150ms ease
```

### Inputs

```
Default:     bg-white border border-border rounded-md px-3.5 py-2.5 text-base
Focus:       border-accent ring-2 ring-accent/20
Error:       border-error ring-2 ring-error/20
Placeholder: text-tertiary
```

### Cards

```
Default:     bg-white border border-border rounded-lg p-6
Hover:       shadow-md (on interactive cards only)
Transition:  shadow 200ms ease
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
                      │  │     Middleware         │  │
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
Middleware (middleware.ts)
  1. Parse hostname → extract "kamel"
  2. Check if subdomain is reserved (www, app, api, admin)
  3. Set x-tenant-slug header = "kamel"
  4. Continue to Next.js routing
          │
          ▼
Portfolio Route Handler (/[tenant]/page.tsx or catch-all)
  1. Read x-tenant-slug from headers
  2. Query Supabase: SELECT * FROM tenants WHERE slug = 'kamel'
  3. If not found → 404 page
  4. If found → fetch profile, projects, experiences, skills WHERE user_id = tenant.user_id
  5. Fetch tenant's theme_config (colors, font choices)
  6. Render portfolio with tenant's data and theme
          │
          ▼
ISR-cached HTML response (revalidate = 60)
```

## Request Flow — Dashboard

```
Browser requests: getfolio.dev/dashboard
          │
          ▼
Middleware
  1. Check auth session
  2. If no session → redirect to /login
  3. If session → continue
          │
          ▼
Dashboard Layout
  1. Fetch user from Supabase Auth
  2. Fetch tenant record WHERE user_id = auth.user.id
  3. Render sidebar + content
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

### tenants

The central table that links a Supabase auth user to their portfolio identity.

```sql
CREATE TABLE public.tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,                    -- subdomain: slug.getfolio.dev
  custom_domain TEXT UNIQUE,                             -- Pro: yourdomain.com
  plan          TEXT NOT NULL DEFAULT 'free',             -- free | starter | pro
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
  plan                  TEXT NOT NULL DEFAULT 'free',
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

### Middleware Logic

```typescript
// Pseudocode for middleware.ts

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const mainDomain = 'getfolio.dev';

  // Extract subdomain
  const subdomain = hostname.replace(`.${mainDomain}`, '');
  const isSubdomain = hostname !== mainDomain
                      && hostname !== `www.${mainDomain}`
                      && subdomain !== hostname;

  if (isSubdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    // This is a tenant portfolio request
    // Set header so the page route can read it
    const response = NextResponse.rewrite(
      new URL(`/_portfolio/${subdomain}${request.nextUrl.pathname}`, request.url)
    );
    response.headers.set('x-tenant-slug', subdomain);
    return response;
  }

  // Otherwise: normal routing (marketing, dashboard, auth)
  // Auth checks for /dashboard/* routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check Supabase session, redirect to /login if missing
  }

  return NextResponse.next();
}
```

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
  └── Validate slug uniqueness in real-time

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
  └── "Customize colors" toggle (Starter+ plans)
  └── Pick layout variant (if multiple available)

Step 5: Portfolio Live
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
| `warm-earth` | Warm Earth | #F7F6F2 | #FFFFFF | #1F1F1C | #D97757 | Your current palette |
| `midnight` | Midnight | #0F172A | #1E293B | #F1F5F9 | #38BDF8 | Dark mode, dev-oriented |
| `forest` | Forest | #F8FAF5 | #FFFFFF | #1A2E1A | #4A7C59 | Natural, organic feel |
| `slate-blue` | Slate Blue | #F8FAFC | #FFFFFF | #0F172A | #3B82F6 | Corporate, trustworthy |
| `sand` | Sand | #FAF9F6 | #FFFFFF | #292524 | #B45309 | Warm, creative |

Each preset defines the full set of CSS variables:

```typescript
interface ThemePalette {
  id: string;
  name: string;
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

| Feature | Free | Starter | Pro |
|---|---|---|---|
| CV parsing on signup | ✓ (1x) | ✓ (unlimited) | ✓ |
| Interview-based generation | ✓ (1x) | ✓ | ✓ |
| Rewrite content section | ✗ | ✓ (3x/month) | ✓ (unlimited) |
| Portfolio quality score | ✗ | ✗ | ✓ |

## Rate Limiting

- Free tier: 1 AI call at signup, then locked
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
└── /dashboard/analytics      View counts, referral sources (Starter+)
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
│  Plan: Free  [Upgrade to Starter — $4.99/mo]         │
└──────────────────────────────────────────────────────┘
```

## Free Tier Limits (Enforced in Dashboard)

| Resource | Free | Starter | Pro |
|---|---|---|---|
| Published projects | 3 | Unlimited | Unlimited |
| Experiences | 2 | Unlimited | Unlimited |
| Skills | 10 | Unlimited | Unlimited |
| Theme palettes | 2 (Warm Earth + Slate Blue) | All 5 + custom colors | All + full custom |
| Watermark on portfolio | Yes | No | No |
| Custom domain | No | No | Yes |
| Analytics | No | Basic | Full |

When a free-tier user tries to add a 4th project, show an upgrade prompt — not an error.

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

Middleware checks: if route starts with `/admin`, verify user is in `platform_admins`.

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
     • subscription_expired → downgrade tenant to free
  3. Revalidate affected paths
```

## Downgrade Logic

When a subscription expires:
1. Set `tenants.plan = 'free'`
2. Keep all content (never delete user data)
3. Add watermark back to portfolio
4. Hide analytics from dashboard
5. If > 3 published projects, keep them but show "Upgrade to publish more" in dashboard

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

| Phase | Users | Infra Cost | Revenue (10% conversion) | Profit |
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
│   └── layout.tsx               Minimal centered layout
│
├── (dashboard)/                 Tenant dashboard (authenticated)
│   ├── dashboard/page.tsx       Overview
│   ├── dashboard/projects/      Project CRUD
│   ├── dashboard/experience/    Experience CRUD
│   ├── dashboard/skills/        Skills CRUD
│   ├── dashboard/profile/       Profile editing
│   ├── dashboard/theme/         Theme picker
│   ├── dashboard/import/        CV import
│   ├── dashboard/settings/      Account & subscription
│   ├── dashboard/analytics/     Portfolio analytics
│   └── layout.tsx               Dashboard sidebar layout
│
├── (onboarding)/                New user onboarding
│   ├── onboarding/page.tsx      Multi-step wizard
│   └── layout.tsx               Minimal centered layout
│
├── _portfolio/                  Internal rewrite target (not directly accessed)
│   └── [slug]/
│       └── page.tsx             Renders tenant portfolio
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
├── layout.tsx                   Root layout
└── globals.css                  Global styles
```

## API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai/parse-cv` | Required | Parse uploaded CV file |
| POST | `/api/ai/generate` | Required | Generate content from interview answers |
| GET | `/api/tenant/check-slug?slug=kamel` | None | Check if slug is available (signup form) |
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

```sql
-- Anyone can read published portfolio content
CREATE POLICY "public_read_profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "public_read_projects"
  ON public.projects FOR SELECT
  USING (published = true);

CREATE POLICY "public_read_experiences"
  ON public.experiences FOR SELECT
  USING (true);

CREATE POLICY "public_read_skills"
  ON public.skills FOR SELECT
  USING (true);
```

### Tenant Write Access (Owner Only)

```sql
-- Users can only modify their own tenant's data
CREATE POLICY "owner_all_profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  )
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

-- Same pattern for projects, experiences, skills, theme_configs
```

### Tenant Table Access

```sql
-- Users can only see/edit their own tenant
CREATE POLICY "owner_select_tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner_update_tenant"
  ON public.tenants FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

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
- Rate limiting on AI endpoints (via middleware or Vercel edge config)
- Environment secrets: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `LEMON_SQUEEZY_WEBHOOK_SECRET` — never exposed client-side
- All `NEXT_PUBLIC_*` variables contain only public-safe values

---

# File & Folder Structure

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
│   ├── _portfolio/
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
│   ├── layout.tsx                      Root layout
│   ├── globals.css
│   ├── icon.svg
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── marketing/                      Landing page components
│   │   ├── MarketingNavbar.tsx
│   │   ├── MarketingHero.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── PricingCards.tsx
│   │   └── MarketingFooter.tsx
│   │
│   ├── dashboard/                      Dashboard components
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
│   │   └── FolioWatermark.tsx          (free tier branding)
│   │
│   └── ui/                             Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Container.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Icons.tsx
│       └── Skeleton.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   Server-side Supabase client
│   │   └── client.ts                   Browser-side Supabase client
│   ├── data/
│   │   ├── tenant.ts                   getTenantBySlug, getTenantByUserId
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
│       └── slug.ts                     Slug generation and validation
│
├── types/
│   └── index.ts                        All TypeScript interfaces
│
├── middleware.ts                        Subdomain routing + auth checks
│
├── supabase/
│   └── schema.sql                      Complete multi-tenant schema
│
├── public/
│   ├── favicon/
│   └── images/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# Development Phases

## Phase 0 — New Project Setup (Week 1)

> [!IMPORTANT]
> Start a new Next.js project from scratch. Do **not** try to refactor the portfolio codebase in-place — it's faster and cleaner to build fresh and migrate the reusable pieces (CV parser, form components, Supabase patterns).

- [ ] Initialize new Next.js 16 project with TypeScript + Tailwind
- [ ] Configure Supabase project (new project, not shared with personal portfolio)
- [ ] Set up Cloudflare DNS for chosen domain
- [ ] Connect Vercel Pro with wildcard domain
- [ ] Set up environment variables (Supabase, Gemini, Lemon Squeezy)
- [ ] Implement global design system in `globals.css` (platform palette, typography, spacing)
- [ ] Build shared UI components: Button, Input, Card, Container, Modal, Badge
- [ ] Run complete database schema (multi-tenant) on Supabase

### What to migrate from kamelportfolio

| File | Action |
|---|---|
| `lib/cv-parser.ts` | Copy → `lib/ai/cv-parser.ts`, remove hardcoded names |
| `components/admin/CvDropzone.tsx` | Copy → `components/dashboard/CvDropzone.tsx` |
| `components/admin/CvImportModal.tsx` | Copy → `components/dashboard/CvImportModal.tsx`, adapt for multi-tenant |
| `components/admin/ImageDropzone.tsx` | Copy → `components/dashboard/ImageDropzone.tsx` |
| `components/admin/DeleteButton.tsx` | Copy → `components/dashboard/DeleteButton.tsx` |
| `components/admin/SubmitButton.tsx` | Copy → `components/dashboard/SubmitButton.tsx` |
| `lib/supabase/server.ts` | Copy as-is |
| `lib/supabase/client.ts` | Copy as-is |
| `lib/utils/date.ts` | Copy as-is |

---

## Phase 1 — Core Multi-Tenancy + Auth (Weeks 2–3)

- [ ] Implement middleware with subdomain parsing
- [ ] Implement signup flow (email + password + slug selection)
- [ ] Implement login/logout
- [ ] Implement forgot-password
- [ ] Create `tenants` record on signup
- [ ] Create `profiles` record on signup (minimal: name from signup form)
- [ ] Build real-time slug availability checker (`/api/tenant/check-slug`)
- [ ] Dashboard layout with sidebar navigation
- [ ] Dashboard overview page (stats cards, live link)
- [ ] Test: signup → login → see dashboard → visit subdomain → see empty portfolio

---

## Phase 2 — Dashboard CRUD (Weeks 3–4)

- [ ] Profile editing page (name, bio, links, image upload)
- [ ] Project CRUD (list, create, edit, delete, reorder, publish/unpublish)
- [ ] Experience CRUD (list, create, edit, delete, reorder)
- [ ] Skills CRUD (list, add, delete, categorize)
- [ ] All server actions scoped to `tenant_id`
- [ ] Free tier limit enforcement (3 projects, 2 experiences, 10 skills)
- [ ] Test: full CRUD cycle, verify data isolation between tenants

---

## Phase 3 — Portfolio Rendering (Weeks 4–5)

- [ ] Portfolio page component (`_portfolio/[slug]/page.tsx`)
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
- [ ] FolioWatermark component (free tier)
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
- [ ] Plan enforcement logic (watermark, limits, feature gates)
- [ ] Downgrade logic when subscription expires
- [ ] Test: full payment cycle (use Lemon Squeezy test mode)

---

## Phase 7 — Marketing Site (Week 9)

- [ ] Landing page (hero, features, how-it-works, testimonials placeholder, CTA)
- [ ] Pricing page (free / starter / pro comparison)
- [ ] Marketing navbar and footer
- [ ] SEO: meta tags, Open Graph, sitemap, robots.txt
- [ ] Favicon and brand assets

---

## Phase 8 — Polish & Beta (Weeks 10–12)

- [ ] Settings page (change password, delete account, manage subscription)
- [ ] Email integration (Resend: welcome email, password reset)
- [ ] Portfolio analytics (basic view counter, tracked via middleware)
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
