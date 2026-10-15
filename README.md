# Folio

A multi-tenant portfolio builder. Professionals sign up, pick a theme, and get a
hosted portfolio at `username.yourdomain.com` — no drag-and-drop, just clean,
minimal developer portfolios.

> **Status:** early development. Auth, tenant creation, subdomain routing and
> the marketing site are built; onboarding, the portfolio theme engine, AI
> content generation and payments are still to come.

## Features

- **Marketing site** — landing page, pricing, FAQ, slug-claim form
- **Auth** — email + password signup, login, forgot/reset password, email confirmation callback
- **Multi-tenancy** — each user gets a subdomain; the proxy rewrites `slug.domain` to `/sites/[slug]`
- **Dashboard** — authenticated area for managing the portfolio
- **Row-level security** — Postgres policies expose only paid, active tenants publicly

## Tech stack

- [Next.js](https://nextjs.org) (App Router) · React 19 · TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) · [Base UI](https://base-ui.com) · shadcn · Framer Motion
- [Supabase](https://supabase.com) — Postgres, Auth, RLS
- [Zod](https://zod.dev) for validation

## Getting started

### Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

### 1. Install

```bash
git clone <your-fork-or-repo-url> folio
cd folio
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project.
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. It is safe to re-run.
3. Under **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the redirect URLs.
4. Copy your keys from **Project Settings → API**.

### 3. Configure environment

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | `anon` / publishable key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | `service_role` / secret key. **Server only** — bypasses RLS, never expose it |
| `NEXT_PUBLIC_SITE_URL` | yes | Origin used in email links (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | yes | Root domain for tenant subdomains (`localhost:3000` locally) |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To preview a tenant site
locally, visit `http://<slug>.localhost:3000` — Chrome, Edge and Firefox resolve
`*.localhost` automatically.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/
│   ├── (marketing)/   Landing and pricing pages
│   ├── (auth)/        Login, signup, password reset + server actions
│   ├── (dashboard)/   Authenticated dashboard
│   ├── sites/[slug]/  Public tenant portfolios (reached via subdomain rewrite)
│   ├── api/           Route handlers (e.g. slug availability)
│   └── auth/callback/ Email confirmation / reset link handler
├── components/        UI primitives and feature components
├── lib/               Supabase clients, config, data access, utilities
├── proxy.ts           Subdomain resolution and auth guards
└── types/
supabase/schema.sql    Database schema, RLS policies and signup trigger
```

## Security notes

- Never commit `.env.local`; it is git-ignored.
- The `service_role` key must only be used in server code.
- Data access is protected by RLS — review `supabase/schema.sql` before deploying.

## License

[MIT](LICENSE)
