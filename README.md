# studioJHWA website

**Classification: INTERNAL**

Company profile website for **studioJHWA**, an interior design and build studio in Surabaya and Malang, Indonesia. It is image-first (the portfolio is the product), bilingual (English at `/en`, Bahasa Indonesia at `/id`), statically generated, and built so non-developers can edit content as JSON. Brand tagline: "Formed by flow, built on principles."

`CLAUDE.md` is the working rulebook for this repo; this README is the map for people. If the two disagree, fix the mismatch in the same PR.

## Tech stack

| Area          | Choice                                                                           | Why                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router                                                            | Static generation per locale, image optimisation, metadata API.                                                      |
| Language      | TypeScript 6 (`strict`)                                                          | Catches content and prop mistakes at build. Pinned to the 6.0 line because typescript-eslint does not yet support 7. |
| Styling       | Tailwind CSS 4                                                                   | Design tokens defined once in `@theme` (`src/app/globals.css`); no CSS file per component.                           |
| Content       | JSON + Zod 4                                                                     | Non-developers edit JSON; the build fails with a readable error on mistakes.                                         |
| Fonts, images | `next/font` (Jost, self-hosted), `next/image`                                    | No layout shift, responsive sizes.                                                                                   |
| Tests         | Vitest (unit, content), Playwright (smoke, a11y, SEO, headers)                   | Fast checks on logic and content; real-browser checks on the built site.                                             |
| Quality       | ESLint 9 + jsx-a11y, Prettier + Tailwind plugin, Husky + lint-staged, commitlint | ESLint is pinned to 9.x because the jsx-a11y and react plugins do not yet support 10.                                |
| Release       | semantic-release                                                                 | Versions and changelog from Conventional Commits.                                                                    |
| Hosting       | Vercel (active); Docker + Caddy on a VPS (prepared, not active)                  | Zero-ops now, a self-hosted option ready.                                                                            |

## Features

