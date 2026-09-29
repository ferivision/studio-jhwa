# CLAUDE.md — studioJHWA website

Read this file before every task. It is the source of truth for how this repo is built and maintained.

## 1. Project

Company profile website for **studioJHWA**, an interior design & build studio in Surabaya and Malang, Indonesia.
Goals: showcase portfolio (image-first), rank well in local search (EN + ID), and stay easy to maintain.

- Brand tagline: "Formed by flow, built on principles."
- Languages: English (`/en`, default) and Bahasa Indonesia (`/id`).
- Instagram: @studio.jhwa

## 2. Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript `strict` |
| Styling | Tailwind CSS, design tokens defined once in the Tailwind theme |
| Content | JSON files in `content/`, validated with Zod at build time |
| Fonts / images | `next/font` (Jost), `next/image` |
| Quality | ESLint, Prettier, Vitest, Playwright (smoke), Husky + lint-staged, commitlint |
| Release | semantic-release on `main` (Conventional Commits) |
| Hosting | Vercel (now), VPS via Docker + Caddy (prepared, not active) |

Always use the **current stable** version of each dependency. Verify with `npm view <pkg> version` before adding; never guess versions.

## 3. Commands

```bash
npm run dev          # local dev
npm run build        # production build (also validates content JSON)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run test:e2e     # playwright smoke tests
npm run format       # prettier --write
npm run validate     # lint + typecheck + test + build (run before every PR)
```

## 4. Architecture

```
content/                    ← ALL editable data lives here (JSON only)
  site.json                 company, contact, address, socials, service areas
  projects/*.json           one file per project
  i18n/en.json, id.json     UI copy
src/
  app/[lang]/               routes (server components by default)
  components/ui/            primitives: Button, Container, Heading, Photo...
  components/layout/        Header, MobileMenu, Footer, LangSwitch
  components/sections/      Hero, SelectedProjects, FilmStrip, LineToLight...
  lib/content/              repositories (getSite, getProjects, getProject, getDictionary)
  lib/schemas/              Zod schemas for every JSON file
  lib/seo/                  metadata builders, JSON-LD builders
  lib/i18n/                 locales, helpers
  config/                   env parsing (Zod), constants
public/images/              optimized source images
```

### Design patterns (keep them; document changes in README)

- **Repository pattern**: components never import JSON directly. They call `lib/content/*`. Swapping JSON for a CMS later only touches repositories.
- **Schema-first content**: every JSON file has a Zod schema; invalid content fails the build with a clear error.
- **Server/Client split**: server components fetch and compose; client components (`"use client"`) are small, interactive leaves only (slider, filter, mobile menu).
- **Composition over configuration**: sections are composed from `ui/` primitives; no god components, no prop drilling beyond 2 levels.
- **Single source of truth**: design tokens in Tailwind theme, contact data in `site.json`, copy in `i18n/*.json`. No hard-coded strings, colors, or contact info in components.
- **Typed env config**: `config/env.ts` parses `process.env` with Zod; nothing else reads `process.env`.

## 5. Design system

- Palette: plaster `#E6E2DB` (base), stone `#D8D2C9`, line `#B9B2A7`, ink `#3A3530`, muted `#5E5750`, charcoal `#2B2825`, deep `#221F1C`, oak `#8C7359`, glow `#D9B77C` (cove-light accent), drawing red `#B5483A`.
- Type: Jost. Contrast of weight 300 (thin) with 600 italic for emphasis lines, mirroring the studio's Instagram.
- Signature elements: glowing "cove light" line (2px, glow color with blur), "From line to light" drawing→render slider, auto-scrolling film strip, full-bleed room panels.
- Image-first: portfolio is the product. Large photos, minimal chrome.
- Accessibility: WCAG AA contrast, visible focus rings, tap targets ≥ 44px, `prefers-reduced-motion` disables animations, meaningful alt text in both languages.
- Mobile-first; must work at 360px.

## 6. Git workflow (mandatory)

1. **Every task starts with a GitHub issue** (`gh issue create`) using the templates in `.github/ISSUE_TEMPLATE/`. No code before an issue exists.
2. Branches: `main` (production, protected) and `develop` (integration, default branch).
3. Work branches from `develop`: `feat/<issue#>-short-slug`, `fix/<issue#>-...`, `chore/<issue#>-...`, `docs/<issue#>-...`.
4. Commits follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `perf:`). Reference the issue: `feat(projects): add filter (#12)`.
5. PR into `develop`, body includes `Closes #<issue>`, and the PR template checklist. CI must be green. Squash merge.
6. **Release** = PR `develop` → `main`, merge commit (not squash). On push to `main`, semantic-release bumps the version in `package.json`, updates `CHANGELOG.md`, tags `vX.Y.Z`, creates a GitHub Release, then `develop` is synced from `main`.
7. Never commit directly to `main` or `develop`. Never force-push shared branches.

## 7. Security rules

- **Secrets management**: no secrets in the repo. `.env*` is git-ignored; `.env.example` lists keys only. gitleaks runs in CI.
- **HTTP security headers**: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`, `poweredByHeader: false`. Configured in one place (`next.config` / middleware).
- **XSS / output encoding**: never use `dangerouslySetInnerHTML` except the JSON-LD helper, which must escape `<` (`\u003c`).
- **Dependency security**: `npm ci` with a committed lockfile, `npm audit --audit-level=high` in CI, Dependabot, CodeQL.
- **Input validation**: all external input (future forms, query params) is validated with Zod on the server. Add rate limiting before any form goes live.
- **External links**: `rel="noopener noreferrer"`.
- Public business contact info in `site.json` is intentional; do not add any personal data of clients or staff.

## 8. Content editing

- Contact, address, socials, service areas → `content/site.json`
- Add a project → add `content/projects/<slug>.json` + images in `public/images/projects/<slug>/`
- Copy/text → `content/i18n/en.json` and `id.json` (keys must match; a test enforces this)
- Values in `[brackets]` are placeholders awaiting real data. Never invent facts (client names, areas, years, testimonials).

## 9. Definition of done

- Issue linked, PR template checklist complete
- `npm run validate` passes locally and in CI
- No new ESLint warnings, no `any`, no `console.log`
- Works at 360px, 768px, 1440px; keyboard navigable
- EN and ID both updated
- README updated if features, stack, patterns, or env vars changed