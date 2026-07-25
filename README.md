# musicx

Hrijul's Sound Archive — a curated catalog of music recommendations, live at [music.aviusx.dev](https://music.aviusx.dev).

Built as the expressive sibling of [aviusx.dev](https://aviusx.dev): same design DNA (cream/charcoal themes, orange accent, hairline borders), turned up with gig-poster type, a WebGL soundwave hero, and rhythmic motion.

## Stack

- **Next.js 16** (App Router, fully static with on-demand revalidation)
- **Supabase** — Postgres + Auth; recommendations and tags with normalized join table, RLS-enforced owner-only writes
- **Tailwind CSS 4** with custom design tokens
- **GSAP + Lenis** on a single shared ticker; **OGL** for the hero shader
- **Bun** as the package manager

## Development

```bash
bun install
bun dev
```

Requires `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
```

Both values are Supabase publishable credentials (safe to expose; security is enforced by Row Level Security).

## Scripts

| Command                | Purpose                    |
| ---------------------- | -------------------------- |
| `bun dev`              | Dev server (Turbopack)     |
| `bun run build`        | Production build           |
| `bun run start`        | Serve the production build |
| `bun run lint`         | ESLint                     |
| `bun run format`       | Prettier (write)           |
| `bun run format:check` | Prettier (check)           |

## Architecture notes

- The home page is statically rendered; all data comes from Supabase via an anon (cookie-free) client so it stays static. Mutations are Server Actions that call `revalidatePath("/")`.
- Auth is email/password sign-in only (`/login`). Signups are blocked at the database level; writes require the owner's email via RLS policies.
- Admin UI (add/edit/delete recommendations, tag CRUD) appears inline on the public page after sign-in. Pasting a YouTube/Spotify link autofills the form via oEmbed.
- WebGL, smooth scrolling, and all animations bail out under `prefers-reduced-motion`.