- **Pages**: Home (Hero, Intro, Selected projects, film strip, "From line to light" slider, Rooms, Services, Built, FAQ, plus the contact call-to-action in the footer), Projects with a category filter, and a static Project detail page per project.
- **i18n**: `/en` and `/id`. The language switch keeps the current path (`/en/projects/rh-house` becomes `/id/projects/rh-house`). `/` redirects to `/en`. Unknown locales and slugs (for example `/fr`) return a real 404 through `src/app/global-not-found.tsx` behind the experimental Next flag `experimental.globalNotFound`. Re-check that flag on every Next upgrade.
- **SEO**: per-page titles (including "Jasa Desain Interior Surabaya" on the Indonesian pages), canonical URLs, hreflang, Open Graph and Twitter images, `sitemap.xml`, `robots.txt`, JSON-LD. OG images use the default font, not Jost.
- **Accessibility**: skip link, visible focus rings, `prefers-reduced-motion` support, 44px tap targets, alt text in both languages, checked at 360px, 768px and 1440px.
- **Security**: HTTP security headers, gitleaks, `npm audit`, Dependabot, CodeQL when the repo plan allows it. See [Security](#security).
- **CI/CD and release**: GitHub Actions on every PR; semantic-release on `main`; Vercel and VPS deployment. See [Git workflow and release](#git-workflow-and-release) and [Deployment](#deployment).

## Architecture and folder structure

```
content/                      ALL editable data (JSON only)
  site.json                   company, contact, address, socials, service areas, hours
  home.json                   home-page images with bilingual alt text
  projects/*.json             one file per project (file name = slug)
  i18n/en.json, id.json       UI copy and page meta (keys must match)
src/
  app/
    [lang]/                   locale routes: layout, home, projects, project detail,
                              not-found, opengraph/twitter images
    global-not-found.tsx      404 for URLs outside any locale
    sitemap.ts, robots.ts     generated from content and env
    api/health/route.ts       health check used by the VPS deploy
    globals.css               Tailwind entry and design tokens (@theme)
  components/
    ui/                       primitives: Container, Section, Heading, Button, TextLink,
                              Photo, CoveLight, ExternalLink
    layout/                   Header, Footer, Logo, SkipLink, MobileMenu, LangSwitch
    sections/                 Hero, Intro, SelectedProjects, FilmStrip, LineToLight/,
                              Rooms, Services, Built, Faq, ContactCta, ProjectFilter,
                              ProjectList, ProjectCard, project/ (detail-page parts)
  lib/
    content/                  repositories: the only code that reads JSON
    schemas/                  Zod schema for every JSON file
    seo/                      metadata, JSON-LD builders, OG image helper
    i18n/                     locales, path helpers, formatting
  config/
    env.ts                    typed env parsing (the only reader of process.env in the app)
    security-headers.ts       CSP and other headers, one place
    constants.ts
tests/
  unit/                       Vitest
  e2e/                        Playwright
  fixtures/content/           deliberately bad JSON used by content tests
public/images/                image sources (home/, projects/<slug>/)
docs/                         DEPLOYMENT.md, BRANCH_PROTECTION.md
.github/                      workflows, issue and PR templates, Dependabot
```

Other root files: `Dockerfile`, `docker-compose.yml`, `Caddyfile` (VPS), `.releaserc.json` (release), `commitlint.config.mjs`, `vitest.config.mts`, `playwright.config.ts`, `SECURITY.md`, `CHANGELOG.md` (generated).

## Design patterns and why

- **Repository pattern.** `src/lib/content/*` is the only code that reads JSON. Components call `getSite`, `getProjects`, `getProject`, `getDictionary`, `getHome`. Moving to a CMS later means changing repositories only.
- **Schema-first content.** Every JSON file has a Zod schema in `src/lib/schemas/`. Invalid content fails `npm run build` with a message naming the file and field.
- **Server/client split.** Pages and sections are server components. Only four small leaves are client components, each because it needs browser state: `LineToLight/Slider` (drag/keyboard slider), `ProjectFilter` (active category), `MobileMenu` (open/close), `LangSwitch` (reads the current path). The film strip is CSS-only.
- **Composition over configuration.** Sections are assembled from `ui/` primitives; no god components.
- **Single source of truth.** Design tokens in the Tailwind `@theme`, contact data in `site.json`, copy in `i18n/*.json`. No hard-coded colours, strings or contact info in components.
- **Typed config.** `src/config/env.ts` parses env with Zod and fails fast; `next.config.ts` is the documented exception because it runs outside the app.

## Editing content

Edit JSON, then run `npm run build` (or `npm run dev`); a mistake fails with a readable error. Values in `[brackets]` are placeholders awaiting real data. Never invent facts (client names, areas, years, testimonials).

### Contact, address, socials

In `content/site.json`:

```json
"contact": { "whatsapp": "6281234567890", "email": "hello@example.com" }
```

That is an example format, not real data. WhatsApp must be digits only, in international format, starting with `62` (no `+`, spaces or leading `0`). Email must be a valid address. Address, postal code (5 digits) and business hours follow the schema in `src/lib/schemas/site.ts`.

### Add a project

1. Copy `content/projects/rs-house.json` to `content/projects/<slug>.json`. The file name is the slug (kebab-case) and must equal the `slug` field.
2. Put images in `public/images/projects/<slug>/` and reference them as `/images/projects/<slug>/<file>.jpg` with alt text in both `en` and `id`.
3. Set `category` (`house`, `bedroom` or `kids`), a unique `order` (lowest first), and `featured` (`true` shows it in Selected projects on Home).
4. Optional: `gallery` entries, and a `drawing` object (`drawing` + `render` images) for the drawing/render pair. Empty sections are simply not rendered.

### Change copy

Edit the same key in both `content/i18n/en.json` and `content/i18n/id.json`. A test fails if the key sets differ.

### What `[PLACEHOLDER]` means

Any value in `[brackets]` is waiting for real data. Placeholders are omitted from JSON-LD and from meta descriptions, and the WhatsApp and email links are not rendered while those values are placeholders. Replace them with real values in `site.json` to switch the links and structured data on.

## Scripts

| Script                 | What it does                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`          | Next.js dev server on port 3000                                                                |
| `npm run build`        | Production build; also validates all content JSON                                              |
| `npm start`            | Serve the production build (`next start`)                                                      |
| `npm run typecheck`    | `tsc --noEmit`                                                                                 |
| `npm run lint`         | ESLint, zero warnings allowed                                                                  |
| `npm run format`       | Prettier, write                                                                                |
| `npm run format:check` | Prettier, check only                                                                           |
| `npm test`             | Vitest unit and content tests                                                                  |
| `npm run test:e2e`     | Playwright (builds and serves on port 3100; first run needs `npx playwright install chromium`) |
| `npm run validate`     | lint, typecheck, format:check, test, build. Run before every PR                                |
| `npm run prepare`      | Installs Husky hooks (runs automatically on `npm ci`)                                          |

## Git workflow and release

1. **Issue first.** Open a GitHub issue from a template in `.github/ISSUE_TEMPLATE/`. No code before an issue exists.
2. **Branch from `develop`**: `feat/<issue#>-slug`, `fix/...`, `chore/...`, `docs/...`.
3. **Conventional Commits** referencing the issue, for example `feat(projects): add filter (#12)`. commitlint enforces this on commit, and CI lints the PR title.
4. **PR into `develop`** using the PR template (`Closes #<issue>` plus the Definition of Done checklist). CI must be green. **Squash merge**; the PR title becomes the commit semantic-release reads.
5. **Release**: open a PR `develop` to `main` and merge it with a **merge commit** (not squash), so every Conventional Commit reaches `main`.
6. On push to `main`, `.github/workflows/release.yml` runs `npm run validate`, then semantic-release: computes the version, updates `package.json` and `CHANGELOG.md`, commits `chore(release): X.Y.Z [skip ci]`, tags `vX.Y.Z`, and publishes a GitHub Release. Then `develop` is fast-forwarded from `main`, or a sync PR is opened if `develop` has moved on.
7. semantic-release is **not** a project dependency. `release.yml` fetches it pinned through `npx -p` at release time, so `npm audit --audit-level=high` stays clean. Bump those pins by hand; Dependabot cannot see them.
8. **`RELEASE_TOKEN`** is a fine-grained PAT stored as an Actions secret; every release write uses it. Its settings and rotation are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#release_token).

The repo is private on the GitHub Free plan, so **branch protection is not applied**; "never commit directly to `main` or `develop`" is enforced by convention. See [docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) for the settings to apply later.

CI (`.github/workflows/ci.yml`) runs on PRs to `develop` and `main`: `pr-title`, `validate`, `audit`, `gitleaks` and `e2e`. Dependabot opens weekly PRs against `develop`.

## Environment variables

Copy `.env.example` to `.env.local` for local overrides. `.env*` is git-ignored except `.env.example`.

| Variable               | Values                                 | Default                 | Notes                                                                                                               |
| ---------------------- | -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | absolute URL, no trailing slash        | `http://localhost:3000` | Canonicals, sitemap, OG images, HSTS decision. **Required when `SITE_ENV=production`** (the build fails otherwise). |
| `SITE_ENV`             | `development`, `preview`, `production` | `development`           | Only `production` is indexable. Anything else sends `X-Robots-Tag: noindex` and a disallow-all `robots.txt`.        |
| `BUILD_STANDALONE`     | `1`                                    | unset                   | Build-time only. Set by the Dockerfile for standalone output; do not set it on Vercel.                              |

`NEXT_PUBLIC_SITE_URL` and `SITE_ENV` are read **at build time**: security headers and indexability are baked into the build. Changing them needs a new build or deployment, not a restart. Set them in the Vercel dashboard (per environment) or as Docker build args. Details in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Deployment

- **Vercel (active).** Import the repo, Production Branch `main`, set `NEXT_PUBLIC_SITE_URL` and `SITE_ENV=production` for Production and `SITE_ENV=preview` for Preview. No `vercel.json` is needed.
- **VPS (prepared, not active).** `Dockerfile`, `docker-compose.yml`, `Caddyfile` and a manual `Deploy to VPS` workflow (`workflow_dispatch`) build an image to GHCR, deploy over SSH and smoke-check `/api/health`.
- **Rollback**: Vercel promotes a previous deployment; the VPS re-runs the workflow with an earlier `image_tag`.

Full steps, required secrets and the rollback procedure: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Security

Controls, by risk area:

- **Secrets management**: no secrets in the repo, gitleaks on every PR.
- **HTTP security headers**: CSP, HSTS (https builds), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`, all in `src/config/security-headers.ts`. The CSP is a static allow-list with `script-src 'unsafe-inline'`, which App Router hydration needs without a per-request nonce. This was a deliberate trade-off to keep pages static; there are no third-party scripts and no user input.
- **Output encoding**: `dangerouslySetInnerHTML` appears only in the JSON-LD helper, which escapes `<`.
- **Dependency security**: committed lockfile, `npm ci`, `npm audit --audit-level=high` in CI, weekly Dependabot. CodeQL runs only if the repo becomes public (or the plan allows code scanning).

Vulnerability reporting and the full control table: [SECURITY.md](SECURITY.md).

## Contributing

Prerequisites: [nvm](https://github.com/nvm-sh/nvm) and Node 24 (`.nvmrc`; `engines.node` is `>=24`). The Git remote uses HTTPS; no SSH setup is required.

```bash
nvm use
npm ci
npm run dev        # http://localhost:3000, redirects to /en
```

**Definition of Done** (also in the PR template):

- Issue linked; PR checklist complete.
- `npm run validate` passes locally and in CI.
- No new ESLint warnings, no `any`, no `console.log`.
- Works at 360px, 768px and 1440px; keyboard navigable.
- EN and ID both updated.
- README updated if features, stack, patterns or env vars changed.

## License

[LICENSE — to be decided by studioJHWA]
