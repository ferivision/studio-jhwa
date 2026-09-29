# studioJHWA Website v1.0.0 Implementation Plan

**Classification: INTERNAL**

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the bilingual (EN/ID) studioJHWA company-profile website from an empty repo to an open (unmerged) `release: v1.0.0` PR, one GitHub issue and one PR per work item.

**Architecture:** Next.js App Router, fully statically generated under `src/app/[lang]`. All editable data lives in JSON under `content/`, validated by Zod in repository functions (`src/lib/content/*`) that are the only readers of that data. Server components compose sections from small `components/ui` primitives; only four client leaves exist (LineToLight slider, ProjectFilter, MobileMenu, LangSwitch). Security headers are static and live in `next.config.ts`.

**Tech Stack:** Node 24 LTS, Next.js 16.3.7, React 19.3.0, TypeScript 6.0.3 (strict), Tailwind CSS 4.3.3 (CSS-first `@theme`), Zod 4.6.5, ESLint 9.39.5 (flat) + eslint-config-next 16.3.7 + jsx-a11y, Prettier 3.9.9 + prettier-plugin-tailwindcss 0.8.1, Vitest 5.0.2, Playwright 1.63.0, Husky 9.1.7, lint-staged 17.6.0, commitlint 21.2.3, semantic-release 25.0.9.

**Spec:** The user's brief (pasted in the session on 2026-09-30, sections 0–6) plus `CLAUDE.md` (repo root) — together they are the approved spec. Visual source of truth: `reference/design-canvas/{home,projects,project-detail}.html` (local only, git-ignored).

## Global Constraints

- Node: `.nvmrc` = `24`; `package.json` `engines.node` = `>=24` (Next 16.3.7 requires `>=20.9.0`; we use current LTS).
- Versions: re-run `npm view <pkg> version` at install time; if newer than listed here, use the newer one **only** if peer deps still resolve (`npm install` with no `ERESOLVE`). Never guess a version.
- TypeScript is pinned to the 6.0 line (**not** 7.0.2) because `typescript-eslint@8.71.0` peers `typescript >=4.8.4 <6.1.0`.
- ESLint is pinned to 9.x (**not** 10.11.0) because `eslint-plugin-jsx-a11y@6.10.2` and `eslint-plugin-react` peer `eslint ≤ ^9`.
- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`; zero `any`; zero ESLint warnings (`--max-warnings=0`); no `console.log` (`no-console: error`).
- Languages: `en` (default) and `id`. Every user-visible string comes from `content/i18n/{en,id}.json`; every alt text exists in both languages.
- Placeholders: any value awaiting real data contains a bracketed token, e.g. `[PLACEHOLDER]`, `[City]`, `[YYYY]`, `[000] m²`. Never invent addresses, phone numbers, client names, testimonials, years.
- Colors, fonts, spacing only via Tailwind theme tokens in `src/app/globals.css` `@theme` — no hex values in components.
- Only these files may contain `"use client"`: `components/sections/LineToLight/Slider.tsx`, `components/sections/ProjectFilter.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/LangSwitch.tsx`.
- Only `src/config/env.ts` reads `process.env` (exception: `next.config.ts`, `playwright.config.ts`, which run outside the app).
- Only `src/lib/seo/JsonLd.tsx` uses `dangerouslySetInnerHTML`, and it escapes `<` as `<`.
- External links: `target="_blank" rel="noopener noreferrer"`.
- Must work at 360px (no horizontal scroll), 768px, 1440px; tap targets ≥ 44px; visible focus ring; `prefers-reduced-motion` disables animation.
- Git: branches `<type>/<issue#>-<slug>` from `develop`; Conventional Commits with `(#<issue>)`; PR into `develop` with `Closes #<issue>`; squash merge; never push to `main`/`develop` directly (release bot fast-forward is the only exception, see Task 12).
- Every shell session: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use` (the user's profile puts Node 16 first on PATH).
- Never `git add -A` / `git add .` before `.gitignore` covering `reference/` and `.idea/` is committed; after that, still check `git status --ignored` before the first commit of every task.

## Decisions (signed off by the user on 2026-09-30: D1 stay private + document, D2 static allow-list, execution subagent-driven)

- **D1 — Repo is private on the GitHub Free org plan.** Verified: `GET /repos/ferivision/studio-jhwa/branches/main/protection` → 403 "Upgrade to GitHub Pro or make this repository public". Code scanning (CodeQL) on private repos also requires a paid GitHub Advanced Security plan (ASSUMPTION: based on GitHub's published plan matrix; verify on the repo's Security tab). Default in this plan: stay private, write `docs/BRANCH_PROTECTION.md` for manual application, and ship the CodeQL workflow gated with `if: github.event.repository.visibility == 'public'` so it becomes active the moment the repo is public or upgraded. Alternatives: make the repo public (free protection + CodeQL) or upgrade (costs money — needs explicit approval).
- **D2 — CSP.** Recommended: a static strict allow-list in `next.config.ts` (`script-src 'self' 'unsafe-inline'`). Next's App Router emits inline hydration scripts, so without a nonce `'unsafe-inline'` is required; a nonce needs per-request middleware, which forces every page to render dynamically and gives up the static build (hurts the Lighthouse Performance target and the "static site" architecture). Risk is mitigated: no user input, no third-party scripts, single escaped JSON-LD sink, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
- **D3 — Vercel plan.** ASSUMPTION: Vercel's Hobby tier is limited to personal, non-commercial use; a company site likely needs Pro (paid). The plan only prepares config; the user creates the Vercel project.
- **D4 — Deviations from the design canvas, for accessibility (WCAG AA):**
  - Focus ring: design uses `#D9B77C` everywhere; glow on plaster is ~1.5:1 (fails 3:1 non-text contrast). Plan: ink ring on light sections, glow ring on dark sections.
  - Intro tag line "Design, production, installation. One team." is oak `#8C7359` on plaster, ~3.4:1 (fails 4.5:1 for 17px text). Plan: text in `ink`, prefixed by a short oak rule.
  - "Drawing" label uses CLAUDE.md token `drawing` `#B5483A` (≈5.6:1 on paper) instead of the canvas's `#8E3A2F`.
- **D5 — Additions not in the brief:** `content/home.json` (home-page images + bilingual alt text, so no image paths are hard-coded in sections); a bootstrap issue #1 so templates/CLAUDE.md/plan are committed via PR rather than directly to a protected branch; a fourth deploy secret `VPS_KNOWN_HOSTS` (pins the VPS host key; prevents SSH MITM); a PR-title commitlint check (squash merges use the PR title as the commit that semantic-release reads).

## Review Focus

1. **Placeholder contact data** (`"whatsapp": "[PLACEHOLDER]"`) — CTA must not produce a broken `https://wa.me/[PLACEHOLDER]` link, and JSON-LD must omit placeholder fields rather than publish `"[PLACEHOLDER]"` to Google. Pinned by `tests/unit/contact.test.ts` (Task 4) and `tests/unit/jsonld.test.ts` (Task 10).
2. **Unknown locale or slug** (`/fr`, `/en/projects/does-not-exist`) — must return HTTP 404, not a 500 or a blank page. Pinned by `tests/e2e/routing.spec.ts` (Task 6; slug case enabled in Task 9).
3. **Projects with no gallery and no drawing pair** (4 of 5 seed projects) — detail page must render without empty sections, headings with nothing under them, or broken images. Pinned by `tests/e2e/project-detail.spec.ts` (Task 9).
4. **Language switch on a deep page** (`/en/projects/rh-house` → `/id/projects/rh-house`) — must keep the path, not jump to the home page. Pinned by `tests/e2e/layout.spec.ts` (Task 6; deep URL from Task 9).
5. **360px viewport** — no horizontal page scroll on any route (film strip and big headings are the likely offenders). Pinned by `tests/e2e/responsive.spec.ts` (Task 7, extended in Tasks 8–9).

---

## File Structure (final state)

```
.editorconfig  .env.example  .gitignore  .nvmrc  .prettierrc.json  .prettierignore
.releaserc.json  commitlint.config.mjs  eslint.config.mjs  lint-staged.config.mjs
next.config.ts  package.json  package-lock.json  playwright.config.ts  postcss.config.mjs
tsconfig.json  vitest.config.ts  Dockerfile  docker-compose.yml  Caddyfile  .dockerignore
CHANGELOG.md (generated)  README.md  SECURITY.md  CLAUDE.md
.husky/pre-commit  .husky/commit-msg
.vscode/extensions.json  .vscode/settings.json
.github/ISSUE_TEMPLATE/{feature,bug,chore}.yml  .github/ISSUE_TEMPLATE/config.yml
.github/pull_request_template.md  .github/dependabot.yml
.github/workflows/{ci,codeql,release,deploy-vps}.yml
docs/BRANCH_PROTECTION.md  docs/DEPLOYMENT.md  docs/superpowers/plans/2026-09-30-studio-jhwa-v1.md
content/site.json  content/home.json  content/projects/{rh-house,rs-house,ny-nursery,ef-bedroom,nn-house}.json
content/i18n/{en,id}.json
public/images/home/*.jpg  public/images/projects/<slug>/*.jpg  public/favicon.svg
src/app/globals.css
src/app/[lang]/layout.tsx            root layout, <html lang>
src/app/[lang]/page.tsx              home
src/app/[lang]/not-found.tsx
src/app/[lang]/opengraph-image.tsx  src/app/[lang]/twitter-image.tsx
src/app/[lang]/projects/page.tsx
src/app/[lang]/projects/[slug]/page.tsx
src/app/[lang]/projects/[slug]/opengraph-image.tsx  .../twitter-image.tsx
src/app/sitemap.ts  src/app/robots.ts  src/app/api/health/route.ts
src/config/env.ts  src/config/constants.ts
src/lib/i18n/locales.ts             Locale type, isLocale, localizedPath, swapLocale
src/lib/schemas/{common,site,project,home,dictionary}.ts
src/lib/content/{errors,load,site,projects,home,dictionary,index}.ts
src/lib/content/contact.ts          whatsappHref, emailHref (placeholder-aware)
src/lib/seo/{metadata,jsonld,og}.ts(x)  src/lib/seo/JsonLd.tsx
src/components/ui/{Container,Section,Heading,Button,TextLink,Photo,CoveLight,ExternalLink}.tsx
src/components/layout/{Header,MobileMenu,LangSwitch,Footer,Logo,SkipLink}.tsx
src/components/sections/{Hero,Intro,SelectedProjects,ProjectCard,FilmStrip,Rooms,Services,Built,Faq,ContactCta,ProjectFilter,ProjectList}.tsx
src/components/sections/LineToLight/{LineToLight,Slider}.tsx
src/components/sections/project/{ProjectHero,ProjectSpecs,ProjectStory,ProjectGallery,DrawingPair,NextProject}.tsx
tests/unit/*.test.ts  tests/e2e/*.spec.ts  tests/setup/server-only.ts
```

Each file has one responsibility; sections never import JSON; `lib/content` is the only JSON reader.

---

## Task 0: Repository bootstrap (issue #1, before the 14 work items)

**Files:**
- Create: `.github/ISSUE_TEMPLATE/feature.yml`, `bug.yml`, `chore.yml`, `config.yml`, `.github/pull_request_template.md`, `docs/BRANCH_PROTECTION.md`
- Commit (already on disk, untracked): `CLAUDE.md`, `docs/superpowers/plans/2026-09-30-studio-jhwa-v1.md`

- [ ] **Step 1: Create `develop` and set it as default; set merge options**

```bash
cd /Users/refaldy.bagasmekari.com/Documents/self-project/studio-jhwa
git checkout main && git pull
git checkout -b develop && git push -u origin develop
gh repo edit ferivision/studio-jhwa --default-branch develop \
  --enable-squash-merge --enable-merge-commit --enable-rebase-merge=false \
  --delete-branch-on-merge
gh repo view ferivision/studio-jhwa --json defaultBranchRef --jq .defaultBranchRef.name
```
Expected: `develop`. (Merge commits stay enabled: releases `develop → main` use a merge commit per CLAUDE.md §6.)

- [ ] **Step 2: Try branch protection (expected to fail on the free private plan, D1)**

```bash
gh api -X PUT repos/ferivision/studio-jhwa/branches/main/protection --input - <<'JSON'
{"required_status_checks":{"strict":true,"contexts":["validate","e2e","audit","gitleaks","pr-title"]},
 "enforce_admins":false,
 "required_pull_request_reviews":{"required_approving_review_count":0},
 "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
JSON
```
Expected now: HTTP 403 "Upgrade to GitHub Pro or make this repository public". If it succeeds (user made repo public), repeat for `develop` and skip Step 3's "apply manually" wording.

- [ ] **Step 3: Write `docs/BRANCH_PROTECTION.md`**

```markdown
# Branch protection

**Classification: INTERNAL**

Status: **not applied**. The repository is private on the GitHub Free organization plan, where
branch protection and rulesets are unavailable (API returns 403). Apply these settings once the
repo is public or the org is on GitHub Team.

## Settings for `main` and `develop`

| Setting | Value |
| --- | --- |
| Require a pull request before merging | on (0 required approvals; 1 when a second maintainer joins) |
| Require status checks to pass | on, "require branches to be up to date" on |
| Required checks | `validate`, `e2e`, `audit`, `gitleaks`, `pr-title` (`codeql` once code scanning is available) |
| Allow force pushes | off |
| Allow deletions | off |
| Bypass list | the account that owns `RELEASE_TOKEN` (release bot), see docs/DEPLOYMENT.md#release |

## Apply with gh (run for both branches)

    for b in main develop; do
      gh api -X PUT repos/ferivision/studio-jhwa/branches/$b/protection --input - <<'JSON'
    {"required_status_checks":{"strict":true,"contexts":["validate","e2e","audit","gitleaks","pr-title"]},
     "enforce_admins":false,
     "required_pull_request_reviews":{"required_approving_review_count":0},
     "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
    JSON
    done

`enforce_admins:false` lets the admin-owned `RELEASE_TOKEN` push the release commit and the
`main → develop` fast-forward. Until protection is applied, the team rule in CLAUDE.md §6
("never commit directly to main or develop") is enforced by convention only.
```

- [ ] **Step 4: Create labels**

```bash
for l in "feat:0E8A16:New feature" "fix:D73A4A:Bug fix" "chore:C5DEF5:Tooling and maintenance" \
         "docs:0075CA:Documentation" "ci:5319E7:CI/CD" "security:B60205:Security hardening" \
         "content:FBCA04:Copy, projects, images" "design:D4C5F9:Visual design and UI"; do
  IFS=: read -r name color desc <<<"$l"
  gh label create "$name" --color "$color" --description "$desc" --force
done
gh label list
```
Expected: the 8 labels listed.

- [ ] **Step 5: Write issue templates**

`.github/ISSUE_TEMPLATE/feature.yml`:
```yaml
name: Feature
description: A new page, section, or capability
title: "feat: "
labels: [feat]
body:
  - type: textarea
    id: goal
    attributes: { label: Goal, description: What outcome does this deliver and for whom? }
    validations: { required: true }
  - type: textarea
    id: scope
    attributes: { label: Scope, description: What is in and explicitly out of scope? }
    validations: { required: true }
  - type: textarea
    id: acceptance
    attributes: { label: Acceptance criteria, description: Checklist of verifiable outcomes., value: "- [ ] " }
    validations: { required: true }
```
`.github/ISSUE_TEMPLATE/bug.yml`:
```yaml
name: Bug
description: Something is broken
title: "fix: "
labels: [fix]
body:
  - type: textarea
    id: what
    attributes: { label: What happened, description: Observed vs expected behaviour. }
    validations: { required: true }
  - type: textarea
    id: repro
    attributes: { label: Steps to reproduce, value: "1. " }
    validations: { required: true }
  - type: input
    id: env
    attributes: { label: Browser / device / viewport }
  - type: textarea
    id: acceptance
    attributes: { label: Acceptance criteria, value: "- [ ] " }
    validations: { required: true }
```
`.github/ISSUE_TEMPLATE/chore.yml`:
```yaml
name: Chore
description: Tooling, CI, dependencies, docs
title: "chore: "
labels: [chore]
body:
  - type: textarea
    id: goal
    attributes: { label: Goal }
    validations: { required: true }
  - type: textarea
    id: scope
    attributes: { label: Scope }
    validations: { required: true }
  - type: textarea
    id: acceptance
    attributes: { label: Acceptance criteria, value: "- [ ] " }
    validations: { required: true }
```
`.github/ISSUE_TEMPLATE/config.yml`:
```yaml
blank_issues_enabled: false
```

- [ ] **Step 6: Write `.github/pull_request_template.md` (Definition of Done from CLAUDE.md §9)**

```markdown
## Summary

<!-- What changed and why. -->

Closes #

## Definition of done

- [ ] Issue linked above, this checklist complete
- [ ] `npm run validate` passes locally and in CI
- [ ] No new ESLint warnings, no `any`, no `console.log`
- [ ] Works at 360px, 768px, 1440px; keyboard navigable
- [ ] EN and ID both updated
- [ ] README updated if features, stack, patterns, or env vars changed

## Screenshots (UI changes)

<!-- 360px and 1440px. -->
```

- [ ] **Step 7: Create bootstrap issue, branch, commit with explicit paths, PR, merge**

```bash
gh issue create --title "chore: repository bootstrap" --label chore --body $'## Goal\nCommit CLAUDE.md, issue/PR templates, branch-protection doc and the v1 implementation plan.\n\n## Scope\nRepo metadata only, no app code.\n\n## Acceptance criteria\n- [ ] Templates render on GitHub\n- [ ] docs/BRANCH_PROTECTION.md documents the manual settings\n- [ ] reference/ and .idea/ are not committed'
git checkout -b chore/1-repo-bootstrap
git add CLAUDE.md .github docs
git status --short   # must list ONLY CLAUDE.md, .github/**, docs/**
git commit -m "chore: add repo templates, CLAUDE.md and v1 plan (#1)"
git push -u origin chore/1-repo-bootstrap
gh pr create --base develop --title "chore: repository bootstrap" --body-file .github/pull_request_template.md
```
Edit the PR body to set `Closes #1` and tick applicable boxes (`gh pr edit --body ...`). No CI exists yet, so merge immediately: `gh pr merge --squash --delete-branch`.

- [ ] **Step 8: Create milestone and the 14 work-item issues (#2–#15), in order**

```bash
gh api -X POST repos/ferivision/studio-jhwa/milestones -f title=v1.0.0 -f description="First public release"
```
Then for each Task 1–14 below, run `gh issue create --title "<title>" --label <label> --milestone v1.0.0 --body "<Goal/Scope/Acceptance from that task's Issue block>"`. Record the numbers; they must be #2…#15 in task order. Tasks refer to issues as `#N` = task number + 1.

---

## Per-issue loop (applies to every Task 1–14)

```bash
git checkout develop && git pull
git checkout -b <type>/<issue#>-<slug>
# ... task steps, small Conventional Commits "type(scope): msg (#<issue>)" ...
npm run validate                                  # must be green (from Task 2 on)
git push -u origin HEAD
gh pr create --base develop --title "<type>(<scope>): <summary>" \
  --body "$(sed 's/^Closes #$/Closes #<issue>/' .github/pull_request_template.md)"
gh pr checks --watch                              # from Task 3 on
gh pr merge --squash --delete-branch
```
PR titles must be valid Conventional Commits (the squash commit uses it; semantic-release reads it). If CI fails: fix on the same branch, push, re-watch.

---

## Task 1 (issue #2): chore: project scaffold

**Issue:** Goal — runnable Next.js App Router + TS strict + Tailwind skeleton with the `src/` layout from CLAUDE.md. Scope — package.json, configs, dotfiles, placeholder home page; no content layer. Acceptance — `npm run build` succeeds; `/` redirects to `/en`; `git status --ignored` shows `reference/`, `.idea/`, `.next/`, `node_modules/` ignored; no env/key files tracked. Label `chore`. Branch `chore/2-project-scaffold`.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.nvmrc`, `.editorconfig`, `.env.example`, `.gitignore`, `.vscode/extensions.json`, `.vscode/settings.json`, `src/app/globals.css`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx`, `src/lib/i18n/locales.ts`, `src/types/css.d.ts`, `public/favicon.svg`

**Interfaces:**
- Produces: `Locale = "en" | "id"`, `locales`, `defaultLocale`, `isLocale(v: string): v is Locale` from `@/lib/i18n/locales`.

- [ ] **Step 1: `.gitignore` first (before anything else is created)**

```gitignore
# dependencies & builds
node_modules/
.next/
out/
build/
dist/
*.tsbuildinfo
next-env.d.ts

# env & secrets
.env
.env.*
.env*.local
!.env.example
*.pem
*.key

# testing & tooling output
coverage/
playwright-report/
test-results/
blob-report/
.lighthouseci/
.eslintcache

# deployment
.vercel/
caddy_data/
caddy_config/

# logs & OS/editor
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# local design reference (never committed)
reference/
```

- [ ] **Step 2: Dotfiles**

`.nvmrc`:
```
24
```
`.editorconfig`:
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```
`.env.example`:
```bash
# Public base URL used for canonical URLs, sitemap, OG images. No trailing slash.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# development | preview | production. Only "production" allows indexing (robots.txt).
SITE_ENV=development
```
`.vscode/extensions.json`:
```json
{ "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "bradlc.vscode-tailwindcss"] }
```
`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

- [ ] **Step 3: Install dependencies (verify versions first)**

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use
for p in next react react-dom tailwindcss @tailwindcss/postcss 'typescript@~6.0' @types/node @types/react @types/react-dom; do npm view "$p" version --no-update-notifier | tail -1; done
npm init -y >/dev/null
npm install --save-exact next@16.3.7 react@19.3.0 react-dom@19.3.0
npm install --save-exact -D typescript@6.0.3 @types/node@24 @types/react@19.3.0 @types/react-dom@19.3.0 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3
```
`@types/node@24` matches the runtime major (resolve to the latest 24.x). Expected: no `ERESOLVE`.

- [ ] **Step 4: Replace `package.json` scripts/metadata**

```json
{
  "name": "studio-jhwa",
  "version": "0.0.0-development",
  "private": true,
  "description": "studioJHWA company profile website",
  "license": "UNLICENSED",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```
(keep the `dependencies`/`devDependencies` npm wrote.)

- [ ] **Step 5: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", ".next/types/**/*.ts", "*.ts", "*.mjs"],
  "exclude": ["node_modules", "reference"]
}
```
Note: `next build` may rewrite `jsx` (Next 16 sets `react-jsx`); accept whatever it writes and commit it.

`src/types/css.d.ts` (so `tsc --noEmit` passes on a fresh clone where `next-env.d.ts` does not exist yet):
```ts
declare module "*.css";
```

- [ ] **Step 6: `next.config.ts`, `postcss.config.mjs`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
```
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```
`permanent: false` (307) so a later browser-language redirect remains possible without cached 308s.

- [ ] **Step 7: Locales helper**

`src/lib/i18n/locales.ts`:
```ts
export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

- [ ] **Step 8: Minimal `globals.css`, layout, page, favicon**

`src/app/globals.css`:
```css
@import "tailwindcss";
```
`src/app/[lang]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/locales";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
```
`src/app/[lang]/page.tsx`:
```tsx
export default function HomePage() {
  return <main>studioJHWA</main>;
}
```
`public/favicon.svg` — the logo mark from the design canvas header:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19.5" fill="#141210" stroke="#E6E2DB" stroke-opacity="0.35"/><path d="M12 10h4v9h2v11h-4v-9h-2z" fill="#E6E2DB"/><path d="M21 10h4v9h2v11h-4v-9h-2z" fill="#E6E2DB"/></svg>
```
Create empty dirs with `.gitkeep`: `content/`, `src/components/{ui,layout,sections}/`, `src/lib/{content,schemas,seo}/`, `src/config/`, `public/images/`.

- [ ] **Step 9: Verify build and redirect**

```bash
npm run typecheck && npm run build
npm run start -- -p 3100 & sleep 4
curl -sI http://localhost:3100/ | grep -iE '^(HTTP|location)'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3100/fr
kill %1
```
Expected: `HTTP/1.1 307`, `location: /en`; `/fr` → `404`.

- [ ] **Step 10: Ignore check, then commit**

```bash
git status --ignored --short | grep -E '^(!!|\?\?)'
```
Expected: `!! reference/`, `!! .idea/`, `!! .next/`, `!! node_modules/`, `!! next-env.d.ts`; `??` lines only for files listed in this task. No `.env` (only `.env.example`), no `*.pem`/`*.key`.
```bash
git add .
git status --short   # re-check: no reference/, .idea/, .env, .next
git commit -m "chore: scaffold Next.js app with TypeScript strict and Tailwind (#2)"
```
Then the per-issue loop (no `validate` script yet: run `npm run typecheck && npm run build`).

---

## Task 2 (issue #3): chore: code quality tooling

**Issue:** Goal — enforce lint/format/commit rules locally. Scope — ESLint flat config (Next + TS + jsx-a11y), Prettier + Tailwind plugin, Husky + lint-staged, commitlint, Vitest skeleton, `validate` script. Acceptance — `npm run validate` green; a commit with message `bad message` is rejected; a file with `console.log` fails lint. Label `chore`. Branch `chore/3-code-quality`.

**Files:**
- Create: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `lint-staged.config.mjs`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `vitest.config.ts`, `tests/setup/server-only.ts`, `tests/unit/locales.test.ts`
- Modify: `package.json` (scripts, devDeps)

**Interfaces:**
- Produces: scripts `lint`, `format`, `format:check`, `test`, `test:e2e` (usable from Task 6), `validate`.

- [ ] **Step 1: Verify and install**

```bash
for p in 'eslint@^9' eslint-config-next eslint-plugin-jsx-a11y prettier prettier-plugin-tailwindcss husky lint-staged @commitlint/cli @commitlint/config-conventional vitest vite-tsconfig-paths; do npm view "$p" version --no-update-notifier | tail -1; done
npm install --save-exact -D eslint@9.39.5 eslint-config-next@16.3.7 eslint-plugin-jsx-a11y@6.10.2 \
  prettier@3.9.9 prettier-plugin-tailwindcss@0.8.1 husky@9.1.7 lint-staged@17.6.0 \
  @commitlint/cli@21.2.3 @commitlint/config-conventional@21.2.3 vitest@5.0.2 vite-tsconfig-paths@6.1.1
```
`eslint-plugin-jsx-a11y` is already a dependency of `eslint-config-next`; installing it directly lets us import its rule set.

- [ ] **Step 2: `eslint.config.mjs`**

Check the current Next 16 ESLint docs (nextjs.org/docs/app/api-reference/config/eslint) for the flat-config import paths; as of 16.x they are `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // jsx-a11y plugin is already registered by eslint-config-next; add its strict rules only.
  { rules: { ...jsxA11y.flatConfigs.strict.rules } },
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "playwright-report/**", "test-results/**", "reference/**", "next-env.d.ts"]),
]);
```
If `eslint` reports "Cannot redefine plugin jsx-a11y", this rules-only form is already correct; if it reports the plugin is missing, add `plugins: { "jsx-a11y": jsxA11y }` to that object.

- [ ] **Step 3: Prettier**

`.prettierrc.json`:
```json
{
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app/globals.css",
  "tailwindFunctions": ["cn"]
}
```
`.prettierignore`:
```
.next
node_modules
coverage
playwright-report
test-results
reference
package-lock.json
CHANGELOG.md
```

- [ ] **Step 4: Vitest config + server-only shim**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: { alias: { "server-only": new URL("./tests/setup/server-only.ts", import.meta.url).pathname } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
```
`tests/setup/server-only.ts`:
```ts
// Vitest runs outside React Server Components; the real package throws on import.
export {};
```

- [ ] **Step 5: First unit test (failing until run once to prove the harness)**

`tests/unit/locales.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/locales";

describe("locales", () => {
  it("supports exactly en and id with en as default", () => {
    expect(locales).toEqual(["en", "id"]);
    expect(defaultLocale).toBe("en");
  });
  it("rejects unknown locales", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
```
Run: `npx vitest run` → Expected: 2 passed.

- [ ] **Step 6: Scripts**

Add to `package.json` `scripts`:
```json
"lint": "eslint . --max-warnings=0 --cache",
"format": "prettier --write .",
"format:check": "prettier --check .",
"test": "vitest run",
"test:e2e": "playwright test",
"validate": "npm run lint && npm run typecheck && npm run format:check && npm run test && npm run build",
"prepare": "husky"
```
(`test:e2e` works from Task 6, when Playwright is installed.)

- [ ] **Step 7: Husky, lint-staged, commitlint**

```bash
npx husky init
```
`.husky/pre-commit`:
```sh
npx lint-staged
```
`.husky/commit-msg`:
```sh
npx --no -- commitlint --edit "$1"
```
`lint-staged.config.mjs`:
```js
export default {
  "*.{ts,tsx,js,mjs}": ["eslint --max-warnings=0 --fix", "prettier --write"],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
};
```
`commitlint.config.mjs`:
```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "chore", "docs", "refactor", "test", "ci", "perf", "build", "style", "revert"]],
  },
};
```
Husky hooks run under the user's shell; if the commit hook picks up Node 16, add at the top of both hooks: `export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use --silent`.

- [ ] **Step 8: Prove the gates**

```bash
npm run format && npm run validate
echo 'console.log("x")' > src/tmp-lint.ts && npx eslint src/tmp-lint.ts; rm src/tmp-lint.ts
git add -A && git commit -m "bad message"
```
Expected: validate green; eslint reports `no-console`; commit rejected by commitlint (`subject may not be empty` / `type may not be empty`).
```bash
git commit -m "chore: add eslint, prettier, husky, lint-staged, commitlint, vitest (#3)"
```

---

## Task 3 (issue #4): ci: pull request pipeline

**Issue:** Goal — every PR to `develop`/`main` is validated automatically. Scope — `ci.yml` (validate, audit, gitleaks, pr-title), Dependabot, CodeQL (gated per D1). Acceptance — a PR shows the checks `validate`, `audit`, `gitleaks`, `pr-title` green; Dependabot config valid; CodeQL skipped (private) or green (public). Label `ci`. Branch `ci/4-pr-pipeline`.

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`

- [ ] **Step 1: Resolve action versions and SHAs (pin by SHA, Dependabot updates them)**

```bash
for r in actions/checkout actions/setup-node actions/upload-artifact github/codeql-action gitleaks/gitleaks; do
  tag=$(gh api repos/$r/releases/latest --jq .tag_name)
  sha=$(gh api repos/$r/git/ref/tags/$tag --jq .object.sha)
  echo "$r $tag $sha"
done
```
If a tag ref is an annotated tag (`object.type == "tag"`), dereference: `gh api repos/$r/git/tags/$sha --jq .object.sha`. Use each `uses: owner/repo@<sha> # <tag>` below. For gitleaks, record `<tag>` (e.g. `v8.x.y`) as `GITLEAKS_VERSION`.

- [ ] **Step 2: `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  pull_request:
    branches: [develop, main]
    types: [opened, synchronize, reopened, edited]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  pr-title:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: actions/setup-node@<sha> # <tag>
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - name: Lint PR title (becomes the squash commit)
        env: { TITLE: "${{ github.event.pull_request.title }}" }
        run: echo "$TITLE" | npx commitlint
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: actions/setup-node@<sha> # <tag>
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check
      - run: npm run test
      - run: npm run build
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: actions/setup-node@<sha> # <tag>
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm audit --audit-level=high
  gitleaks:
    runs-on: ubuntu-latest
    env: { GITLEAKS_VERSION: "<version without v>" }
    steps:
      - uses: actions/checkout@<sha> # <tag>
        with: { fetch-depth: 0 }
      - name: Install gitleaks (binary; the marketplace action needs a licence for org repos)
        run: |
          curl -sSfL -o gl.tgz "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
          curl -sSfL -o checksums.txt "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_checksums.txt"
          grep "linux_x64.tar.gz" checksums.txt | sed 's/ .*/  gl.tgz/' | sha256sum -c -
          tar -xzf gl.tgz gitleaks
      - run: ./gitleaks git --redact --verbose --exit-code 1
```
Verify the release asset and checksum file names against the actual release page before committing (`gh release view $GITLEAKS_TAG -R gitleaks/gitleaks --json assets --jq '.assets[].name'`). `edited` in `types` re-runs `pr-title` when the title is fixed.

- [ ] **Step 3: `.github/workflows/codeql.yml` (gated, D1)**

```yaml
name: CodeQL
on:
  pull_request: { branches: [develop, main] }
  push: { branches: [develop, main] }
  schedule: [{ cron: "0 2 * * 1" }]
permissions:
  contents: read
  security-events: write
jobs:
  codeql:
    if: github.event.repository.visibility == 'public'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: github/codeql-action/init@<sha> # <tag>
        with: { languages: javascript-typescript, queries: security-extended }
      - uses: github/codeql-action/analyze@<sha> # <tag>
```

- [ ] **Step 4: `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    target-branch: develop
    schedule: { interval: weekly, day: monday }
    open-pull-requests-limit: 10
    commit-message: { prefix: "chore(deps)", prefix-development: "chore(deps-dev)" }
    labels: [chore]
    groups:
      minor-and-patch: { update-types: [minor, patch] }
    ignore:
      # Pinned majors, see plan Global Constraints; revisit when peers allow.
      - { dependency-name: typescript, update-types: ["version-update:semver-major"] }
      - { dependency-name: eslint, update-types: ["version-update:semver-major"] }
  - package-ecosystem: github-actions
    directory: /
    target-branch: develop
    schedule: { interval: weekly, day: monday }
    commit-message: { prefix: "ci(deps)" }
    labels: [ci]
```

- [ ] **Step 5: Validate YAML locally, commit, open PR, watch checks**

```bash
npx prettier --check .github
npm run validate
git add .github && git commit -m "ci: add PR pipeline, dependabot and codeql (#4)"
```
Per-issue loop. Expected on the PR: `pr-title`, `validate`, `audit`, `gitleaks` green; `codeql` skipped. If `npm audit` fails on a Next transitive advisory, do **not** add `--omit`; record the advisory in the PR and fix it in Task 11 or by an `overrides` entry with justification.

---

## Task 4 (issue #5): feat: content layer

**Issue:** Goal — all editable data in validated JSON with typed repositories. Scope — `content/` JSON, Zod schemas, repositories, contact helpers, sample images, unit tests. Acceptance — `npm run test` proves: every content file matches its schema; en/id keys identical; slugs unique and equal to filenames; every referenced image exists in `public/`; invalid JSON fails with a message naming the file and field. Label `feat`. Branch `feat/5-content-layer`.

**Files:**
- Create: `content/site.json`, `content/home.json`, `content/projects/{rh-house,rs-house,ny-nursery,ef-bedroom,nn-house}.json`, `content/i18n/en.json`, `content/i18n/id.json`
- Create: `src/lib/schemas/{common,site,project,home,dictionary}.ts`
- Create: `src/lib/content/{errors,load,site,projects,home,dictionary,contact,index}.ts`
- Create: `src/lib/i18n/format.ts`; Modify: `src/lib/i18n/locales.ts`
- Create: `public/images/home/*.jpg`, `public/images/projects/<slug>/*.jpg`
- Test: `tests/unit/content.test.ts`, `tests/unit/contact.test.ts`, `tests/unit/i18n.test.ts`, `tests/fixtures/content/{bad-project.json,malformed.json}`

**Interfaces:**
- Consumes: `Locale`, `locales` from `@/lib/i18n/locales`.
- Produces (from `@/lib/content`):
  - `getSite(): Site`
  - `getHome(): Home`
  - `getProjects(): Project[]` (sorted by `order`)
  - `getProject(slug: string): Project | undefined`
  - `getFeaturedProjects(): Project[]`
  - `getNextProject(slug: string): Project` (wraps to first)
  - `getDictionary(lang: Locale): Dictionary`
  - `whatsappHref(site: Site): string | null`, `emailHref(site: Site): string | null`
- Produces (from `@/lib/schemas/*`): types `Site`, `Home`, `Project`, `Category = "house" | "bedroom" | "kids"`, `ImageContent = { src: string; alt: Localized; position?: string }`, `Localized = { en: string; id: string }`, `Dictionary`; function `isPlaceholder(value: string): boolean`.
- Produces (from `@/lib/i18n/locales`): `localizedPath(lang: Locale, path?: string): string`, `swapLocale(pathname: string, target: Locale): string`, `pick(value: Localized, lang: Locale): string`.
- Produces (from `@/lib/i18n/format`): `format(template: string, vars: Record<string, string | number>): string`.

- [ ] **Step 1: Install Zod and server-only**

```bash
npm view zod version --no-update-notifier; npm view server-only version --no-update-notifier
npm install --save-exact zod@4.6.5 server-only@0.0.1
```

- [ ] **Step 2: Copy sample images (from git-ignored `reference/images/`)**

```bash
mkdir -p public/images/home public/images/projects/{rh-house,rs-house,ny-nursery,ef-bedroom,nn-house}
R=reference/images
cp $R/{dining,workroom2,motif,living,kitchen_sq,work,bunk,iso,kitchen,drawing}.jpg public/images/home/
cp $R/{living,dining,kitchen,workroom2,motif,bunk,work,drawing,kitchen_sq}.jpg public/images/projects/rh-house/
cp $R/workroom2.jpg public/images/projects/rs-house/
cp $R/bunk.jpg public/images/projects/ny-nursery/
cp $R/work.jpg public/images/projects/ef-bedroom/
cp $R/kitchen.jpg public/images/projects/nn-house/
```
Remove the `.gitkeep` in `public/images/`.

- [ ] **Step 3: Write the failing tests**

`tests/unit/i18n.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { localizedPath, pick, swapLocale } from "@/lib/i18n/locales";
import { format } from "@/lib/i18n/format";

describe("localizedPath", () => {
  it("prefixes the locale", () => {
    expect(localizedPath("en")).toBe("/en");
    expect(localizedPath("id", "/projects")).toBe("/id/projects");
  });
});

describe("swapLocale", () => {
  it("keeps the rest of the path", () => {
    expect(swapLocale("/en/projects/rh-house", "id")).toBe("/id/projects/rh-house");
    expect(swapLocale("/id", "en")).toBe("/en");
  });
  it("falls back to the locale root for paths without a locale", () => {
    expect(swapLocale("/", "id")).toBe("/id");
    expect(swapLocale("/fr/x", "id")).toBe("/id");
  });
});

describe("pick", () => {
  it("returns the value for the locale", () => {
    expect(pick({ en: "House", id: "Rumah" }, "id")).toBe("Rumah");
  });
});

describe("format", () => {
  it("replaces named tokens and leaves unknown ones", () => {
    expect(format("{count} projects", { count: 3 })).toBe("3 projects");
    expect(format("{name} in {city}", { name: "RH" })).toBe("RH in {city}");
  });
});
```
`tests/unit/contact.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { emailHref, getSite, whatsappHref } from "@/lib/content";
import type { Site } from "@/lib/schemas/site";

const base = getSite();
const withContact = (whatsapp: string, email: string): Site => ({ ...base, contact: { whatsapp, email } });

describe("contact links", () => {
  it("returns null for placeholder values instead of broken links", () => {
    const site = withContact("[PLACEHOLDER]", "[PLACEHOLDER]");
    expect(whatsappHref(site)).toBeNull();
    expect(emailHref(site)).toBeNull();
  });
  it("builds wa.me and mailto links for real values", () => {
    const site = withContact("6281200000000", "hello@example.com");
    expect(whatsappHref(site)).toBe("https://wa.me/6281200000000");
    expect(emailHref(site)).toBe("mailto:hello@example.com");
  });
});
```
`tests/unit/content.test.ts`:
```ts
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getDictionary, getHome, getProjects, getSite } from "@/lib/content";
import { readJson } from "@/lib/content/load";
import { projectSchema } from "@/lib/schemas/project";
import type { ImageContent } from "@/lib/schemas/common";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => {
      const p = prefix ? `${prefix}.${k}` : k;
      return [p, ...keyPaths(v, p)];
    });
  }
  return [];
}

describe("content files", () => {
  it("site.json, home.json and both dictionaries match their schemas", () => {
    expect(() => getSite()).not.toThrow();
    expect(() => getHome()).not.toThrow();
    expect(() => getDictionary("en")).not.toThrow();
    expect(() => getDictionary("id")).not.toThrow();
  });

  it("every project file matches the schema", () => {
    const files = readdirSync("content/projects").filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThanOrEqual(5);
    expect(getProjects()).toHaveLength(files.length);
  });

  it("en and id dictionaries have identical keys (including array lengths)", () => {
    expect(keyPaths(getDictionary("id")).sort()).toEqual(keyPaths(getDictionary("en")).sort());
  });

  it("project slugs are unique and match their file names", () => {
    const projects = getProjects();
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(existsSync(`content/projects/${slug}.json`)).toBe(true);
  });

  it("every referenced image exists in public/", () => {
    const home = getHome();
    const images: ImageContent[] = [
      home.hero, home.intro.primary, home.intro.secondary, ...home.filmStrip,
      home.lineToLight.drawing, home.lineToLight.render, ...home.rooms,
      home.services.design, home.services.visualize, home.services.build,
      ...getProjects().flatMap((p) => [p.cover, ...p.gallery, ...(p.drawing ? [p.drawing.drawing, p.drawing.render] : [])]),
    ];
    const missing = images.map((i) => i.src).filter((src) => !existsSync(path.join("public", src)));
    expect(missing).toEqual([]);
  });
});

describe("invalid content", () => {
  const fixtures = path.resolve("tests/fixtures/content");

  it("names the file and the failing field", () => {
    expect(() => readJson("bad-project.json", projectSchema, fixtures)).toThrowError(
      /content\/bad-project\.json[\s\S]*category/,
    );
  });

  it("reports malformed JSON with the file name", () => {
    expect(() => readJson("malformed.json", z.object({}), fixtures)).toThrowError(/content\/malformed\.json/);
  });
});
```
`tests/fixtures/content/bad-project.json`:
```json
{ "slug": "bad", "name": "Bad", "category": "garage" }
```
`tests/fixtures/content/malformed.json`:
```
{ "slug": "oops",
```
Add `tests/fixtures` to `.prettierignore` (malformed JSON cannot be formatted).

Run: `npm run test` → Expected: FAIL, "Cannot find module '@/lib/content'".

- [ ] **Step 4: Schemas**

`src/lib/schemas/common.ts`:
```ts
import { z } from "zod";

/** Values awaiting real data contain a bracketed token, e.g. "[PLACEHOLDER]", "[City]". */
export const PLACEHOLDER_PATTERN = /\[[^\]]+\]/;
export const isPlaceholder = (value: string): boolean => PLACEHOLDER_PATTERN.test(value);
export const placeholder = z.string().regex(/^\[[^\]]+\]$/, "must be a [PLACEHOLDER] token");

export const text = z.string().trim().min(1);
export const localized = z.strictObject({ en: text, id: text });
export type Localized = z.infer<typeof localized>;

export const imagePath = z
  .string()
  .regex(/^\/images\/[a-z0-9/_-]+\.(jpe?g|png|webp|avif)$/, "must be a path under /images/, e.g. /images/projects/rh-house/cover.jpg");

export const imageContent = z.strictObject({
  src: imagePath,
  alt: localized,
  position: z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'must look like "50% 40%"').optional(),
});
export type ImageContent = z.infer<typeof imageContent>;
```
`src/lib/schemas/site.ts`:
```ts
import { z } from "zod";
import { localized, placeholder, text } from "./common";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'must be "HH:MM"');
const day = z.enum(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]);

export const siteSchema = z.strictObject({
  name: text,
  legalName: text,
  tagline: text,
  description: localized,
  contact: z.strictObject({
    whatsapp: z.union([
      placeholder,
      z.string().regex(/^62\d{8,13}$/, "WhatsApp must be digits in international format, e.g. 6281234567890"),
    ]),
    email: z.union([placeholder, z.email()]),
  }),
  address: z.strictObject({
    street: text,
    city: text,
    region: text,
    postalCode: z.union([placeholder, z.string().regex(/^\d{5}$/, "must be a 5-digit postal code")]),
    country: z.literal("ID"),
    geo: z.strictObject({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  }),
  serviceAreas: z.array(text).min(1),
  socials: z.array(z.strictObject({ platform: z.enum(["instagram"]), handle: text, url: z.url() })),
  businessHours: z.array(
    z.strictObject({
      days: z.union([placeholder, z.array(day).min(1)]),
      opens: z.union([placeholder, time]),
      closes: z.union([placeholder, time]),
    }),
  ),
});
export type Site = z.infer<typeof siteSchema>;
```
`src/lib/schemas/project.ts`:
```ts
import { z } from "zod";
import { imageContent, localized, placeholder, text } from "./common";

export const categories = ["house", "bedroom", "kids"] as const;
export const categorySchema = z.enum(categories);
export type Category = z.infer<typeof categorySchema>;

export const projectSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case"),
  name: text,
  category: categorySchema,
  type: localized,
  city: text,
  year: z.union([placeholder, z.string().regex(/^\d{4}$/, "must be a 4-digit year")]),
  area: text,
  duration: localized,
  scope: localized,
  summary: localized,
  brief: localized,
  approach: localized,
  cover: imageContent,
  gallery: z.array(imageContent),
  drawing: z.strictObject({ drawing: imageContent, render: imageContent }).optional(),
  featured: z.boolean(),
  order: z.number().int().positive(),
});
export type Project = z.infer<typeof projectSchema>;
```
`src/lib/schemas/home.ts`:
```ts
import { z } from "zod";
import { imageContent } from "./common";

export const roomKeys = ["living", "kitchen", "workspace", "kids"] as const;

export const homeSchema = z.strictObject({
  hero: imageContent,
  intro: z.strictObject({ primary: imageContent, secondary: imageContent }),
  filmStrip: z.array(imageContent.extend({ ratio: z.number().positive().max(3) })).min(3),
  lineToLight: z.strictObject({ drawing: imageContent, render: imageContent }),
  rooms: z.array(imageContent.extend({ key: z.enum(roomKeys) })).length(4),
  services: z.strictObject({ design: imageContent, visualize: imageContent, build: imageContent }),
});
export type Home = z.infer<typeof homeSchema>;
```
`src/lib/schemas/dictionary.ts`:
```ts
import { z } from "zod";
import { text as s } from "./common";

const titled = z.strictObject({ title: s, body: s });
const meta = z.strictObject({ title: s, description: s });

export const dictionarySchema = z.strictObject({
  meta: z.strictObject({
    home: meta,
    projects: meta,
    /** Templates: {name}, {type}, {city}. */
    project: meta,
    ogAlt: s,
  }),
  a11y: z.strictObject({ skipToContent: s, mainNav: s, openMenu: s, closeMenu: s, menu: s }),
  nav: z.strictObject({ projects: s, services: s, rooms: s, faq: s, cta: s }),
  lang: z.strictObject({ en: s, id: s }),
  hero: z.strictObject({ eyebrow: s, line1: s, line2: s, primary: s, secondary: s }),
  intro: z.strictObject({ lead: s, leadEm: s, body: s, tag: s }),
  selected: z.strictObject({ title: s, viewAll: s }),
  strip: z.strictObject({ label: s, title: s, viewAll: s }),
  lineToLight: z.strictObject({ title: s, body: s, label: s, render: s, drawing: s }),
  rooms: z.strictObject({ label: s, living: s, kitchen: s, workspace: s, kids: s }),
  services: z.strictObject({ title: s, lead: s, design: titled, visualize: titled, build: titled }),
  built: z.strictObject({
    title: s, lead: s, before: s, after: s, beforePlaceholder: s, afterPlaceholder: s, quote: s, cite: s,
  }),
  faq: z.strictObject({ title: s, items: z.array(z.strictObject({ q: s, a: s })).min(1) }),
  contact: z.strictObject({
    line1: s, line2: s, cta: s, whatsapp: s, email: s, instagram: s, studio: s, studioValue: s,
  }),
  footer: z.strictObject({ tagline: s }),
  projectsPage: z.strictObject({
    title1: s, title2: s, lead: s, filterLabel: s,
    filters: z.strictObject({ all: s, house: s, bedroom: s, kids: s }),
    /** Template: {count}. */
    resultCount: s,
    empty: s,
  }),
  project: z.strictObject({
    back: s, location: s, type: s, area: s, scope: s, duration: s, year: s,
    brief: s, approach: s, drawing: s, finished: s, next: s, detail: s,
  }),
  notFound: z.strictObject({ title: s, body: s, home: s }),
  breadcrumb: z.strictObject({ home: s, projects: s }),
});
export type Dictionary = z.infer<typeof dictionarySchema>;
```

- [ ] **Step 5: i18n helpers**

Append to `src/lib/i18n/locales.ts`:
```ts
import type { Localized } from "@/lib/schemas/common";

export function localizedPath(lang: Locale, path = ""): string {
  return `/${lang}${path}`;
}

/** "/en/projects/x" → "/id/projects/x". Paths without a known locale go to the target root. */
export function swapLocale(pathname: string, target: Locale): string {
  const [, first = "", ...rest] = pathname.split("/");
  if (!isLocale(first)) return `/${target}`;
  return ["", target, ...rest].join("/");
}

export function pick(value: Localized, lang: Locale): string {
  return value[lang];
}
```
(Move the `import type` to the top of the file.)

`src/lib/i18n/format.ts`:
```ts
/** format("{count} projects", { count: 3 }) → "3 projects". Unknown tokens are left as-is. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => (key in vars ? String(vars[key]) : token));
}
```

- [ ] **Step 6: Repositories**

`src/lib/content/errors.ts`:
```ts
export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in content/${file}:\n${detail}`);
    this.name = "ContentError";
  }
}
```
`src/lib/content/load.ts`:
```ts
import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ContentError } from "./errors";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export function readJson<T extends z.ZodType>(relativePath: string, schema: T, baseDir = CONTENT_DIR): z.infer<T> {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path.join(baseDir, relativePath), "utf8"));
  } catch (error) {
    throw new ContentError(relativePath, error instanceof Error ? error.message : String(error));
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new ContentError(relativePath, z.prettifyError(result.error));
  return result.data;
}

export function listJson(relativeDir: string, baseDir = CONTENT_DIR): string[] {
  return readdirSync(path.join(baseDir, relativeDir))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.posix.join(relativeDir, file));
}
```
`src/lib/content/site.ts`:
```ts
import "server-only";
import { siteSchema, type Site } from "@/lib/schemas/site";
import { readJson } from "./load";

export function getSite(): Site {
  return readJson("site.json", siteSchema);
}
```
`src/lib/content/home.ts`:
```ts
import "server-only";
import { homeSchema, type Home } from "@/lib/schemas/home";
import { readJson } from "./load";

export function getHome(): Home {
  return readJson("home.json", homeSchema);
}
```
`src/lib/content/dictionary.ts`:
```ts
import "server-only";
import type { Locale } from "@/lib/i18n/locales";
import { dictionarySchema, type Dictionary } from "@/lib/schemas/dictionary";
import { readJson } from "./load";

export function getDictionary(lang: Locale): Dictionary {
  return readJson(`i18n/${lang}.json`, dictionarySchema);
}
```
`src/lib/content/projects.ts`:
```ts
import "server-only";
import path from "node:path";
import { projectSchema, type Project } from "@/lib/schemas/project";
import { ContentError } from "./errors";
import { listJson, readJson } from "./load";

export function getProjects(): Project[] {
  const projects = listJson("projects").map((file) => {
    const project = readJson(file, projectSchema);
    if (path.posix.basename(file, ".json") !== project.slug) {
      throw new ContentError(file, `slug "${project.slug}" must match the file name`);
    }
    return project;
  });
  const orders = projects.map((p) => p.order);
  if (new Set(orders).size !== orders.length) {
    throw new ContentError("projects/", "every project needs a unique \"order\" value");
  }
  return projects.sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getNextProject(slug: string): Project {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  if (!next) throw new ContentError("projects/", "at least one project is required");
  return next;
}
```
`src/lib/content/contact.ts`:
```ts
import { isPlaceholder } from "@/lib/schemas/common";
import type { Site } from "@/lib/schemas/site";

export function whatsappHref(site: Site): string | null {
  const number = site.contact.whatsapp;
  return isPlaceholder(number) ? null : `https://wa.me/${number}`;
}

export function emailHref(site: Site): string | null {
  const email = site.contact.email;
  return isPlaceholder(email) ? null : `mailto:${email}`;
}
```
`src/lib/content/index.ts`:
```ts
export { getSite } from "./site";
export { getHome } from "./home";
export { getDictionary } from "./dictionary";
export { getProjects, getProject, getFeaturedProjects, getNextProject } from "./projects";
export { whatsappHref, emailHref } from "./contact";
export { ContentError } from "./errors";
```

- [ ] **Step 7: Content JSON**

`content/site.json`:
```json
{
  "name": "studioJHWA",
  "legalName": "[PLACEHOLDER]",
  "tagline": "Formed by flow, built on principles.",
  "description": {
    "en": "Interior design and build studio in Surabaya and Malang. We design, produce custom furniture, and install, so your space is ready to live in.",
    "id": "Jasa desain interior dan build di Surabaya dan Malang. Dari desain, produksi furnitur custom, sampai pemasangan, ruangmu siap ditempati."
  },
  "contact": { "whatsapp": "[PLACEHOLDER]", "email": "[PLACEHOLDER]" },
  "address": {
    "street": "[PLACEHOLDER]",
    "city": "[PLACEHOLDER]",
    "region": "Jawa Timur",
    "postalCode": "[PLACEHOLDER]",
    "country": "ID"
  },
  "serviceAreas": ["Surabaya", "Malang"],
  "socials": [{ "platform": "instagram", "handle": "@studio.jhwa", "url": "https://instagram.com/studio.jhwa" }],
  "businessHours": [{ "days": "[PLACEHOLDER]", "opens": "[PLACEHOLDER]", "closes": "[PLACEHOLDER]" }]
}
```
(Surabaya and Malang are both in Jawa Timur; the studio's cities come from CLAUDE.md §1.)

`content/home.json`:
```json
{
  "hero": {
    "src": "/images/home/dining.jpg",
    "alt": { "en": "Dining room with a linear pendant light and dark timber table", "id": "Ruang makan dengan lampu gantung linear dan meja kayu gelap" },
    "position": "50% 40%"
  },
  "intro": {
    "primary": { "src": "/images/home/workroom2.jpg", "alt": { "en": "Working room with dark door and timber desk", "id": "Ruang kerja dengan pintu gelap dan meja kayu" } },
    "secondary": { "src": "/images/home/motif.jpg", "alt": { "en": "Organic black and bone motif panel", "id": "Panel motif organik hitam dan putih tulang" } }
  },
  "filmStrip": [
    { "src": "/images/home/living.jpg", "ratio": 0.889, "alt": { "en": "Living area with wall panels and TV backdrop", "id": "Ruang keluarga dengan panel dinding dan TV backdrop" } },
    { "src": "/images/home/dining.jpg", "ratio": 1.228, "alt": { "en": "Dining area with a linear pendant light", "id": "Ruang makan dengan lampu gantung linear" } },
    { "src": "/images/home/kitchen_sq.jpg", "ratio": 1.022, "alt": { "en": "Kitchen with timber cabinets and cove lighting", "id": "Dapur dengan kabinet kayu dan lampu cove" } },
    { "src": "/images/home/work.jpg", "ratio": 1.111, "alt": { "en": "Minimalist desk in dark timber with a monitor", "id": "Meja kerja minimalis kayu gelap dengan monitor" } },
    { "src": "/images/home/bunk.jpg", "ratio": 1.322, "alt": { "en": "Kids room with red-framed bunk bed", "id": "Kamar anak dengan bunk bed rangka merah" } },
    { "src": "/images/home/iso.jpg", "ratio": 1.392, "alt": { "en": "Isometric drawing of an interior", "id": "Gambar isometrik interior" } },
    { "src": "/images/home/workroom2.jpg", "ratio": 1.175, "alt": { "en": "Working room with timber desk", "id": "Ruang kerja dengan meja kayu" } },
    { "src": "/images/home/kitchen.jpg", "ratio": 1.264, "alt": { "en": "Pantry with timber cabinets and strip lighting", "id": "Pantry dengan kabinet kayu dan lampu strip" } },
    { "src": "/images/home/motif.jpg", "ratio": 1.003, "alt": { "en": "Black and bone motif panel", "id": "Panel motif hitam dan putih tulang" } }
  ],
  "lineToLight": {
    "drawing": { "src": "/images/home/drawing.jpg", "alt": { "en": "Isometric line drawing of the kitchen", "id": "Gambar garis isometrik dapur" } },
    "render": { "src": "/images/home/kitchen_sq.jpg", "alt": { "en": "Finished kitchen render with timber cabinets and cove lighting", "id": "Render dapur jadi dengan kabinet kayu dan lampu cove" } }
  },
  "rooms": [
    { "key": "living", "src": "/images/home/living.jpg", "position": "50% 60%", "alt": { "en": "Living room with wall panels", "id": "Ruang keluarga dengan panel dinding" } },
    { "key": "kitchen", "src": "/images/home/kitchen_sq.jpg", "alt": { "en": "Kitchen with timber cabinets", "id": "Dapur dengan kabinet kayu" } },
    { "key": "workspace", "src": "/images/home/workroom2.jpg", "position": "60% 50%", "alt": { "en": "Workspace with timber desk", "id": "Ruang kerja dengan meja kayu" } },
    { "key": "kids", "src": "/images/home/bunk.jpg", "position": "40% 50%", "alt": { "en": "Kids room with bunk bed", "id": "Kamar anak dengan bunk bed" } }
  ],
  "services": {
    "design": { "src": "/images/home/drawing.jpg", "alt": { "en": "Technical drawing of an interior", "id": "Gambar teknis interior" } },
    "visualize": { "src": "/images/home/kitchen_sq.jpg", "alt": { "en": "3D render of a kitchen", "id": "Render 3D dapur" } },
    "build": { "src": "/images/home/bunk.jpg", "alt": { "en": "Finished kids room with a custom bunk bed", "id": "Kamar anak jadi dengan bunk bed custom" } }
  }
}
```

Shared placeholder text for all projects (copy verbatim into each file):
- `summary`: `{"en": "[One-line summary of the project, e.g. a family home designed around warm light.]", "id": "[Ringkasan proyek dalam satu kalimat, mis. rumah keluarga yang dirancang dengan cahaya hangat.]"}`
- `brief`: `{"en": "[Who the client is, how they live, and what wasn't working in the space before. Two to four sentences.]", "id": "[Siapa kliennya, bagaimana mereka tinggal, dan apa yang kurang dari ruang sebelumnya. Dua sampai empat kalimat.]"}`
- `approach`: `{"en": "[The key design decisions: layout changes, lighting, storage, materials. Two to four sentences.]", "id": "[Keputusan desain utama: perubahan layout, pencahayaan, storage, material. Dua sampai empat kalimat.]"}`
- `scope`: `{"en": "[Design, production, installation]", "id": "[Desain, produksi, pemasangan]"}`

`content/projects/rh-house.json`:
```json
{
  "slug": "rh-house",
  "name": "RH House",
  "category": "house",
  "type": { "en": "Residential house", "id": "Rumah tinggal" },
  "city": "[City]",
  "year": "[YYYY]",
  "area": "[000] m²",
  "duration": { "en": "[X] months", "id": "[X] bulan" },
  "scope": { "en": "[Design, production, installation]", "id": "[Desain, produksi, pemasangan]" },
  "summary": { "en": "[One-line summary of the project, e.g. a family home designed around warm light.]", "id": "[Ringkasan proyek dalam satu kalimat, mis. rumah keluarga yang dirancang dengan cahaya hangat.]" },
  "brief": { "en": "[Who the client is, how they live, and what wasn't working in the space before. Two to four sentences.]", "id": "[Siapa kliennya, bagaimana mereka tinggal, dan apa yang kurang dari ruang sebelumnya. Dua sampai empat kalimat.]" },
  "approach": { "en": "[The key design decisions: layout changes, lighting, storage, materials. Two to four sentences.]", "id": "[Keputusan desain utama: perubahan layout, pencahayaan, storage, material. Dua sampai empat kalimat.]" },
  "cover": {
    "src": "/images/projects/rh-house/living.jpg",
    "position": "50% 55%",
    "alt": { "en": "RH House living area with wall panels, TV backdrop and round coffee tables", "id": "Ruang keluarga RH House dengan panel dinding, TV backdrop, dan meja kopi bundar" }
  },
  "gallery": [
    { "src": "/images/projects/rh-house/dining.jpg", "position": "50% 45%", "alt": { "en": "Dining area with linear pendant and timber table", "id": "Ruang makan dengan lampu gantung linear dan meja kayu" } },
    { "src": "/images/projects/rh-house/kitchen.jpg", "alt": { "en": "Pantry joinery with strip lighting", "id": "Kabinet pantry dengan lampu strip" } },
    { "src": "/images/projects/rh-house/workroom2.jpg", "alt": { "en": "Working room with timber desk", "id": "Ruang kerja dengan meja kayu" } },
    { "src": "/images/projects/rh-house/motif.jpg", "alt": { "en": "Statement motif panel in black and bone", "id": "Panel motif hitam dan putih tulang" } },
    { "src": "/images/projects/rh-house/bunk.jpg", "alt": { "en": "Kids room with red-framed bunk bed", "id": "Kamar anak dengan bunk bed rangka merah" } },
    { "src": "/images/projects/rh-house/work.jpg", "alt": { "en": "Desk corner with timber and monitor", "id": "Sudut meja kerja kayu dengan monitor" } }
  ],
  "drawing": {
    "drawing": { "src": "/images/projects/rh-house/drawing.jpg", "alt": { "en": "Isometric line drawing of the kitchen", "id": "Gambar garis isometrik dapur" } },
    "render": { "src": "/images/projects/rh-house/kitchen_sq.jpg", "alt": { "en": "Finished kitchen render, same angle", "id": "Render dapur jadi, sudut yang sama" } }
  },
  "featured": true,
  "order": 1
}
```
The other four files use the same shared placeholder `summary`/`brief`/`approach`/`scope` values, `"city": "[City]"`, `"year": "[YYYY]"`, `"gallery": []`, no `drawing`, `"featured": true`, and:

| file | name | category | type en / id | area | duration en / id | cover src | cover alt en / id | order |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `rs-house.json` | RS House | house | Residential house / Rumah tinggal | `[000] m²` | `[X] months` / `[X] bulan` | `/images/projects/rs-house/workroom2.jpg` | RS House working room with dark door and timber desk / Ruang kerja RS House dengan pintu gelap dan meja kayu | 2 |
| `ny-nursery.json` | NY Nursery | kids | Kids room / Kamar anak | `[00] m²` | `[X] weeks` / `[X] minggu` | `/images/projects/ny-nursery/bunk.jpg` | NY Nursery kids room with red-framed bunk bed / Kamar anak NY Nursery dengan bunk bed rangka merah | 3 |
| `ef-bedroom.json` | EF Bedroom | bedroom | Master bedroom / Kamar tidur utama | `[00] m²` | `[X] weeks` / `[X] minggu` | `/images/projects/ef-bedroom/work.jpg` | EF Bedroom minimalist desk corner in dark timber / Sudut meja kerja minimalis kayu gelap di EF Bedroom | 4 |
| `nn-house.json` | NN House | bedroom | Bedroom suite / Suite kamar tidur | `[00] m²` | `[X] weeks` / `[X] minggu` | `/images/projects/nn-house/kitchen.jpg` | NN House pantry with timber cabinets and strip lighting / Pantry NN House dengan kabinet kayu dan lampu strip | 5 |

Write each as a complete JSON file with the exact key order of `rh-house.json`.

`content/i18n/en.json`:
```json
{
  "meta": {
    "home": {
      "title": "studioJHWA | Interior Design & Build in Surabaya and Malang",
      "description": "Interior design and build studio in Surabaya and Malang. We design, produce custom furniture, and install, so your space is ready to live in."
    },
    "projects": {
      "title": "Projects | studioJHWA Interior Design Surabaya & Malang",
      "description": "Selected homes and rooms designed and built by studioJHWA across Surabaya and Malang."
    },
    "project": {
      "title": "{name} | Interior Design Project by studioJHWA",
      "description": "{name}: {type} in {city}, designed and built by studioJHWA."
    },
    "ogAlt": "studioJHWA, interior design and build studio in Surabaya and Malang"
  },
  "a11y": { "skipToContent": "Skip to content", "mainNav": "Main", "openMenu": "Open menu", "closeMenu": "Close menu", "menu": "Menu" },
  "nav": { "projects": "Projects", "services": "Services", "rooms": "Rooms", "faq": "FAQ", "cta": "Start a project" },
  "lang": { "en": "English", "id": "Bahasa Indonesia" },
  "hero": {
    "eyebrow": "Interior design & build studio, Surabaya & Malang",
    "line1": "Formed by flow,",
    "line2": "built on principles.",
    "primary": "See our projects",
    "secondary": "Start a project"
  },
  "intro": {
    "lead": "We design your space, build it, and hand it back",
    "leadEm": "ready to live in.",
    "body": "studioJHWA is an interior studio working across Surabaya and Malang. One team takes every project from the first sketch to custom production and on-site installation, so what you approve is what you get.",
    "tag": "Design, production, installation. One team."
  },
  "selected": { "title": "Selected projects", "viewAll": "View all projects" },
  "strip": { "label": "Studio work", "title": "Rooms we've shaped.", "viewAll": "View all projects" },
  "lineToLight": {
    "title": "From line to light.",
    "body": "Every room starts as a precise drawing. Drag the slider to see the same kitchen as an isometric drawing and as the finished space.",
    "label": "Drag to compare",
    "render": "Render",
    "drawing": "Drawing"
  },
  "rooms": { "label": "Explore by room", "living": "Living", "kitchen": "Kitchen", "workspace": "Workspace", "kids": "Kids room" },
  "services": {
    "title": "What we do",
    "lead": "One studio for the whole job, from the first conversation to the last screw.",
    "design": { "title": "Design.", "body": "Consultation, concept, and space planning shaped around how you live and what you want to spend." },
    "visualize": { "title": "Visualize.", "body": "Realistic 3D renders and detailed technical drawings, so you see the result before anything is built." },
    "build": { "title": "Build.", "body": "Custom furniture production, fit-out, and on-site installation until the space is ready to use." }
  },
  "built": {
    "title": "Built, not just rendered.",
    "lead": "Real photos from site. The same room before we started and after handover.",
    "before": "Before",
    "after": "After",
    "beforePlaceholder": "[Photo placeholder: before, site condition]",
    "afterPlaceholder": "[Photo placeholder: after handover, same angle]",
    "quote": "[Client testimonial, one or two sentences about working with the studio.]",
    "cite": "[Client name], [Project name]"
  },
  "faq": {
    "title": "Good to know",
    "items": [
      { "q": "Where do you work?", "a": "We're based in Surabaya and Malang and take projects around both cities." },
      { "q": "Do you only design, or build too?", "a": "Both. We handle design, custom production, and installation, or design only if you already have a contractor." },
      { "q": "How do we get started?", "a": "Send us a message on WhatsApp with your room, rough size, and photos. We'll set up a first consultation." },
      { "q": "How long does a project take?", "a": "It depends on scope. A single room usually takes [X] weeks from approved design to handover." }
    ]
  },
  "contact": {
    "line1": "Have a space in mind?",
    "line2": "Let's shape it together.",
    "cta": "Chat on WhatsApp",
    "whatsapp": "WhatsApp",
    "email": "Email",
    "instagram": "Instagram",
    "studio": "Studio",
    "studioValue": "Surabaya & Malang"
  },
  "footer": { "tagline": "Formed by flow, built on principles." },
  "projectsPage": {
    "title1": "Our",
    "title2": "projects.",
    "lead": "Homes and rooms we've designed and built across Surabaya and Malang.",
    "filterLabel": "Filter projects",
    "filters": { "all": "All", "house": "House", "bedroom": "Bedroom", "kids": "Kids room" },
    "resultCount": "{count} projects shown",
    "empty": "No projects in this category yet."
  },
  "project": {
    "back": "All projects",
    "location": "Location",
    "type": "Type",
    "area": "Area",
    "scope": "Scope",
    "duration": "Duration",
    "year": "Year",
    "brief": "The brief",
    "approach": "Our approach",
    "drawing": "Isometric drawing",
    "finished": "Finished space",
    "next": "Next project",
    "detail": "Detail"
  },
  "notFound": { "title": "Page not found", "body": "The page you're looking for doesn't exist or has moved.", "home": "Back to home" },
  "breadcrumb": { "home": "Home", "projects": "Projects" }
}
```
`content/i18n/id.json`:
```json
{
  "meta": {
    "home": {
      "title": "Jasa Desain Interior Surabaya & Malang | studioJHWA",
      "description": "Jasa desain interior dan build di Surabaya dan Malang. Dari desain, produksi furnitur custom, sampai pemasangan, ruangmu siap ditempati."
    },
    "projects": {
      "title": "Portofolio Desain Interior Surabaya & Malang | studioJHWA",
      "description": "Pilihan rumah dan ruangan yang didesain dan dikerjakan studioJHWA di Surabaya dan Malang."
    },
    "project": {
      "title": "{name} | Proyek Desain Interior studioJHWA",
      "description": "{name}: {type} di {city}, didesain dan dikerjakan oleh studioJHWA."
    },
    "ogAlt": "studioJHWA, studio desain dan build interior di Surabaya dan Malang"
  },
  "a11y": { "skipToContent": "Langsung ke konten", "mainNav": "Utama", "openMenu": "Buka menu", "closeMenu": "Tutup menu", "menu": "Menu" },
  "nav": { "projects": "Proyek", "services": "Layanan", "rooms": "Ruangan", "faq": "FAQ", "cta": "Mulai proyek" },
  "lang": { "en": "English", "id": "Bahasa Indonesia" },
  "hero": {
    "eyebrow": "Studio desain & build interior, Surabaya & Malang",
    "line1": "Formed by flow,",
    "line2": "built on principles.",
    "primary": "Lihat proyek kami",
    "secondary": "Mulai proyek"
  },
  "intro": {
    "lead": "Kami mendesain ruangmu, mengerjakannya, lalu menyerahkannya",
    "leadEm": "siap ditempati.",
    "body": "studioJHWA adalah studio interior yang melayani Surabaya dan Malang. Satu tim memegang setiap proyek dari sketsa pertama, produksi furnitur custom, sampai pemasangan di lokasi, jadi hasil akhirnya sesuai dengan yang kamu setujui.",
    "tag": "Desain, produksi, pemasangan. Satu tim."
  },
  "selected": { "title": "Proyek pilihan", "viewAll": "Lihat semua proyek" },
  "strip": { "label": "Karya studio", "title": "Ruang yang kami bentuk.", "viewAll": "Lihat semua proyek" },
  "lineToLight": {
    "title": "From line to light.",
    "body": "Setiap ruang berawal dari gambar yang presisi. Geser slider untuk melihat dapur yang sama sebagai gambar isometrik dan sebagai ruang jadi.",
    "label": "Geser untuk membandingkan",
    "render": "Render",
    "drawing": "Gambar"
  },
  "rooms": { "label": "Jelajahi per ruangan", "living": "Ruang keluarga", "kitchen": "Dapur", "workspace": "Ruang kerja", "kids": "Kamar anak" },
  "services": {
    "title": "Layanan kami",
    "lead": "Satu studio untuk seluruh pekerjaan, dari obrolan pertama sampai sekrup terakhir.",
    "design": { "title": "Desain.", "body": "Konsultasi, konsep, dan tata ruang yang disesuaikan dengan gaya hidup dan anggaranmu." },
    "visualize": { "title": "Visualisasi.", "body": "Render 3D realistis dan gambar teknis detail, supaya kamu bisa melihat hasilnya sebelum dibangun." },
    "build": { "title": "Build.", "body": "Produksi furnitur custom, pengerjaan, dan pemasangan di lokasi sampai ruang siap dipakai." }
  },
  "built": {
    "title": "Dibangun, bukan cuma dirender.",
    "lead": "Foto asli dari lokasi. Ruang yang sama sebelum dikerjakan dan setelah serah terima.",
    "before": "Sebelum",
    "after": "Sesudah",
    "beforePlaceholder": "[Placeholder foto: sebelum, kondisi lokasi]",
    "afterPlaceholder": "[Placeholder foto: setelah serah terima, sudut yang sama]",
    "quote": "[Testimoni klien, satu atau dua kalimat tentang pengalaman bekerja dengan studio.]",
    "cite": "[Nama klien], [Nama proyek]"
  },
  "faq": {
    "title": "Perlu kamu tahu",
    "items": [
      { "q": "Area layanannya di mana saja?", "a": "Kami berbasis di Surabaya dan Malang dan menerima proyek di sekitar kedua kota tersebut." },
      { "q": "Hanya desain, atau sampai pengerjaan?", "a": "Keduanya. Kami menangani desain, produksi custom, dan pemasangan, atau desain saja kalau kamu sudah punya kontraktor." },
      { "q": "Bagaimana cara memulai?", "a": "Kirim pesan lewat WhatsApp berisi ruangan, perkiraan ukuran, dan foto. Kami atur jadwal konsultasi pertama." },
      { "q": "Berapa lama pengerjaannya?", "a": "Tergantung scope. Satu ruangan biasanya [X] minggu dari desain disetujui sampai serah terima." }
    ]
  },
  "contact": {
    "line1": "Punya ruang yang ingin diubah?",
    "line2": "Yuk, kita bentuk bersama.",
    "cta": "Chat via WhatsApp",
    "whatsapp": "WhatsApp",
    "email": "Email",
    "instagram": "Instagram",
    "studio": "Studio",
    "studioValue": "Surabaya & Malang"
  },
  "footer": { "tagline": "Formed by flow, built on principles." },
  "projectsPage": {
    "title1": "Proyek",
    "title2": "kami.",
    "lead": "Rumah dan ruangan yang kami desain dan kerjakan di Surabaya dan Malang.",
    "filterLabel": "Filter proyek",
    "filters": { "all": "Semua", "house": "Rumah", "bedroom": "Kamar tidur", "kids": "Kamar anak" },
    "resultCount": "{count} proyek ditampilkan",
    "empty": "Belum ada proyek di kategori ini."
  },
  "project": {
    "back": "Semua proyek",
    "location": "Lokasi",
    "type": "Tipe",
    "area": "Luas",
    "scope": "Scope",
    "duration": "Durasi",
    "year": "Tahun",
    "brief": "Brief",
    "approach": "Pendekatan kami",
    "drawing": "Gambar isometrik",
    "finished": "Ruang jadi",
    "next": "Proyek berikutnya",
    "detail": "Detail"
  },
  "notFound": { "title": "Halaman tidak ditemukan", "body": "Halaman yang kamu cari tidak ada atau sudah dipindahkan.", "home": "Kembali ke beranda" },
  "breadcrumb": { "home": "Beranda", "projects": "Proyek" }
}
```

- [ ] **Step 8: Run tests, prove the build-fail path, commit**

```bash
npm run test
```
Expected: all pass. Then prove build-time failure is readable: temporarily set `"category": "garage"` in `content/projects/nn-house.json`, then add to `src/app/[lang]/page.tsx` (temporary until Task 7): `import { getProjects } from "@/lib/content";` and `getProjects();` at top of the component, run `npm run build`, expect the build to fail with `Invalid content in content/projects/nn-house.json:` and `✖ Invalid option ... → at category`. Revert the JSON (keep the page import; Task 7 replaces the page).
```bash
npm run validate
git add content public src tests .prettierignore package.json package-lock.json
git commit -m "feat(content): add JSON content, zod schemas and repositories (#5)"
```

---

## Task 5 (issue #6): feat: design system

**Issue:** Goal — one set of design tokens and small UI primitives that every section composes. Scope — Tailwind `@theme` tokens, Jost via `next/font`, focus styles, reduced motion, `components/ui/*`, `cn` helper. Acceptance — primitives render with token classes only (no hex in `src/components`); reduced-motion disables animations; unit tests for primitives pass. Label `design`. Branch `feat/6-design-system`.

**Files:**
- Modify: `src/app/globals.css`, `src/app/[lang]/layout.tsx`, `vitest.config.ts` (include `.tsx`)
- Create: `src/lib/cn.ts`, `src/lib/fonts.ts`, `src/components/ui/{Container,Section,Heading,Button,TextLink,ExternalLink,Photo,CoveLight}.tsx`, `src/config/constants.ts`
- Test: `tests/unit/ui.test.tsx`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces:
  - `cn(...classes: Array<string | false | null | undefined>): string`
  - `<Container className?>` — centered, `max-w-site`, `px-gutter`
  - `<Section tone?: "plaster" | "stone" | "charcoal" | "deep" id? aria-label? className? bleed?: boolean>` — `bleed` removes vertical padding
  - `<Heading as?: "h1"|"h2"|"h3" size: "display-xl"|"display-lg"|"h2"|"h2-em"|"h3"|"service" variant?: "thin"|"boldItalic"|"mixed" className?>`, `<HeadingThin>`, `<HeadingEm>`
  - `<Button href variant: "glow"|"outline" className?>` — renders external hrefs with `target="_blank" rel="noopener noreferrer"`
  - `<TextLink href tone?: "light"|"dark">`, `<ExternalLink href className?>`
  - `<Photo src alt sizes priority? position? className?>` — `next/image` `fill` inside a positioned wrapper; wrapper defaults to `absolute inset-0`
  - `<CoveLight className?>` — decorative, `aria-hidden`
  - `brandColors` in `@/config/constants` (hex copies for OG images, test-checked against `globals.css`)

- [ ] **Step 1: Failing tests**

Update `vitest.config.ts` `include` to `["tests/unit/**/*.test.{ts,tsx}"]`.

`tests/unit/ui.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { CoveLight } from "@/components/ui/CoveLight";

describe("ui primitives", () => {
  it("Heading renders the requested level with token classes", () => {
    const html = renderToStaticMarkup(
      <Heading as="h1" size="display-xl">
        <HeadingThin>Formed by flow,</HeadingThin>
        <HeadingEm>built on principles.</HeadingEm>
      </Heading>,
    );
    expect(html).toMatch(/^<h1 class="[^"]*text-display-xl/);
    expect(html).toContain('<span class="font-light">Formed by flow,</span>');
    expect(html).toContain('<span class="font-semibold italic">built on principles.</span>');
  });

  it("Button opens external links safely", () => {
    const html = renderToStaticMarkup(<Button href="https://wa.me/620000" variant="glow">Chat</Button>);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("Button keeps internal links in the same tab", () => {
    const html = renderToStaticMarkup(<Button href="/en/projects" variant="outline">Projects</Button>);
    expect(html).not.toContain("target=");
  });

  it("ExternalLink always sets rel", () => {
    expect(renderToStaticMarkup(<ExternalLink href="https://instagram.com/studio.jhwa">IG</ExternalLink>)).toContain(
      'rel="noopener noreferrer"',
    );
  });

  it("CoveLight is hidden from assistive tech", () => {
    expect(renderToStaticMarkup(<CoveLight />)).toContain('aria-hidden="true"');
  });
});
```
`tests/unit/tokens.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandColors } from "@/config/constants";

describe("design tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  it("brandColors mirrors the Tailwind theme", () => {
    for (const [name, hex] of Object.entries(brandColors)) {
      expect(css).toContain(`--color-${name}: ${hex};`);
    }
  });
  it("components contain no hard-coded hex colors", async () => {
    const { globSync } = await import("node:fs");
    const offenders = globSync("src/components/**/*.tsx").filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
```
(`fs.globSync` is stable in Node 22+.) Run `npm run test` → FAIL (modules missing).

- [ ] **Step 2: Tokens, base styles, reduced motion — `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  /* Palette (CLAUDE.md §5) */
  --color-plaster: #E6E2DB;
  --color-stone: #D8D2C9;
  --color-line: #B9B2A7;
  --color-ink: #3A3530;
  --color-muted: #5E5750;
  --color-charcoal: #2B2825;
  --color-deep: #221F1C;
  --color-oak: #8C7359;
  --color-glow: #D9B77C;
  --color-drawing: #B5483A;
  /* Supporting tones taken from the approved design canvas */
  --color-mist: #CFC8BE;
  --color-dim: #A8A096;
  --color-muted-strong: #524B45;
  --color-paper: #F2F1EF;
  --color-night: #141210;

  --font-sans: var(--font-jost), Futura, "Century Gothic", "Trebuchet MS", sans-serif;

  /* Type scale: fluid between 360px and 1440px */
  --text-display-xl: clamp(3.25rem, 7.8vw, 7rem);
  --text-display-xl--line-height: 0.98;
  --text-display-xl--letter-spacing: -0.025em;
  --text-display-lg: clamp(3.25rem, 7.2vw, 6.5rem);
  --text-display-lg--line-height: 1;
  --text-display-lg--letter-spacing: -0.025em;
  --text-h2: clamp(2.25rem, 3.9vw, 3.5rem);
  --text-h2--line-height: 1.1;
  --text-h2--letter-spacing: -0.01em;
  --text-h2-em: clamp(2.375rem, 4.2vw, 3.75rem);
  --text-h2-em--line-height: 1.08;
  --text-h2-em--letter-spacing: -0.01em;
  --text-h3: 2.25rem;
  --text-h3--line-height: 1.2;
  --text-service: clamp(2.25rem, 3vw, 2.75rem);
  --text-service--letter-spacing: -0.01em;
  --text-lead: clamp(1.875rem, 3vw, 2.75rem);
  --text-lead--line-height: 1.18;
  --text-lead--letter-spacing: -0.01em;
  --text-list: clamp(2.5rem, 4.4vw, 4rem);
  --text-list--letter-spacing: -0.015em;
  --text-quote: clamp(1.5rem, 2.2vw, 2rem);
  --text-quote--line-height: 1.3;
  --text-summary: clamp(1.375rem, 2.1vw, 1.875rem);
  --text-summary--line-height: 1.3;
  --text-room: clamp(1.75rem, 2.8vw, 2.5rem);
  --text-card: 1.75rem;
  --text-faq: 1.375rem;
  --text-wordmark: clamp(1.1875rem, 1.6vw, 1.375rem);
  --text-body-lg: 1.125rem;
  --text-body-lg--line-height: 1.65;
  --text-body: 1.0625rem;
  --text-body--line-height: 1.65;
  --text-small: 0.9375rem;
  --text-caption: 0.875rem;

  /* Spacing */
  --spacing-gutter: clamp(20px, 6.6vw, 96px);
  --spacing-section: clamp(72px, 8.3vw, 120px);
  --spacing-header: 96px;
  --spacing-header-sm: 72px;

  /* Containers */
  --container-site: 1440px;
  --container-prose: 520px;

  /* Signature elements */
  --shadow-cove: 0 0 32px 8px rgb(217 183 124 / 0.4);
  --shadow-cove-sm: 0 0 24px 5px rgb(217 183 124 / 0.4);
  --animate-cove: cove-on 1.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.3s both;
  --animate-strip: strip 70s linear infinite;

  @keyframes cove-on {
    from { transform: scaleX(0); opacity: 0; }
    to { transform: scaleX(1); opacity: 1; }
  }
  @keyframes strip {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
}

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-plaster font-sans text-ink antialiased; }
  :focus-visible { outline: 2px solid var(--color-ink); outline-offset: 4px; }
  .theme-dark :focus-visible { outline-color: var(--color-glow); }
}

@utility stripes-light {
  background: repeating-linear-gradient(90deg, var(--color-mist) 0 22px, var(--color-line) 22px 24px);
}
@utility stripes-dark {
  background: repeating-linear-gradient(90deg, var(--color-ink) 0 22px, var(--color-charcoal) 22px 24px);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Font and constants**

`src/lib/fonts.ts`:
```ts
import { Jost } from "next/font/google";

export const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jost",
});
```
`next/font/google` downloads at build time and self-hosts the files (no runtime request to Google, so `font-src 'self'` holds).

`src/config/constants.ts`:
```ts
/** Hex copies of Tailwind tokens for places without CSS (OG images). Kept in sync by tests/unit/tokens.test.ts. */
export const brandColors = {
  plaster: "#E6E2DB",
  charcoal: "#2B2825",
  glow: "#D9B77C",
  mist: "#CFC8BE",
} as const;

export const SITE_NAME = "studioJHWA";
```
In `src/app/[lang]/layout.tsx` set `<html lang={lang} className={jost.variable}>`.

- [ ] **Step 4: Primitives**

`src/lib/cn.ts`:
```ts
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
```
`src/components/ui/Container.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-site px-gutter", className)}>{children}</div>;
}
```
`src/components/ui/Section.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  plaster: "bg-plaster text-ink",
  stone: "bg-stone text-ink",
  charcoal: "theme-dark bg-charcoal text-plaster",
  deep: "theme-dark bg-deep text-plaster",
} as const;

type SectionProps = {
  tone?: keyof typeof tones;
  id?: string;
  "aria-label"?: string;
  bleed?: boolean;
  className?: string;
  children: ReactNode;
};

export function Section({ tone = "plaster", id, bleed = false, className, children, ...aria }: SectionProps) {
  return (
    <section id={id} aria-label={aria["aria-label"]} className={cn("relative", tones[tone], !bleed && "py-section", className)}>
      {children}
    </section>
  );
}
```
`src/components/ui/Heading.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  "display-xl": "text-display-xl",
  "display-lg": "text-display-lg",
  h2: "text-h2",
  "h2-em": "text-h2-em",
  h3: "text-h3",
  service: "text-service",
} as const;

const variants = { thin: "font-light", boldItalic: "font-semibold italic", mixed: "" } as const;

type HeadingProps = {
  as?: "h1" | "h2" | "h3";
  size: keyof typeof sizes;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

export function Heading({ as: Tag = "h2", size, variant = "mixed", className, children }: HeadingProps) {
  return <Tag className={cn("m-0 text-balance", sizes[size], variants[variant], className)}>{children}</Tag>;
}

export function HeadingThin({ children }: { children: ReactNode }) {
  return <span className="font-light">{children}</span>;
}

export function HeadingEm({ children }: { children: ReactNode }) {
  return <span className="font-semibold italic">{children}</span>;
}
```
Note: the test expects `class="m-0 text-balance text-display-xl"` to match `/^<h1 class="[^"]*text-display-xl/` — it does. Mixed headings put a `<br />` between `HeadingThin` and `HeadingEm` at call sites.

`src/components/ui/ExternalLink.tsx`:
```tsx
import type { ReactNode } from "react";

export function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
```
`src/components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";

const variants = {
  glow: "min-h-13 px-7 bg-glow text-charcoal text-body font-medium hover:bg-plaster",
  outline: "min-h-11 px-5.5 border border-current/45 text-base hover:border-current",
} as const;

type ButtonProps = { href: string; variant: keyof typeof variants; className?: string; children: ReactNode };

export function Button({ href, variant, className, children }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full no-underline transition-colors",
    variants[variant],
    className,
  );
  if (/^https?:\/\//.test(href)) {
    return <ExternalLink href={href} className={classes}>{children}</ExternalLink>;
  }
  return <Link href={href} className={classes}>{children}</Link>;
}
```
`src/components/ui/TextLink.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = { dark: "hover:text-oak", light: "hover:text-glow" } as const;

type TextLinkProps = { href: string; tone?: keyof typeof tones; className?: string; children: ReactNode };

export function TextLink({ href, tone = "dark", className, children }: TextLinkProps) {
  return (
    <Link href={href} className={cn("text-body underline underline-offset-6 transition-colors", tones[tone], className)}>
      {children}
    </Link>
  );
}
```
(`tone="dark"` = link on a light background, hover goes darker oak; `tone="light"` = link on a dark background.)

`src/components/ui/Photo.tsx`:
```tsx
import Image from "next/image";
import { cn } from "@/lib/cn";

type PhotoProps = {
  src: string;
  alt: string;
  /** Required: tells next/image which width to download at each breakpoint. */
  sizes: string;
  priority?: boolean;
  position?: string;
  className?: string;
};

export function Photo({ src, alt, sizes, priority = false, position = "50% 50%", className }: PhotoProps) {
  return (
    <div className={cn("overflow-hidden", className ?? "absolute inset-0")}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
```
Callers that pass `className` must include `relative` (or `absolute`) so `fill` has a positioned parent. Check the Next 16 `next/image` docs: if `priority` is deprecated in 16.x in favour of `preload`, use `preload={priority}` and keep the prop name `priority` on `Photo`. Non-priority images lazy-load by default.

`src/components/ui/CoveLight.tsx`:
```tsx
import { cn } from "@/lib/cn";

/** Glowing 2px "cove light" line. Position it with className (e.g. "top-0"). */
export function CoveLight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0 h-0.5 origin-center bg-glow shadow-cove animate-cove", className)}
    />
  );
}
```

- [ ] **Step 5: Run tests and validate, commit**

```bash
npm run test && npm run validate
git add -A && git status --short
git commit -m "feat(ui): add design tokens, Jost font and UI primitives (#6)"
```

---

## Task 6 (issue #7): feat: layout and i18n routing

**Issue:** Goal — every page shares header, skip link, footer with contact CTA, and correct `<html lang>`; users can switch language without losing their place. Scope — `[lang]` layout, Header (overlay/solid), accessible MobileMenu, LangSwitch, Footer + ContactCta, not-found, Playwright setup + e2e CI job. Acceptance — `/en` and `/id` render with `lang` set; `/` → `/en`; `/fr` and unknown slug → 404; language switch keeps the path; mobile menu has `aria-expanded`, traps focus, closes on Esc and returns focus to the toggle. Label `feat`. Branch `feat/7-layout-i18n`.

**Files:**
- Modify: `src/app/[lang]/layout.tsx`, `.github/workflows/ci.yml`, `package.json`
- Create: `src/components/layout/{Header,MobileMenu,LangSwitch,Footer,Logo,SkipLink}.tsx`, `src/components/sections/ContactCta.tsx`, `src/app/[lang]/not-found.tsx`, `playwright.config.ts`
- Test: `tests/e2e/layout.spec.ts`, `tests/e2e/routing.spec.ts`

**Interfaces:**
- Consumes: `getDictionary`, `getSite`, `whatsappHref`, `emailHref`, `localizedPath`, `swapLocale`, UI primitives.
- Produces:
  - `<Header lang: Locale dict: Dictionary variant: "overlay" | "solid">` — pages render it first inside their fragment (layout renders SkipLink, `children`, Footer)
  - `<Footer lang dict site>` — includes `<ContactCta>` (`id="contact"`) + bottom bar
  - every page's content lives in `<main id="main">`
  - `MobileMenu` props: `{ links: { href: string; label: string }[]; cta: { href: string; label: string }; labels: { open: string; close: string; menu: string }; children?: ReactNode }`
  - `LangSwitch` props: `{ lang: Locale; labels: Record<Locale, string>; className?: string }`

- [ ] **Step 1: Install Playwright, config, e2e job**

```bash
npm view @playwright/test version --no-update-notifier
npm install --save-exact -D @playwright/test@1.63.0
npx playwright install chromium
```
`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 780 } } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `${baseURL}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { NEXT_PUBLIC_SITE_URL: baseURL },
  },
});
```
Append job to `.github/workflows/ci.yml`:
```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: actions/setup-node@<sha> # <tag>
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - if: failure()
        uses: actions/upload-artifact@<sha> # <tag>
        with: { name: playwright-report, path: playwright-report, retention-days: 7 }
```

- [ ] **Step 2: Failing e2e tests**

`tests/e2e/routing.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("root redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

for (const lang of ["en", "id"] as const) {
  test(`/${lang} sets <html lang>`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}

test("unknown locale returns 404", async ({ request }) => {
  expect((await request.get("/fr")).status()).toBe(404);
});

test("unknown project slug returns 404", async ({ request }) => {
  expect((await request.get("/en/projects/does-not-exist")).status()).toBe(404);
});
```
`tests/e2e/layout.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/en/projects");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("language switch keeps the current path", async ({ page, isMobile }) => {
  await page.goto("/en/projects/rh-house");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: /Bahasa Indonesia/ }).first().click();
  await expect(page).toHaveURL(/\/id\/projects\/rh-house$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("footer shows contact data from site.json", async ({ page }) => {
  await page.goto("/en");
  const contact = page.locator("#contact");
  await expect(contact.getByRole("link", { name: "@studio.jhwa" })).toHaveAttribute("rel", "noopener noreferrer");
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/en/projects");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});
```
The project-detail route exists from Task 9; until then `language switch keeps the current path` uses `/en/projects` — write it with `/en/projects` now and change the URL to `/en/projects/rh-house` in Task 9 Step 1. Also leave the `unknown project slug` test marked `test.fixme` until Task 9.

Run `npm run test:e2e` → FAIL (no header/menu yet).

- [ ] **Step 3: Logo, SkipLink**

`src/components/layout/Logo.tsx`:
```tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

export function Logo({ lang }: { lang: Locale }) {
  return (
    <Link href={localizedPath(lang)} className="flex min-h-11 items-center gap-3.5 no-underline">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="19.5" className="fill-night stroke-plaster/35" />
        <path d="M12 10h4v9h2v11h-4v-9h-2z" className="fill-plaster" />
        <path d="M21 10h4v9h2v11h-4v-9h-2z" className="fill-plaster" />
      </svg>
      <span className="text-wordmark tracking-[0.02em]">
        <span className="font-light">studio</span>
        <span className="font-medium">JHWA</span>
      </span>
    </Link>
  );
}
```
`src/components/layout/SkipLink.tsx`:
```tsx
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-glow px-4 py-3 text-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}
```

- [ ] **Step 4: LangSwitch (client)**

`src/components/layout/LangSwitch.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { locales, swapLocale, type Locale } from "@/lib/i18n/locales";

type LangSwitchProps = { lang: Locale; labels: Record<Locale, string>; className?: string };

export function LangSwitch({ lang, labels, className }: LangSwitchProps) {
  const pathname = usePathname();
  const target = locales.find((l) => l !== lang) ?? lang;
  return (
    <Link
      href={swapLocale(pathname, target)}
      hrefLang={target}
      lang={target}
      className={cn("inline-flex min-h-11 min-w-11 items-center justify-center uppercase no-underline", className)}
    >
      {target}
      <span className="sr-only"> {labels[target]}</span>
    </Link>
  );
}
```
Accessible name is "ID Bahasa Indonesia", which contains the visible label (WCAG 2.5.3).

- [ ] **Step 5: MobileMenu (client)**

`src/components/layout/MobileMenu.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type NavLink = { href: string; label: string };
type MobileMenuProps = {
  links: NavLink[];
  cta: NavLink;
  labels: { open: string; close: string; menu: string };
  children?: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ links, cta, labels, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);

  useEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!open || !panel) return;
    restoreFocus.current = true;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (restoreFocus.current) toggle?.focus();
    };
  }, [open]);

  // Following a link: close without pulling focus (and scroll) back to the header.
  const closeForNavigation = () => {
    restoreFocus.current = false;
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center"
      >
        <span className="sr-only">{labels.open}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="stroke-current">
          <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        hidden={!open}
        className="theme-dark fixed inset-0 z-50 flex flex-col gap-10 overflow-y-auto bg-charcoal px-gutter py-6 text-plaster"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
          >
            <span className="sr-only">{labels.close}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="stroke-current">
              <path d="M5 5l14 14M19 5L5 19" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <nav aria-label={labels.menu}>
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={closeForNavigation} className="block py-2 text-h2 font-light no-underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href={cta.href}
          onClick={closeForNavigation}
          className="inline-flex min-h-13 items-center self-start rounded-full bg-glow px-7 text-body font-medium text-charcoal no-underline"
        >
          {cta.label}
        </Link>
        {children}
      </div>
    </div>
  );
}
```
The LangSwitch passed as `children` navigates to another page, so focus restoration there is irrelevant (the page changes).

- [ ] **Step 6: Header (server)**

`src/components/layout/Header.tsx`:
```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

type HeaderProps = { lang: Locale; dict: Dictionary; variant: "overlay" | "solid" };

export function Header({ lang, dict, variant }: HeaderProps) {
  const home = localizedPath(lang);
  const links = [
    { href: localizedPath(lang, "/projects"), label: dict.nav.projects },
    { href: `${home}#services`, label: dict.nav.services },
    { href: `${home}#rooms`, label: dict.nav.rooms },
    { href: `${home}#faq`, label: dict.nav.faq },
  ];
  const cta = { href: "#contact", label: dict.nav.cta };

  return (
    <header
      className={cn(
        "theme-dark z-20 text-plaster",
        variant === "overlay" ? "absolute inset-x-0 top-0" : "relative bg-charcoal",
      )}
    >
      <div className="mx-auto flex h-header-sm max-w-site items-center justify-between px-gutter md:h-header">
        <Logo lang={lang} />
        <nav aria-label={dict.a11y.mainNav} className="hidden items-center gap-10 text-base lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="no-underline hover:text-glow">
              {link.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            className="inline-flex min-h-11 items-center rounded-full border border-plaster/45 px-5.5 no-underline hover:border-plaster"
          >
            {cta.label}
          </Link>
          <LangSwitch lang={lang} labels={dict.lang} />
        </nav>
        <MobileMenu
          links={links}
          cta={cta}
          labels={{ open: dict.a11y.openMenu, close: dict.a11y.closeMenu, menu: dict.a11y.menu }}
        >
          <LangSwitch lang={lang} labels={dict.lang} className="self-start" />
        </MobileMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: ContactCta + Footer**

`src/components/sections/ContactCta.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { CoveLight } from "@/components/ui/CoveLight";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { emailHref, whatsappHref } from "@/lib/content";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Site } from "@/lib/schemas/site";

export function ContactCta({ dict, site }: { dict: Dictionary["contact"]; site: Site }) {
  const wa = whatsappHref(site);
  const mail = emailHref(site);
  const instagram = site.socials.find((s) => s.platform === "instagram");
  return (
    <Section tone="charcoal" id="contact">
      <CoveLight className="top-0" />
      <Container className="flex flex-col justify-between gap-16 lg:flex-row lg:gap-24">
        <div className="flex max-w-[680px] flex-col gap-8">
          <Heading size="h2">
            <HeadingThin>{dict.line1}</HeadingThin>
            <br />
            <HeadingEm>{dict.line2}</HeadingEm>
          </Heading>
          <Button href={wa ?? "#contact"} variant="glow" className="self-start">
            {dict.cta}
          </Button>
        </div>
        <dl className="grid w-full grid-cols-[120px_minmax(0,1fr)] content-start gap-6 text-body-lg lg:w-[420px] lg:shrink-0">
          <dt className="text-dim">{dict.whatsapp}</dt>
          <dd className="m-0">{wa ? <ExternalLink href={wa}>+{site.contact.whatsapp}</ExternalLink> : site.contact.whatsapp}</dd>
          <dt className="text-dim">{dict.email}</dt>
          <dd className="m-0">{mail ? <a href={mail}>{site.contact.email}</a> : site.contact.email}</dd>
          {instagram && (
            <>
              <dt className="text-dim">{dict.instagram}</dt>
              <dd className="m-0">
                <ExternalLink href={instagram.url} className="underline underline-offset-5 hover:text-glow">
                  {instagram.handle}
                </ExternalLink>
              </dd>
            </>
          )}
          <dt className="text-dim">{dict.studio}</dt>
          <dd className="m-0">{dict.studioValue}</dd>
        </dl>
      </Container>
    </Section>
  );
}
```
`src/components/layout/Footer.tsx`:
```tsx
import { ContactCta } from "@/components/sections/ContactCta";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Site } from "@/lib/schemas/site";

export function Footer({ dict, site }: { dict: Dictionary; site: Site }) {
  return (
    <footer>
      <ContactCta dict={dict.contact} site={site} />
      <div className="theme-dark bg-deep text-dim">
        <Container className="flex min-h-20 flex-col justify-center gap-1 py-4 text-caption sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="font-light italic">{dict.footer.tagline}</span>
        </Container>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Layout, pages use Header, not-found**

`src/app/[lang]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { getDictionary, getSite } from "@/lib/content";
import { jost } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n/locales";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

type LayoutProps = { children: ReactNode; params: Promise<{ lang: string }> };

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={jost.variable}>
      <body>
        <SkipLink label={dict.a11y.skipToContent} />
        {children}
        <Footer dict={dict} site={getSite()} />
      </body>
    </html>
  );
}
```
`src/app/[lang]/page.tsx` (temporary shell, Task 7 fills sections):
```tsx
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main" />
    </>
  );
}
```
Also create `src/app/[lang]/projects/page.tsx` with the same shell (Task 8 fills it) so the layout tests have a non-home route.

`src/app/[lang]/not-found.tsx`:
```tsx
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { getDictionary } from "@/lib/content";

// not-found receives no params; show both languages.
export default function NotFound() {
  const en = getDictionary("en");
  const id = getDictionary("id");
  return (
    <main id="main" className="py-section">
      <Container className="flex flex-col gap-6">
        <Heading as="h1" size="display-lg" variant="thin">{en.notFound.title}</Heading>
        <p className="text-body-lg text-muted">{en.notFound.body}</p>
        <p lang="id" className="text-body-lg text-muted">{id.notFound.body}</p>
        <div className="flex gap-6">
          <Link href="/en" className="underline underline-offset-6">{en.notFound.home}</Link>
          <Link href="/id" lang="id" className="underline underline-offset-6">{id.notFound.home}</Link>
        </div>
      </Container>
    </main>
  );
}
```
Check `/fr`: run `npm run build && npm run start -- -p 3100`, `curl -s -o /dev/null -w '%{http_code}' localhost:3100/fr`. If the status is not 404, or the 404 HTML has no `<html lang>`, follow the Next 16 docs for `global-not-found` (file `src/app/global-not-found.tsx` rendering its own `<html lang="en"><body>` and importing `./globals.css`; enable the flag the docs name, if any) and re-check.

- [ ] **Step 9: Run e2e, validate, commit**

```bash
npm run test:e2e && npm run validate
git add -A && git status --short
git commit -m "feat(layout): add locale layout, header, mobile menu, language switch and footer (#7)"
```
PR checks now include `e2e`.

---

## Task 7 (issue #8): feat: home page

**Issue:** Goal — the approved home design, responsive from 360px to 1440px. Scope — sections in order: Hero, Intro, Selected projects, Film strip, From line to light, Explore by room, What we do, Built not just rendered, FAQ (Contact CTA comes from the footer). Acceptance — section order matches the design canvas; hero image preloaded, others lazy; slider operable with arrow keys; film strip pauses on hover and does not animate under reduced motion; no horizontal scroll at 360px. Label `feat`. Branch `feat/8-home-page`.

**Files:**
- Modify: `src/app/[lang]/page.tsx`
- Create: `src/components/sections/{Hero,Intro,SelectedProjects,ProjectCard,FilmStrip,Rooms,Services,Built,Faq}.tsx`, `src/components/sections/LineToLight/{LineToLight,Slider}.tsx`
- Test: `tests/e2e/home.spec.ts`, `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: `getHome(): Home`, `getFeaturedProjects()`, `getDictionary`, `pick`, UI primitives, `Header`.
- Produces: `<ProjectCard project lang size: "large" | "small" className?>` (re-used nowhere else yet, lives in sections). Each section takes `{ lang: Locale; dict: Dictionary[<key>]; ...content }` — never the whole dictionary.

- [ ] **Step 1: Failing e2e tests**

`tests/e2e/home.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("home sections appear in the approved order", async ({ page }) => {
  await page.goto("/en");
  const headings = await page.locator("main h1, main h2").allInnerTexts();
  const normalized = headings.map((h) => h.replace(/\s+/g, " ").trim());
  expect(normalized).toEqual([
    "Formed by flow, built on principles.",
    "Selected projects",
    "Rooms we've shaped.",
    "From line to light.",
    "What we do",
    "Built, not just rendered.",
    "Good to know",
  ]);
  await expect(page.locator("main section#rooms")).toHaveAttribute("aria-label", "Explore by room");
});

test("only the hero image is eagerly loaded", async ({ page }) => {
  await page.goto("/en");
  const hero = page.locator("section#top img");
  await expect(hero).not.toHaveAttribute("loading", "lazy");
  const lazy = await page.locator("main img:not(section#top img)").evaluateAll((imgs) =>
    imgs.every((img) => img.getAttribute("loading") === "lazy"),
  );
  expect(lazy).toBe(true);
});

test("line-to-light slider responds to the keyboard", async ({ page }) => {
  await page.goto("/en");
  const slider = page.getByRole("slider", { name: "Drag to compare" });
  await slider.focus();
  await expect(slider).toHaveValue("50");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("52");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("film strip does not animate", async ({ page }) => {
    await page.goto("/en");
    const iterations = await page.locator("[data-film-strip]").evaluate((el) => getComputedStyle(el).animationIterationCount);
    expect(iterations).toBe("1");
  });
});

test("every image has a non-empty alt except decorative duplicates", async ({ page }) => {
  for (const lang of ["en", "id"]) {
    await page.goto(`/${lang}`);
    const bad = await page.locator("main img").evaluateAll((imgs) =>
      imgs.filter((img) => !img.closest("[aria-hidden='true']") && !img.getAttribute("alt")).length,
    );
    expect(bad).toBe(0);
  }
});
```
`tests/e2e/responsive.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

const routes = ["/en", "/id"];

for (const route of routes) {
  for (const width of [360, 768, 1440]) {
    test(`${route} has no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
```
Run `npm run test:e2e -- tests/e2e/home.spec.ts tests/e2e/responsive.spec.ts` → FAIL.

- [ ] **Step 2: Hero**

`src/components/sections/Hero.tsx`:
```tsx
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CoveLight } from "@/components/ui/CoveLight";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";
import type { Dictionary } from "@/lib/schemas/dictionary";

type HeroProps = { lang: Locale; dict: Dictionary["hero"]; image: ImageContent };

export function Hero({ lang, dict, image }: HeroProps) {
  return (
    <section
      id="top"
      className="theme-dark relative flex h-svh max-h-[900px] min-h-[640px] items-end overflow-hidden bg-charcoal text-plaster"
    >
      <Photo src={image.src} alt={pick(image.alt, lang)} position={image.position} sizes="100vw" priority />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-b from-deep/0 to-deep/85" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-deep/70 to-deep/0" />
      <CoveLight className="top-header-sm md:top-header" />
      <Container className="relative flex flex-wrap items-end justify-between gap-x-16 gap-y-10 pb-12 md:pb-24">
        <div className="flex flex-col gap-7">
          <p className="text-body text-mist">{dict.eyebrow}</p>
          <Heading as="h1" size="display-xl">
            <HeadingThin>{dict.line1}</HeadingThin>
            <br />
            <HeadingEm>{dict.line2}</HeadingEm>
          </Heading>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-5 md:items-end">
          <Button href={localizedPath(lang, "/projects")} variant="glow">{dict.primary}</Button>
          <TextLink href="#contact" tone="light">{dict.secondary}</TextLink>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Intro**

`src/components/sections/Intro.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type IntroProps = { lang: Locale; dict: Dictionary["intro"]; images: Home["intro"] };

export function Intro({ lang, dict, images }: IntroProps) {
  return (
    <Section>
      <Container className="flex flex-col justify-between gap-14 xl:flex-row xl:gap-24">
        <div className="flex max-w-prose flex-col gap-7 xl:pt-10">
          <p className="text-lead font-light">
            {dict.lead} <span className="font-semibold italic">{dict.leadEm}</span>
          </p>
          <p className="text-body-lg text-muted">{dict.body}</p>
          <p className="flex items-center gap-3 text-body font-medium text-ink">
            <span aria-hidden="true" className="h-px w-8 bg-oak" />
            {dict.tag}
          </p>
        </div>
        <div className="relative aspect-[620/520] w-full max-w-[620px] shrink-0">
          <Photo
            src={images.primary.src}
            alt={pick(images.primary.alt, lang)}
            sizes="(min-width: 1280px) 400px, 65vw"
            className="absolute top-0 left-0 h-[85%] w-[65%]"
          />
          <Photo
            src={images.secondary.src}
            alt={pick(images.secondary.alt, lang)}
            sizes="(min-width: 1280px) 280px, 45vw"
            className="absolute right-0 bottom-0 h-[65%] w-[45%] ring-[12px] ring-plaster"
          />
        </div>
      </Container>
    </Section>
  );
}
```
(D4: the tag line text is `ink`, with the oak rule as the accent.)

- [ ] **Step 4: Selected projects + ProjectCard**

`src/components/sections/ProjectCard.tsx`:
```tsx
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

const heights = { large: "h-[300px] sm:h-[360px] lg:h-[520px]", small: "h-[300px] sm:h-[360px] lg:h-[320px]" } as const;

type ProjectCardProps = { project: Project; lang: Locale; size: keyof typeof heights; className?: string };

export function ProjectCard({ project, lang, size, className }: ProjectCardProps) {
  return (
    <Link href={localizedPath(lang, `/projects/${project.slug}`)} className={cn("group flex flex-col gap-4.5 no-underline", className)}>
      <Photo
        src={project.cover.src}
        alt={pick(project.cover.alt, lang)}
        position={project.cover.position}
        sizes={size === "large" ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className={cn("relative w-full", heights[size])}
      />
      <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="text-card group-hover:text-oak">{project.name}</span>
        <span className="text-small text-muted">
          {pick(project.type, lang)}, {project.city}
        </span>
      </span>
    </Link>
  );
}
```
`src/components/sections/SelectedProjects.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";
import { ProjectCard } from "./ProjectCard";

type SelectedProjectsProps = { lang: Locale; dict: Dictionary["selected"]; projects: Project[] };

export function SelectedProjects({ lang, dict, projects }: SelectedProjectsProps) {
  return (
    <Section id="projects">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2" variant="thin">{dict.title}</Heading>
          <TextLink href={localizedPath(lang, "/projects")}>{dict.viewAll}</TextLink>
        </div>
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-16">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              lang={lang}
              size={index < 2 ? "large" : "small"}
              className={index === 0 ? "sm:col-span-2" : undefined}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Film strip (server, CSS animation)**

`src/components/sections/FilmStrip.tsx`:
```tsx
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/cn";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type FilmStripProps = { lang: Locale; dict: Dictionary["strip"]; items: Home["filmStrip"] };

export function FilmStrip({ lang, dict, items }: FilmStripProps) {
  // Two copies make the -50% translate loop seamless; the copy is hidden from AT and under reduced motion.
  const loop = [...items, ...items];
  return (
    <Section tone="deep" aria-label={dict.label} className="overflow-hidden">
      <Container className="flex flex-wrap items-end justify-between gap-6">
        <Heading size="h2-em" variant="boldItalic">{dict.title}</Heading>
        <TextLink href={localizedPath(lang, "/projects")} tone="light">{dict.viewAll}</TextLink>
      </Container>
      <div className="mt-12 overflow-hidden">
        <div
          data-film-strip
          className="flex w-max animate-strip gap-4 hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-gutter"
        >
          {loop.map((item, index) => {
            const duplicate = index >= items.length;
            return (
              <div
                key={`${item.src}-${index}`}
                aria-hidden={duplicate || undefined}
                className={cn("relative h-60 shrink-0 md:h-90", duplicate && "motion-reduce:hidden")}
                style={{ aspectRatio: item.ratio }}
              >
                <Image src={item.src} alt={duplicate ? "" : pick(item.alt, lang)} fill sizes="(min-width: 768px) 500px, 340px" className="object-cover" />
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
```
With the global reduced-motion rule the strip's iteration count computes to `1` (asserted by the e2e test) and the duplicate set is hidden; the originals wrap instead of overflowing.

- [ ] **Step 6: From line to light (server wrapper + client slider)**

`src/components/sections/LineToLight/Slider.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";

type Img = { src: string; alt: string };
type SliderProps = { drawing: Img; render: Img; labels: { label: string; render: string; drawing: string }; children: ReactNode };

export function Slider({ drawing, render, labels, children }: SliderProps) {
  const [position, setPosition] = useState(50);
  const inputId = useId();
  return (
    <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,480px)_minmax(0,640px)] xl:justify-between">
      <div className="flex flex-col gap-8">
        {children}
        <div className="mt-4 flex flex-col gap-3">
          <label htmlFor={inputId} className="text-small text-mist">{labels.label}</label>
          <input
            id={inputId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${position}% ${labels.render}`}
            className="h-11 w-full accent-glow"
          />
        </div>
      </div>
      <div className="relative aspect-[640/740] w-full max-w-[640px] overflow-hidden bg-paper">
        <Image src={drawing.src} alt={drawing.alt} fill sizes="(min-width: 1280px) 640px, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image src={render.src} alt={render.alt} fill sizes="(min-width: 1280px) 640px, 100vw" className="object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-y-0 -ml-px w-0.5 bg-glow shadow-cove-sm" style={{ left: `${position}%` }} />
        <span className="absolute bottom-4.5 left-5 bg-deep/60 px-2.5 py-1 text-caption text-plaster">{labels.render}</span>
        <span className="absolute right-5 bottom-4.5 bg-paper/85 px-2.5 py-1 text-caption text-drawing">{labels.drawing}</span>
      </div>
    </div>
  );
}
```
`src/components/sections/LineToLight/LineToLight.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";
import { Slider } from "./Slider";

type LineToLightProps = { lang: Locale; dict: Dictionary["lineToLight"]; images: Home["lineToLight"] };

export function LineToLight({ lang, dict, images }: LineToLightProps) {
  return (
    <Section tone="charcoal">
      <Container>
        <Slider
          drawing={{ src: images.drawing.src, alt: pick(images.drawing.alt, lang) }}
          render={{ src: images.render.src, alt: pick(images.render.alt, lang) }}
          labels={{ label: dict.label, render: dict.render, drawing: dict.drawing }}
        >
          <Heading size="h2-em" variant="boldItalic">{dict.title}</Heading>
          <p className="text-body-lg text-mist">{dict.body}</p>
        </Slider>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 7: Rooms, Services, Built, FAQ**

`src/components/sections/Rooms.tsx`:
```tsx
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

type RoomsProps = { lang: Locale; dict: Dictionary["rooms"]; rooms: Home["rooms"] };

export function Rooms({ lang, dict, rooms }: RoomsProps) {
  return (
    <section id="rooms" aria-label={dict.label} className="theme-dark grid grid-cols-2 gap-0.5 bg-deep lg:grid-cols-4">
      {rooms.map((room) => (
        <Link
          key={room.key}
          href={localizedPath(lang, "/projects")}
          className="group relative block h-[340px] overflow-hidden text-plaster no-underline sm:h-[480px] lg:h-[760px]"
        >
          <Photo src={room.src} alt={pick(room.alt, lang)} position={room.position} sizes="(min-width: 1024px) 25vw, 50vw" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-deep/0 to-deep/80" />
          <span className="absolute bottom-5 left-5 text-room font-semibold italic md:bottom-8 md:left-8">{dict[room.key]}</span>
        </Link>
      ))}
    </section>
  );
}
```
`src/components/sections/Services.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Home } from "@/lib/schemas/home";

const order = ["design", "visualize", "build"] as const;

type ServicesProps = { lang: Locale; dict: Dictionary["services"]; images: Home["services"] };

export function Services({ lang, dict, images }: ServicesProps) {
  return (
    <Section tone="stone" id="services">
      <Container className="flex flex-col gap-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2" variant="thin">{dict.title}</Heading>
          <p className="max-w-[460px] text-body-lg text-muted-strong">{dict.lead}</p>
        </div>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-x-12">
          {order.map((key) => (
            <div key={key} className="flex flex-col gap-4.5">
              <Photo src={images[key].src} alt={pick(images[key].alt, lang)} sizes="(min-width: 1024px) 33vw, 100vw" className="relative h-[360px] w-full" />
              <div aria-hidden="true" className="mt-2.5 h-px bg-oak" />
              <Heading as="h3" size="service" variant="boldItalic">{dict[key].title}</Heading>
              <p className="text-body text-muted-strong">{dict[key].body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```
`src/components/sections/Built.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/lib/schemas/dictionary";

export function Built({ dict }: { dict: Dictionary["built"] }) {
  const panels = [
    { caption: dict.before, label: dict.beforePlaceholder, classes: "stripes-light text-muted-strong" },
    { caption: dict.after, label: dict.afterPlaceholder, classes: "stripes-dark text-mist" },
  ];
  return (
    <Section>
      <Container className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading size="h2-em" variant="boldItalic">{dict.title}</Heading>
          <p className="max-w-[460px] text-body-lg text-muted">{dict.lead}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {panels.map((panel) => (
            <figure key={panel.caption} className="m-0 flex flex-col gap-3.5">
              <div role="img" aria-label={panel.label} className={`flex h-[280px] items-end p-5 md:h-[440px] ${panel.classes}`}>
                <span className="text-caption">{panel.label}</span>
              </div>
              <figcaption className="text-body">{panel.caption}</figcaption>
            </figure>
          ))}
        </div>
        <blockquote className="m-0 grid grid-cols-1 gap-6 border-t border-line pt-10 md:grid-cols-2 md:gap-8">
          <p className="text-quote font-light italic">“{dict.quote}”</p>
          <footer className="self-end text-body text-muted">{dict.cite}</footer>
        </blockquote>
      </Container>
    </Section>
  );
}
```
`src/components/sections/Faq.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import type { Dictionary } from "@/lib/schemas/dictionary";

export function Faq({ dict }: { dict: Dictionary["faq"] }) {
  return (
    <Section tone="stone" id="faq">
      <Container className="flex flex-col gap-14">
        <Heading size="h2" variant="thin">{dict.title}</Heading>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16">
          {dict.items.map((item) => (
            <div key={item.q} className="flex flex-col gap-3 border-t border-oak pt-6">
              <h3 className="m-0 text-faq font-medium">{item.q}</h3>
              <p className="max-w-[540px] text-body text-muted-strong">{item.a}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 8: Compose the page**

`src/app/[lang]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Built } from "@/components/sections/Built";
import { Faq } from "@/components/sections/Faq";
import { FilmStrip } from "@/components/sections/FilmStrip";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { LineToLight } from "@/components/sections/LineToLight/LineToLight";
import { Rooms } from "@/components/sections/Rooms";
import { SelectedProjects } from "@/components/sections/SelectedProjects";
import { Services } from "@/components/sections/Services";
import { getDictionary, getFeaturedProjects, getHome } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const home = getHome();
  return (
    <>
      <Header lang={lang} dict={dict} variant="overlay" />
      <main id="main">
        <Hero lang={lang} dict={dict.hero} image={home.hero} />
        <Intro lang={lang} dict={dict.intro} images={home.intro} />
        <SelectedProjects lang={lang} dict={dict.selected} projects={getFeaturedProjects()} />
        <FilmStrip lang={lang} dict={dict.strip} items={home.filmStrip} />
        <LineToLight lang={lang} dict={dict.lineToLight} images={home.lineToLight} />
        <Rooms lang={lang} dict={dict.rooms} rooms={home.rooms} />
        <Services lang={lang} dict={dict.services} images={home.services} />
        <Built dict={dict.built} />
        <Faq dict={dict.faq} />
      </main>
    </>
  );
}
```

- [ ] **Step 9: Verify visually against the design, then tests**

```bash
npm run dev
```
Open `/en` at 1440, 768, 360 and compare with `reference/design-canvas/home.html` (open in a browser) and `reference/screenshot-home-{desktop,mobile}.png`. Check: hero text sizes, 96px gutters at 1440, section backgrounds (plaster/stone/charcoal/deep), cove-light line under header, film strip speed. Fix deviations with tokens only.
```bash
npm run test:e2e && npm run validate
git add -A && git status --short
git commit -m "feat(home): build home page sections (#8)"
```

---

## Task 8 (issue #9): feat: projects page

**Issue:** Goal — browse all projects with big type and big thumbnails, filter by category. Scope — `/[lang]/projects`, `ProjectFilter` (client), `ProjectList` rows. Acceptance — buttons All/House/Bedroom/Kids room with `aria-pressed`; filtering updates the list and announces the count; no horizontal scroll at 360px. Label `feat`. Branch `feat/9-projects-page`.

**Files:**
- Modify: `src/app/[lang]/projects/page.tsx`, `tests/e2e/responsive.spec.ts` (add `/en/projects`, `/id/projects` to `routes`)
- Create: `src/components/sections/ProjectFilter.tsx`, `src/components/sections/ProjectList.tsx`
- Test: `tests/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `getProjects()`, `categories` from `@/lib/schemas/project`, `format`.
- Produces: `<ProjectRow project lang>` (server) in `ProjectList.tsx`; `ProjectFilter` props `{ filters: { value: "all" | Category; label: string }[]; rows: { key: string; category: Category; node: ReactNode }[]; labels: { group: string; resultCount: string; empty: string } }`.

- [ ] **Step 1: Failing e2e test**

`tests/e2e/projects.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("filter buttons toggle aria-pressed and filter the list", async ({ page }) => {
  await page.goto("/en/projects");
  const group = page.getByRole("group", { name: "Filter projects" });
  const all = group.getByRole("button", { name: "All" });
  const bedroom = group.getByRole("button", { name: "Bedroom" });
  const rows = page.locator("[data-project-row]");

  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(rows).toHaveCount(5);

  await bedroom.click();
  await expect(bedroom).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(rows).toHaveCount(2);
  await expect(page.getByText("2 projects shown")).toBeAttached();

  await group.getByRole("button", { name: "Kids room" }).click();
  await expect(rows).toHaveCount(1);
});

test("rows link to project detail pages", async ({ page }) => {
  await page.goto("/id/projects");
  await expect(page.locator("[data-project-row]").first()).toHaveAttribute("href", "/id/projects/rh-house");
});

test("filter works with the keyboard", async ({ page }) => {
  await page.goto("/en/projects");
  const house = page.getByRole("button", { name: "House" });
  await house.focus();
  await page.keyboard.press("Enter");
  await expect(house).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-project-row]")).toHaveCount(2);
});
```
Run → FAIL.

- [ ] **Step 2: ProjectRow (server)**

`src/components/sections/ProjectList.tsx`:
```tsx
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

type ProjectRowProps = { project: Project; lang: Locale };

export function ProjectRow({ project, lang }: ProjectRowProps) {
  return (
    <Link
      data-project-row
      href={localizedPath(lang, `/projects/${project.slug}`)}
      className="group flex flex-col items-start gap-5 border-t border-line py-8 no-underline md:min-h-[380px] md:flex-row md:items-center md:gap-12 md:py-0"
    >
      <span className="grow text-list font-light group-hover:text-oak">{project.name}</span>
      <span className="flex flex-col gap-1.5 text-base text-muted md:w-[260px]">
        <span>{pick(project.type, lang)}</span>
        <span>{project.city}, {project.year}</span>
        <span>{pick(project.scope, lang)}</span>
      </span>
      <Photo
        src={project.cover.src}
        alt={pick(project.cover.alt, lang)}
        position={project.cover.position}
        sizes="(min-width: 1280px) 560px, (min-width: 768px) 380px, 100vw"
        className="relative order-first aspect-video w-full shrink-0 md:order-none md:aspect-auto md:h-[214px] md:w-[380px] xl:h-[316px] xl:w-[560px]"
      />
    </Link>
  );
}
```

- [ ] **Step 3: ProjectFilter (client)**

`src/components/sections/ProjectFilter.tsx`:
```tsx
"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { format } from "@/lib/i18n/format";
import type { Category } from "@/lib/schemas/project";

type FilterValue = "all" | Category;
type ProjectFilterProps = {
  filters: { value: FilterValue; label: string }[];
  rows: { key: string; category: Category; node: ReactNode }[];
  labels: { group: string; resultCount: string; empty: string };
};

export function ProjectFilter({ filters, rows, labels }: ProjectFilterProps) {
  const [active, setActive] = useState<FilterValue>("all");
  const visible = active === "all" ? rows : rows.filter((row) => row.category === active);
  return (
    <>
      <div role="group" aria-label={labels.group} className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const pressed = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={pressed}
              onClick={() => setActive(filter.value)}
              className={cn(
                "min-h-11 rounded-full border border-ink px-5.5 text-base",
                pressed ? "bg-ink text-plaster" : "bg-transparent text-ink hover:bg-stone",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">{format(labels.resultCount, { count: visible.length })}</p>
      <div className="mt-16 flex flex-col border-b border-line">
        {visible.length === 0 ? <p className="py-12 text-body-lg text-muted">{labels.empty}</p> : visible.map((row) => <div key={row.key}>{row.node}</div>)}
      </div>
    </>
  );
}
```
`rows[].node` are server-rendered `ProjectRow` elements passed through the client boundary (allowed: React elements are serializable RSC payload).

- [ ] **Step 4: Page**

`src/app/[lang]/projects/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ProjectFilter } from "@/components/sections/ProjectFilter";
import { ProjectRow } from "@/components/sections/ProjectList";
import { Container } from "@/components/ui/Container";
import { Heading, HeadingEm, HeadingThin } from "@/components/ui/Heading";
import { getDictionary, getProjects } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";
import { categories } from "@/lib/schemas/project";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const page = dict.projectsPage;
  const filters = [{ value: "all" as const, label: page.filters.all }, ...categories.map((c) => ({ value: c, label: page.filters[c] }))];
  const rows = getProjects().map((project) => ({
    key: project.slug,
    category: project.category,
    node: <ProjectRow project={project} lang={lang} />,
  }));
  return (
    <>
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main" className="pt-section pb-section">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Heading as="h1" size="display-lg">
              <HeadingThin>{page.title1} </HeadingThin>
              <HeadingEm>{page.title2}</HeadingEm>
            </Heading>
            <p className="max-w-[460px] text-body-lg text-muted">{page.lead}</p>
          </div>
          <ProjectFilter filters={filters} rows={rows} labels={{ group: page.filterLabel, resultCount: page.resultCount, empty: page.empty }} />
        </Container>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Verify against `reference/design-canvas/projects.html`, tests, commit**

Add `"/en/projects", "/id/projects"` to `routes` in `tests/e2e/responsive.spec.ts`.
```bash
npm run test:e2e && npm run validate
git add -A && git commit -m "feat(projects): add projects page with category filter (#9)"
```

---

## Task 9 (issue #10): feat: project detail page

**Issue:** Goal — a static, image-led page per project. Scope — `/[lang]/projects/[slug]`: hero, title + specs, brief & approach, gallery, drawing vs render, full-bleed detail image, next project, contact CTA (footer). Acceptance — all 5 projects × 2 locales statically generated; unknown slug → 404; projects without gallery/drawing render no empty sections; next link wraps from last to first. Label `feat`. Branch `feat/10-project-detail`.

**Files:**
- Create: `src/app/[lang]/projects/[slug]/page.tsx`, `src/components/sections/project/{ProjectHero,ProjectSpecs,ProjectStory,ProjectGallery,DrawingPair,NextProject}.tsx`
- Modify: `tests/e2e/routing.spec.ts` (un-fixme slug test), `tests/e2e/layout.spec.ts` (use `/en/projects/rh-house`), `tests/e2e/responsive.spec.ts` (add `/en/projects/rh-house`, `/id/projects/nn-house`)
- Test: `tests/e2e/project-detail.spec.ts`, `tests/unit/projects.test.ts`

**Interfaces:**
- Consumes: `getProjects`, `getProject`, `getNextProject`, `pick`.
- Produces: `generateStaticParams(): { slug: string }[]` for `[slug]`.

- [ ] **Step 1: Failing tests**

`tests/unit/projects.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getFeaturedProjects, getNextProject, getProject, getProjects } from "@/lib/content";

describe("project repository", () => {
  it("sorts by order", () => {
    expect(getProjects().map((p) => p.slug)).toEqual(["rh-house", "rs-house", "ny-nursery", "ef-bedroom", "nn-house"]);
  });
  it("finds by slug and returns undefined for unknown slugs", () => {
    expect(getProject("rh-house")?.name).toBe("RH House");
    expect(getProject("nope")).toBeUndefined();
  });
  it("wraps next project from last to first", () => {
    expect(getNextProject("rh-house").slug).toBe("rs-house");
    expect(getNextProject("nn-house").slug).toBe("rh-house");
  });
  it("returns featured projects", () => {
    expect(getFeaturedProjects().length).toBeGreaterThan(0);
  });
});
```
`tests/e2e/project-detail.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("full project renders every block", async ({ page }) => {
  await page.goto("/en/projects/rh-house");
  await expect(page.getByRole("heading", { level: 1, name: "RH House" })).toBeVisible();
  for (const term of ["Location", "Type", "Area", "Scope", "Duration", "Year"]) {
    await expect(page.locator("dt", { hasText: term })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "The brief" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From line to light." })).toBeVisible();
  await expect(page.getByRole("link", { name: "RS House" })).toHaveAttribute("href", "/en/projects/rs-house");
});

test("project without gallery or drawing shows no empty sections", async ({ page }) => {
  await page.goto("/id/projects/nn-house");
  await expect(page.getByRole("heading", { level: 1, name: "NN House" })).toBeVisible();
  await expect(page.locator("[data-gallery]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "From line to light." })).toHaveCount(0);
  const broken = await page.locator("main img").evaluateAll((imgs) =>
    imgs.filter((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0).length,
  );
  expect(broken).toBe(0);
  await expect(page.getByRole("link", { name: "RH House" })).toHaveAttribute("href", "/id/projects/rh-house");
});
```
Remove `test.fixme` from the unknown-slug test; change the language-switch test URL to `/en/projects/rh-house`. Run → FAIL.

- [ ] **Step 2: Components**

`src/components/sections/project/ProjectHero.tsx`:
```tsx
import { CoveLight } from "@/components/ui/CoveLight";
import { Photo } from "@/components/ui/Photo";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";

export function ProjectHero({ image, lang }: { image: ImageContent; lang: Locale }) {
  return (
    <section className="relative h-[60svh] min-h-[360px] overflow-hidden bg-charcoal md:h-[760px]">
      <Photo src={image.src} alt={pick(image.alt, lang)} position={image.position} sizes="100vw" priority />
      <CoveLight className="top-0" />
    </section>
  );
}
```
`src/components/sections/project/ProjectSpecs.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { localizedPath, pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";

type ProjectSpecsProps = { project: Project; lang: Locale; dict: Dictionary["project"] };

export function ProjectSpecs({ project, lang, dict }: ProjectSpecsProps) {
  const specs = [
    [dict.location, project.city],
    [dict.type, pick(project.type, lang)],
    [dict.area, project.area],
    [dict.scope, pick(project.scope, lang)],
    [dict.duration, pick(project.duration, lang)],
    [dict.year, project.year],
  ] as const;
  return (
    <Section>
      <Container className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-24">
        <div className="flex max-w-[700px] flex-col gap-6">
          <TextLink href={localizedPath(lang, "/projects")} className="self-start text-base text-muted">{dict.back}</TextLink>
          <Heading as="h1" size="display-lg" variant="thin">{project.name}</Heading>
          <p className="text-summary font-medium italic">{pick(project.summary, lang)}</p>
        </div>
        <dl className="grid w-full grid-cols-[120px_minmax(0,1fr)] content-start gap-x-6 gap-y-4 text-body lg:w-[400px] lg:shrink-0 lg:pt-10">
          {specs.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-muted">{term}</dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
```
`src/components/sections/project/ProjectStory.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/schemas/dictionary";
import type { Project } from "@/lib/schemas/project";

type ProjectStoryProps = { project: Project; lang: Locale; dict: Dictionary["project"] };

export function ProjectStory({ project, lang, dict }: ProjectStoryProps) {
  const blocks = [
    { title: dict.brief, body: pick(project.brief, lang) },
    { title: dict.approach, body: pick(project.approach, lang) },
  ];
  return (
    <Section tone="stone">
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-24">
        {blocks.map((block) => (
          <div key={block.title} className="flex flex-col gap-4.5">
            <Heading size="h3" variant="thin">{block.title}</Heading>
            <p className="text-body-lg text-muted-strong">{block.body}</p>
          </div>
        ))}
      </Container>
    </Section>
  );
}
```
`src/components/sections/project/ProjectGallery.tsx` — gallery layout by index, matching the design (`[0]` wide, `[1..2]` pair; `[3]` is the full-bleed detail; `[4..]` in 2fr/3fr pairs):
```tsx
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { ImageContent } from "@/lib/schemas/common";

type GalleryProps = { images: ImageContent[]; lang: Locale };

function Img({ image, lang, sizes, className }: { image: ImageContent; lang: Locale; sizes: string; className: string }) {
  return <Photo src={image.src} alt={pick(image.alt, lang)} position={image.position} sizes={sizes} className={`relative w-full ${className}`} />;
}

/** gallery[0..2]: one wide image, then a pair. */
export function ProjectGalleryLead({ images, lang }: GalleryProps) {
  const [wide, ...pair] = images.slice(0, 3);
  if (!wide) return null;
  return (
    <Section data-gallery>
      <Container className="flex flex-col gap-8">
        <Img image={wide} lang={lang} sizes="100vw" className="h-[clamp(320px,44vw,640px)]" />
        {pair.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {pair.map((image) => (
              <Img key={image.src} image={image} lang={lang} sizes="(min-width: 640px) 50vw, 100vw" className="h-[clamp(280px,33vw,480px)]" />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/** gallery[3]: full-bleed detail image. */
export function ProjectDetailImage({ image, lang, label }: { image: ImageContent | undefined; lang: Locale; label: string }) {
  if (!image) return null;
  return (
    <section data-gallery aria-label={label} className="relative h-[clamp(360px,50vw,720px)] overflow-hidden">
      <Photo src={image.src} alt={pick(image.alt, lang)} position={image.position} sizes="100vw" />
    </section>
  );
}

/** gallery[4..]: pairs at 2fr / 3fr. */
export function ProjectGalleryRest({ images, lang }: GalleryProps) {
  const rest = images.slice(4);
  if (rest.length === 0) return null;
  return (
    <Section data-gallery>
      <Container className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_3fr]">
        {rest.map((image) => (
          <Img key={image.src} image={image} lang={lang} sizes="(min-width: 768px) 60vw, 100vw" className="h-[clamp(320px,40vw,580px)]" />
        ))}
      </Container>
    </Section>
  );
}
```
Rename the file's exports accordingly (no default export named `ProjectGallery`; the file holds the three gallery blocks).

`src/components/sections/project/DrawingPair.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pick, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

type DrawingPairProps = {
  pair: Project["drawing"];
  lang: Locale;
  labels: { title: string; drawing: string; finished: string };
};

export function DrawingPair({ pair, lang, labels }: DrawingPairProps) {
  if (!pair) return null;
  const figures = [
    { image: pair.drawing, caption: labels.drawing, bg: "bg-paper" },
    { image: pair.render, caption: labels.finished, bg: "" },
  ];
  return (
    <Section tone="charcoal">
      <Container className="flex flex-col gap-12">
        <Heading size="h2-em" variant="boldItalic">{labels.title}</Heading>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {figures.map(({ image, caption, bg }) => (
            <figure key={image.src} className="m-0 flex flex-col gap-3.5">
              <Photo src={image.src} alt={pick(image.alt, lang)} sizes="(min-width: 768px) 50vw, 100vw" className={`relative h-[clamp(360px,39vw,560px)] w-full ${bg}`} />
              <figcaption className="text-base text-mist">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```
`src/components/sections/project/NextProject.tsx`:
```tsx
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { Project } from "@/lib/schemas/project";

export function NextProject({ project, lang, label }: { project: Project; lang: Locale; label: string }) {
  return (
    <section className="theme-dark bg-deep py-section text-plaster">
      <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <span className="text-body text-dim">{label}</span>
        <Link href={localizedPath(lang, `/projects/${project.slug}`)} className="text-display-lg font-semibold italic no-underline hover:text-glow">
          {project.name}
        </Link>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Page**

`src/app/[lang]/projects/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DrawingPair } from "@/components/sections/project/DrawingPair";
import { NextProject } from "@/components/sections/project/NextProject";
import { ProjectDetailImage, ProjectGalleryLead, ProjectGalleryRest } from "@/components/sections/project/ProjectGallery";
import { ProjectHero } from "@/components/sections/project/ProjectHero";
import { ProjectSpecs } from "@/components/sections/project/ProjectSpecs";
import { ProjectStory } from "@/components/sections/project/ProjectStory";
import { getDictionary, getNextProject, getProject, getProjects } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = { params: Promise<{ lang: string; slug: string }> };

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const dict = getDictionary(lang);
  return (
    <>
      <Header lang={lang} dict={dict} variant="solid" />
      <main id="main">
        <ProjectHero image={project.cover} lang={lang} />
        <ProjectSpecs project={project} lang={lang} dict={dict.project} />
        <ProjectStory project={project} lang={lang} dict={dict.project} />
        <ProjectGalleryLead images={project.gallery} lang={lang} />
        <DrawingPair
          pair={project.drawing}
          lang={lang}
          labels={{ title: dict.lineToLight.title, drawing: dict.project.drawing, finished: dict.project.finished }}
        />
        <ProjectDetailImage image={project.gallery[3]} lang={lang} label={dict.project.detail} />
        <ProjectGalleryRest images={project.gallery} lang={lang} />
        <NextProject project={getNextProject(slug)} lang={lang} label={dict.project.next} />
      </main>
    </>
  );
}
```
`Section` must forward `data-gallery`: add `"data-gallery"?: boolean` to `SectionProps` and spread it onto `<section>`.

- [ ] **Step 4: Verify against `reference/design-canvas/project-detail.html` and `reference/screenshot-project-desktop.png`; tests; commit**

```bash
npm run build   # expect 10 project pages under /[lang]/projects/[slug] in the route summary (● SSG)
npm run test && npm run test:e2e && npm run validate
git add -A && git commit -m "feat(projects): add static project detail pages (#10)"
```

---

## Task 10 (issue #11): feat: SEO

**Issue:** Goal — each route is discoverable in EN and ID local search. Scope — typed env (`config/env.ts`), metadata builders, canonical + hreflang, OG/Twitter, dynamic OG images, sitemap with alternates, robots, JSON-LD (`HomeAndConstructionBusiness`, `BreadcrumbList`) with `<` escaped. Acceptance — Playwright asserts title, canonical, hreflang (en, id, x-default) and JSON-LD on all 6 route kinds; JSON-LD contains no placeholder values; `/sitemap.xml` lists 14 URLs with alternates. Label `feat`. Branch `feat/11-seo`.

**Files:**
- Create: `src/config/env.ts`, `src/lib/seo/{metadata,jsonld,og}.ts(x)`, `src/lib/seo/JsonLd.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[lang]/{opengraph-image,twitter-image}.tsx`, `src/app/[lang]/projects/[slug]/{opengraph-image,twitter-image}.tsx`
- Modify: `src/app/[lang]/layout.tsx`, `page.tsx`, `projects/page.tsx`, `projects/[slug]/page.tsx`, `.env.example` (unchanged keys), `playwright.config.ts` (unchanged)
- Test: `tests/unit/{env,metadata,jsonld}.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Produces:
  - `env: { NEXT_PUBLIC_SITE_URL: string /* no trailing slash */; SITE_ENV: "development" | "preview" | "production" }` and `parseEnv(source: Record<string, string | undefined>)` from `@/config/env`
  - `buildMetadata(input: { lang: Locale; path: string; title: string; description: string }): Metadata`
  - `alternatesFor(path: string): Record<"en" | "id" | "x-default", string>`
  - `businessJsonLd(site: Site, lang: Locale, baseUrl: string, image: string): Record<string, unknown>`
  - `breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown>`
  - `withoutPlaceholders<T>(value: T): T | undefined`
  - `serializeJsonLd(data: unknown): string`
  - `<JsonLd data={...} />`
  - `renderOgImage(input: { title: string; subtitle: string }): ImageResponse`

- [ ] **Step 1: Failing unit tests**

`tests/unit/env.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

describe("env", () => {
  it("applies defaults and strips the trailing slash", () => {
    expect(parseEnv({})).toEqual({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000", SITE_ENV: "development" });
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "https://studiojhwa.example/" }).NEXT_PUBLIC_SITE_URL).toBe("https://studiojhwa.example");
  });
  it("fails with a readable message on invalid values", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrowError(/NEXT_PUBLIC_SITE_URL/);
    expect(() => parseEnv({ SITE_ENV: "prod" })).toThrowError(/SITE_ENV/);
  });
});
```
`tests/unit/metadata.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { alternatesFor, buildMetadata } from "@/lib/seo/metadata";

describe("metadata", () => {
  it("builds canonical and hreflang alternates", () => {
    expect(alternatesFor("/projects")).toEqual({ en: "/en/projects", id: "/id/projects", "x-default": "/en/projects" });
    const meta = buildMetadata({ lang: "id", path: "/projects", title: "T", description: "D" });
    expect(meta.alternates?.canonical).toBe("/id/projects");
    expect(meta.openGraph).toMatchObject({ locale: "id_ID", url: "/id/projects", title: "T" });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
```
`tests/unit/jsonld.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getSite } from "@/lib/content";
import { breadcrumbJsonLd, businessJsonLd, serializeJsonLd, withoutPlaceholders } from "@/lib/seo/jsonld";

describe("json-ld", () => {
  it("escapes < so a string cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });

  it("drops placeholder values and objects left with only @type", () => {
    expect(withoutPlaceholders({ a: "[PLACEHOLDER]", b: "ok", c: { "@type": "X", d: "[City]" } })).toEqual({ b: "ok" });
    expect(withoutPlaceholders(["[x]", "y"])).toEqual(["y"]);
  });

  it("business JSON-LD never publishes placeholders", () => {
    const data = businessJsonLd(getSite(), "en", "https://example.com", "https://example.com/images/home/dining.jpg");
    expect(JSON.stringify(data)).not.toMatch(/\[[^\]]+\]/);
    expect(data).toMatchObject({ "@type": "HomeAndConstructionBusiness", name: "studioJHWA" });
  });

  it("builds a breadcrumb list with positions", () => {
    const data = breadcrumbJsonLd([{ name: "Home", url: "https://e.com/en" }, { name: "Projects", url: "https://e.com/en/projects" }]);
    expect(data).toMatchObject({ "@type": "BreadcrumbList", itemListElement: [{ position: 1 }, { position: 2 }] });
  });
});
```
Run → FAIL.

- [ ] **Step 2: `src/config/env.ts`**

```ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL, e.g. https://studiojhwa.com" })
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/+$/, "")),
  SITE_ENV: z.enum(["development", "preview", "production"], { message: "SITE_ENV must be development, preview or production" }).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse({
    // Hosting dashboards may set a variable to ""; treat that as unset.
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL || undefined,
    SITE_ENV: source.SITE_ENV || undefined,
  });
  if (!result.success) throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** The only place in the app that reads process.env. */
export const env = parseEnv(process.env);
```

- [ ] **Step 3: Metadata builders**

`src/lib/seo/metadata.ts`:
```ts
import type { Metadata } from "next";
import { SITE_NAME } from "@/config/constants";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";

const ogLocale: Record<Locale, string> = { en: "en_US", id: "id_ID" };

export function alternatesFor(path: string): Record<Locale | "x-default", string> {
  return { en: `/en${path}`, id: `/id${path}`, "x-default": `/${defaultLocale}${path}` };
}

type MetadataInput = { lang: Locale; path: string; title: string; description: string };

export function buildMetadata({ lang, path, title, description }: MetadataInput): Metadata {
  const url = `/${lang}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alternatesFor(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale[lang],
      alternateLocale: Object.entries(ogLocale).filter(([l]) => l !== lang).map(([, v]) => v),
      url,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
```
In `src/app/[lang]/layout.tsx` add:
```tsx
import type { Metadata } from "next";
import { env } from "@/config/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  icons: { icon: "/favicon.svg" },
};
```
Pages add `generateMetadata`:
- Home: `buildMetadata({ lang, path: "", title: dict.meta.home.title, description: dict.meta.home.description })`
- Projects: `path: "/projects"`, `dict.meta.projects`
- Detail: `path: \`/projects/${slug}\``, `title: format(dict.meta.project.title, { name: project.name })`, `description: format(dict.meta.project.description, { name: project.name, type: pick(project.type, lang), city: project.city })`
Each `generateMetadata({ params })` awaits params, validates with `isLocale`/`getProject`, and calls `notFound()` otherwise.

- [ ] **Step 4: JSON-LD**

`src/lib/seo/jsonld.ts`:
```ts
import type { Locale } from "@/lib/i18n/locales";
import { isPlaceholder } from "@/lib/schemas/common";
import type { Site } from "@/lib/schemas/site";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Removes placeholder strings; drops arrays/objects that end up empty (or only "@type"). */
export function withoutPlaceholders<T>(value: T): T | undefined {
  if (typeof value === "string") return isPlaceholder(value) ? undefined : value;
  if (Array.isArray(value)) {
    const items = value.map((v) => withoutPlaceholders(v)).filter((v) => v !== undefined);
    return (items.length ? items : undefined) as T | undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, withoutPlaceholders(v)] as const)
      .filter(([, v]) => v !== undefined);
    const meaningful = entries.filter(([k]) => k !== "@type" && k !== "@context");
    return (meaningful.length ? Object.fromEntries(entries) : undefined) as T | undefined;
  }
  return value;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function businessJsonLd(site: Site, lang: Locale, baseUrl: string, image: string): Record<string, Json> {
  const { contact, address } = site;
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${baseUrl}/#business`,
    name: site.name,
    legalName: site.legalName,
    slogan: site.tagline,
    description: site.description[lang],
    url: `${baseUrl}/${lang}`,
    image,
    telephone: isPlaceholder(contact.whatsapp) ? undefined : `+${contact.whatsapp}`,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: address.geo ? { "@type": "GeoCoordinates", latitude: address.geo.lat, longitude: address.geo.lng } : undefined,
    areaServed: site.serviceAreas.map((name) => ({ "@type": "City", name })),
    sameAs: site.socials.map((s) => s.url),
    openingHoursSpecification: site.businessHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
  return withoutPlaceholders(JSON.parse(JSON.stringify(data)) as Record<string, Json>) ?? {};
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, Json> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}
```
Note: `address` keeps `addressRegion` + `addressCountry` (real values) so it survives; an `OpeningHoursSpecification` whose fields are all placeholders is dropped, and the empty array with it. `JSON.parse(JSON.stringify(...))` removes `undefined` keys.

`src/lib/seo/JsonLd.tsx`:
```tsx
import { serializeJsonLd } from "./jsonld";

/** The only allowed use of dangerouslySetInnerHTML (CLAUDE.md §7): input is our own data, `<` is escaped. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
```
Render `<JsonLd data={businessJsonLd(getSite(), lang, env.NEXT_PUBLIC_SITE_URL, env.NEXT_PUBLIC_SITE_URL + getHome().hero.src)} />` in the `[lang]` layout `<body>` (every page), and on the detail page `<JsonLd data={breadcrumbJsonLd([{ name: dict.breadcrumb.home, url: `${base}/${lang}` }, { name: dict.breadcrumb.projects, url: `${base}/${lang}/projects` }, { name: project.name, url: `${base}/${lang}/projects/${project.slug}` }])} />`. Add an ESLint override allowing `react/no-danger` only in `src/lib/seo/JsonLd.tsx` if the rule is active: `{ files: ["src/lib/seo/JsonLd.tsx"], rules: { "react/no-danger": "off" } }`, and set `"react/no-danger": "error"` globally.

- [ ] **Step 5: OG / Twitter images**

`src/lib/seo/og.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { brandColors, SITE_NAME } from "@/config/constants";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export function renderOgImage({ title, subtitle }: { title: string; subtitle: string }): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: brandColors.charcoal, color: brandColors.plaster }}>
        <div style={{ height: 2, width: "100%", background: brandColors.glow, boxShadow: `0 0 32px 8px ${brandColors.glow}66` }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{title}</div>
          <div style={{ fontSize: 30, color: brandColors.mist }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 28 }}>{SITE_NAME}</div>
      </div>
    ),
    OG_SIZE,
  );
}
```
(Default font; embedding Jost in OG images is a known limitation, listed in the final report.) The hex `66` suffix is in `lib/seo`, not in `components/`, so the token test still passes.

`src/app/[lang]/opengraph-image.tsx`:
```tsx
import { getDictionary } from "@/lib/content";
import { isLocale } from "@/lib/i18n/locales";
import { renderOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "studioJHWA";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "en");
  return renderOgImage({ title: `${dict.hero.line1} ${dict.hero.line2}`, subtitle: dict.hero.eyebrow });
}
```
`src/app/[lang]/twitter-image.tsx`: identical file content (Next reads `size`/`contentType`/`alt` statically from each route file, so they are not re-exported).

`src/app/[lang]/projects/[slug]/opengraph-image.tsx`:
```tsx
import { getDictionary, getProject } from "@/lib/content";
import { isLocale, pick } from "@/lib/i18n/locales";
import { renderOgImage } from "@/lib/seo/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "studioJHWA project";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const project = getProject(slug);
  const dict = getDictionary(locale);
  return renderOgImage({ title: project?.name ?? dict.hero.line1, subtitle: project ? pick(project.type, locale) : dict.hero.eyebrow });
}
```
Plus identical `twitter-image.tsx`. Verify after build: `curl -sI localhost:3100/en/opengraph-image` → `200`, `content-type: image/png` (check the exact generated URL in the page's `og:image` meta).

- [ ] **Step 6: Sitemap and robots**

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { getProjects } from "@/lib/content";
import { locales } from "@/lib/i18n/locales";
import { alternatesFor } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const paths = ["", "/projects", ...getProjects().map((p) => `/projects/${p.slug}`)];
  const absolute = (languages: Record<string, string>) =>
    Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${base}${path}`]));
  return paths.flatMap((path) =>
    locales.map((lang) => ({ url: `${base}/${lang}${path}`, alternates: { languages: absolute(alternatesFor(path)) } })),
  );
}
```
(No `lastModified`: we have no reliable date and must not invent one.) 7 paths × 2 locales = 14 URLs.

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  if (env.SITE_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` };
}
```

- [ ] **Step 7: Playwright smoke test**

`tests/e2e/seo.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

const BASE = "http://localhost:3100";
const routes = ["/en", "/id", "/en/projects", "/id/projects", "/en/projects/rh-house", "/id/projects/rh-house"];

for (const route of routes) {
  test(`${route} has title, canonical, hreflang and JSON-LD`, async ({ page }) => {
    await page.goto(route);
    expect((await page.title()).length).toBeGreaterThan(10);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${BASE}${route}`);
    const path = route.replace(/^\/(en|id)/, "");
    for (const [hreflang, href] of [["en", `/en${path}`], ["id", `/id${path}`], ["x-default", `/en${path}`]] as const) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute("href", `${BASE}${href}`);
    }
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
    expect(types).toContain("HomeAndConstructionBusiness");
    if (route.includes("/projects/")) expect(types).toContain("BreadcrumbList");
    expect(blocks.join("")).not.toMatch(/\[[^\]]+\]/);
  });
}

test("id home title uses local search terms", async ({ page }) => {
  await page.goto("/id");
  await expect(page).toHaveTitle(/Jasa Desain Interior Surabaya/);
});

test("sitemap lists every localized URL", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml.match(/<url>/g)).toHaveLength(14);
  expect(xml).toContain('hreflang="x-default"');
});
```
Note: `playwright.config.ts` already sets `NEXT_PUBLIC_SITE_URL=http://localhost:3100` for the web server build. If canonical `href` is emitted as relative, the test fails — Next resolves it against `metadataBase`, so it must be absolute.

- [ ] **Step 8: Run, validate, commit**

```bash
npm run test && npm run test:e2e && npm run validate
git add -A && git commit -m "feat(seo): add metadata, hreflang, OG images, sitemap, robots and JSON-LD (#11)"
```
Update README later (Task 14) with env vars; `.env.example` already lists both.

---

## Task 11 (issue #12): security: hardening

**Issue:** Goal — defence-in-depth HTTP headers and safe defaults. Scope — headers in `next.config.ts` (one place), `poweredByHeader: false` (already set; test it), env parsing tests (done in Task 10), external-link audit, `SECURITY.md`, `npm audit` clean at high/critical. Acceptance — Playwright verifies every header on HTML routes and static assets; all `target=_blank` links carry `rel="noopener noreferrer"`; `npm audit --audit-level=high` exits 0. Label `security`. Branch `security/12-hardening`.

**Risk areas:** HTTP security headers (clickjacking, MIME sniffing, referrer leakage, XSS impact reduction), secrets management, dependency security, output encoding.

**Files:**
- Modify: `next.config.ts`, `eslint.config.mjs` (no-restricted-syntax for `process.env` outside config)
- Create: `src/config/security-headers.ts`, `SECURITY.md`
- Test: `tests/unit/security-headers.test.ts`, `tests/e2e/security.spec.ts`

**Interfaces:**
- Produces: `securityHeaders(opts: { dev: boolean; https: boolean; indexable: boolean }): { key: string; value: string }[]` from `src/config/security-headers.ts` (pure; imported by `next.config.ts`).

- [ ] **Step 1: Failing tests**

`tests/unit/security-headers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { securityHeaders } from "@/config/security-headers";

const toMap = (h: { key: string; value: string }[]) => Object.fromEntries(h.map(({ key, value }) => [key, value]));

describe("security headers", () => {
  const prod = toMap(securityHeaders({ dev: false, https: true, indexable: true }));

  it("sets a strict CSP", () => {
    const csp = prod["Content-Security-Policy"];
    for (const directive of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests"]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain("unsafe-eval");
  });

  it("sets HSTS, nosniff, referrer and permissions policies", () => {
    expect(prod["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(prod["X-Content-Type-Options"]).toBe("nosniff");
    expect(prod["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(prod["Permissions-Policy"]).toContain("camera=()");
    expect(prod["X-Frame-Options"]).toBe("DENY");
    expect(prod["X-Robots-Tag"]).toBeUndefined();
  });

  it("allows eval only in dev, and skips HTTPS-only headers on http", () => {
    const dev = toMap(securityHeaders({ dev: true, https: false, indexable: false }));
    expect(dev["Content-Security-Policy"]).toContain("'unsafe-eval'");
    expect(dev["Content-Security-Policy"]).not.toContain("upgrade-insecure-requests");
    expect(dev["Strict-Transport-Security"]).toBeUndefined();
    expect(dev["X-Robots-Tag"]).toBe("noindex, nofollow");
  });
});
```
`tests/e2e/security.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

for (const path of ["/en", "/id/projects", "/en/projects/rh-house", "/favicon.svg", "/sitemap.xml"]) {
  test(`${path} sends security headers`, async ({ request }) => {
    const res = await request.get(path);
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });
}

test("pages load with no CSP violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) violations.push(msg.text());
  });
  for (const path of ["/en", "/en/projects", "/en/projects/rh-house"]) await page.goto(path);
  expect(violations).toEqual([]);
});

test("external links are opened safely", async ({ page }) => {
  for (const path of ["/en", "/en/projects/rh-house"]) {
    await page.goto(path);
    const unsafe = await page.locator('a[target="_blank"]').evaluateAll((links) =>
      links.filter((a) => !/noopener/.test(a.getAttribute("rel") ?? "") || !/noreferrer/.test(a.getAttribute("rel") ?? "")).length,
    );
    expect(unsafe).toBe(0);
  }
});
```
Run → FAIL.

- [ ] **Step 2: `src/config/security-headers.ts`**

```ts
type Header = { key: string; value: string };
type Options = { dev: boolean; https: boolean; indexable: boolean };

/**
 * One place for HTTP security headers (CLAUDE.md §7).
 * CSP is a static allow-list (plan decision D2): 'unsafe-inline' for scripts is required by
 * App Router hydration without a per-request nonce; there are no third-party scripts.
 */
export function securityHeaders({ dev, https, indexable }: Options): Header[] {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
  ];
}
```
HSTS without `preload`: preloading is hard to undo and is a domain-owner decision (listed as a manual step).

- [ ] **Step 3: Wire into `next.config.ts`**

```ts
import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          dev: process.env.NODE_ENV === "development",
          https: siteUrl.startsWith("https://"),
          indexable: process.env.SITE_ENV === "production",
        }),
      },
    ];
  },
};

export default nextConfig;
```
(`next.config.ts` runs before the app, so it reads `process.env` directly — the documented exception in Global Constraints.)

- [ ] **Step 4: Enforce "only config reads process.env" with lint**

Add to `eslint.config.mjs`:
```js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/config/env.ts"],
  rules: {
    "no-restricted-syntax": ["error", { selector: "MemberExpression[object.name='process'][property.name='env']", message: "Read env via src/config/env.ts" }],
  },
},
```

- [ ] **Step 5: `SECURITY.md`**

```markdown
# Security policy

**Classification: INTERNAL**

## Reporting a vulnerability

Email **[SECURITY CONTACT EMAIL]** with a description and steps to reproduce. Do not open a public
issue. We aim to acknowledge within [X] business days.

## Supported versions

Only the latest release on `main` is supported.

## Measures in place

| Risk area | Control |
| --- | --- |
| Secrets management | No secrets in the repo; `.env*` git-ignored; `.env.example` lists keys only; gitleaks scans every PR |
| HTTP security headers | CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Powered-By` removed — all set in `src/config/security-headers.ts` |
| Output encoding / XSS | No `dangerouslySetInnerHTML` except the JSON-LD helper, which escapes `<` |
| Dependency security | Committed lockfile + `npm ci`; `npm audit --audit-level=high` in CI; Dependabot weekly; CodeQL (when available on the repo plan) |
| Input validation | No user input today; any future form must validate with Zod on the server and add rate limiting before going live |
| Personal data (UU PDP 27/2022) | The site publishes only public business contact data from `content/site.json`; no client or staff personal data, no analytics or cookies |
```

- [ ] **Step 6: Audit, verify headers against a real build, commit**

```bash
npm audit --audit-level=high || npm audit
```
If high/critical findings exist: `npm audit fix` (no `--force`); if a fix needs a breaking major, add a targeted `overrides` entry in `package.json` with a comment line in the PR explaining the advisory ID (copied from `npm audit` output, never invented) and re-run.
```bash
npm run build && npm run start -- -p 3100 & sleep 5; curl -sI localhost:3100/en | grep -iE 'content-security|strict-transport|x-content|referrer|permissions|x-powered'; kill %1
npm run test && npm run test:e2e && npm run validate
git add -A && git commit -m "feat(security): add security headers, env lint rule and SECURITY.md (#12)"
```
PR title: `feat(security): harden HTTP headers and dependencies` (`feat` so it is listed under Features in the changelog).

---

## Task 12 (issue #13): ci: release automation

**Issue:** Goal — merging `develop → main` produces a versioned, tagged GitHub Release with a changelog, then `develop` is synced. Scope — semantic-release config, `release.yml`, docs for `RELEASE_TOKEN` and branch-protection bypass. Acceptance — config validated; first release computes `v1.0.0`; documented token scopes. Label `ci`. Branch `ci/13-release-automation`.

**Files:**
- Create: `.releaserc.json`, `.github/workflows/release.yml`, `CHANGELOG.md` (header only)
- Modify: `package.json` (devDeps), `docs/DEPLOYMENT.md` (create with a Release section; Task 13 adds deployment sections), `docs/BRANCH_PROTECTION.md` (link)

- [ ] **Step 1: Verify and install**

```bash
for p in semantic-release @semantic-release/changelog @semantic-release/git; do
  npm view $p version --no-update-notifier; npm view $p deprecated --no-update-notifier
done
npm install --save-exact -D semantic-release@25.0.9 @semantic-release/changelog@7.0.0 @semantic-release/git@11.0.1
```
Expected: no `deprecated` output. `@semantic-release/commit-analyzer`, `release-notes-generator`, `npm`, `github` ship with `semantic-release`.

- [ ] **Step 2: `.releaserc.json`**

```json
{
  "branches": ["main"],
  "tagFormat": "v${version}",
  "plugins": [
    ["@semantic-release/commit-analyzer", { "preset": "angular" }],
    ["@semantic-release/release-notes-generator", { "preset": "angular" }],
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md", "changelogTitle": "# Changelog" }],
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/git", {
      "assets": ["package.json", "package-lock.json", "CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```
With no existing tags, semantic-release's first release is `1.0.0` (its documented default), provided at least one `feat`/`fix` commit is on `main` — there are many. `CHANGELOG.md`:
```markdown
# Changelog
```

- [ ] **Step 3: `.github/workflows/release.yml`**

```yaml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  issues: write
  pull-requests: write
concurrency:
  group: release
  cancel-in-progress: false
jobs:
  release:
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
        with:
          fetch-depth: 0
          token: ${{ secrets.RELEASE_TOKEN }}
      - uses: actions/setup-node@<sha> # <tag>
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run validate
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.RELEASE_TOKEN }}
          HUSKY: "0"
        run: npx semantic-release
      - name: Sync main back into develop
        env:
          GH_TOKEN: ${{ secrets.RELEASE_TOKEN }}
        run: |
          git fetch origin main develop
          if git merge-base --is-ancestor origin/develop origin/main; then
            git push origin origin/main:refs/heads/develop
          else
            gh pr create --base develop --head main \
              --title "chore: sync main into develop" \
              --body "Automated back-merge after release. Merge with a merge commit (not squash)." \
              || echo "Sync PR already open"
          fi
```
The fast-forward push is the only automated write to `develop`; it adds no new commits, only the release commit already on `main`.

- [ ] **Step 4: Validate config without publishing**

```bash
npx semantic-release --dry-run --no-ci --branches "$(git branch --show-current)" --plugins @semantic-release/commit-analyzer,@semantic-release/release-notes-generator 2>&1 | tail -20
```
Expected: logs "There is no previous release, the next release version is 1.0.0" (it may stop at "not a release branch"/auth; the version line is what we check). Do not pass any token on the command line.

- [ ] **Step 5: Docs**

Create `docs/DEPLOYMENT.md` with:
```markdown
# Deployment and release

**Classification: INTERNAL**

## Release

1. Open a PR `develop → main` titled `release: vX.Y.Z` (the version semantic-release will compute; the title is informational).
2. CI must be green. Merge with **"Create a merge commit"** (not squash) so every Conventional Commit reaches `main`.
3. `release.yml` runs on the push to `main`: validates, runs semantic-release (bumps `package.json`, updates `CHANGELOG.md`, commits `chore(release): X.Y.Z [skip ci]`, tags `vX.Y.Z`, publishes a GitHub Release), then fast-forwards `develop` to `main` (or opens a sync PR if `develop` moved on).

### `RELEASE_TOKEN`

Fine-grained personal access token owned by a repo admin, stored as an Actions secret `RELEASE_TOKEN`.

| Setting | Value |
| --- | --- |
| Resource owner | `ferivision` |
| Repository access | only `ferivision/studio-jhwa` |
| Permissions | Contents: read & write; Issues: read & write; Pull requests: read & write; Metadata: read |
| Expiry | ≤ 1 year; calendar a rotation reminder |

Why not `GITHUB_TOKEN`: pushes made with it do not trigger other workflows and cannot bypass branch protection.

### Branch protection and the release bot

When protection is applied (docs/BRANCH_PROTECTION.md), keep `enforce_admins: false` or add the token owner to the bypass list, otherwise the release commit on `main` and the fast-forward of `develop` are rejected.
```

- [ ] **Step 6: Commit**

```bash
npm run validate
git add -A && git commit -m "ci(release): add semantic-release on main with develop sync (#13)"
```

---

## Task 13 (issue #14): chore: deployment

**Issue:** Goal — production on Vercel now; a ready-to-use Docker/Caddy VPS path for later. Scope — Vercel docs (no `vercel.json` unless needed), standalone output (opt-in), Dockerfile, compose + Caddy, `/api/health`, `.dockerignore`, `deploy-vps.yml` (manual), rollback docs. Acceptance — `/api/health` returns `{"status":"ok"}`; `docker build` succeeds locally if Docker is available (else stated); workflow only has `workflow_dispatch`. Label `chore`. Branch `chore/14-deployment`.

**Files:**
- Create: `src/app/api/health/route.ts`, `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `Caddyfile`, `.github/workflows/deploy-vps.yml`
- Modify: `next.config.ts`, `docs/DEPLOYMENT.md`, `.gitignore` (already has `caddy_data/`, `caddy_config/`)
- Test: `tests/unit/health.test.ts`

- [ ] **Step 1: Failing test**

`tests/unit/health.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns ok and is not cached", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
```
Run → FAIL.

- [ ] **Step 2: Health route**

`src/app/api/health/route.ts`:
```ts
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 3: Opt-in standalone output**

In `next.config.ts` add to `nextConfig`:
```ts
  // Docker/VPS only: the Dockerfile sets BUILD_STANDALONE=1. Vercel and `next start` use the default output.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
```

- [ ] **Step 4: `Dockerfile`, `.dockerignore`**

Verify the base image tag exists: `docker manifest inspect node:24-alpine >/dev/null && echo ok` (or check hub.docker.com/_/node).
```dockerfile
# syntax=docker/dockerfile:1
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL
ARG SITE_ENV=production
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} SITE_ENV=${SITE_ENV} \
    NEXT_TELEMETRY_DISABLED=1 BUILD_STANDALONE=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# `node` (uid 1000) is the non-root user shipped with the official image.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/content ./content
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
```
`sharp`: Next installs it as an optional dependency; `npm ci` inside Alpine resolves the `linuxmusl` build, and standalone tracing copies it. Verified in Step 7.

`.dockerignore`:
```
.git
.github
.next
node_modules
reference
coverage
playwright-report
test-results
.env
.env.*
!.env.example
*.pem
*.key
.idea
.vscode
caddy_data
caddy_config
docs
tests
```

- [ ] **Step 5: `docker-compose.yml`, `Caddyfile`**

```yaml
services:
  app:
    image: ghcr.io/ferivision/studio-jhwa:${IMAGE_TAG:-latest}
    build:
      context: .
      args:
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:?set NEXT_PUBLIC_SITE_URL}
        SITE_ENV: ${SITE_ENV:-production}
    restart: unless-stopped
    security_opt: ["no-new-privileges:true"]
    expose: ["3000"]
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443", "443:443/udp"]
    environment:
      SITE_DOMAIN: ${SITE_DOMAIN:?set SITE_DOMAIN}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy_data:/data
      - ./caddy_config:/config
    depends_on:
      app:
        condition: service_healthy
```
`Caddyfile`:
```
{$SITE_DOMAIN} {
	encode zstd gzip

	# The app already sets security headers (src/config/security-headers.ts).
	# "?" sets a header only if the upstream did not, so this is a fallback, not a second source.
	header {
		?Strict-Transport-Security "max-age=63072000; includeSubDomains"
		?X-Content-Type-Options "nosniff"
		?Referrer-Policy "strict-origin-when-cross-origin"
		?X-Frame-Options "DENY"
		-Server
	}

	reverse_proxy app:3000
}
```
Check the Caddy `header` directive docs for whether `?` needs `defer` with `reverse_proxy` in the current 2.x; verify with `curl -sI` in Step 7.

- [ ] **Step 6: `.github/workflows/deploy-vps.yml` (manual only)**

Resolve SHAs for `docker/login-action`, `docker/setup-buildx-action`, `docker/build-push-action` as in Task 3 Step 1.
```yaml
name: Deploy to VPS
on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: "Existing image tag to deploy (rollback). Leave empty to build this commit."
        required: false
        default: ""
permissions:
  contents: read
  packages: write
concurrency:
  group: deploy-vps
  cancel-in-progress: false
env:
  IMAGE: ghcr.io/${{ github.repository }}
jobs:
  build:
    if: inputs.image_tag == ''
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - uses: docker/setup-buildx-action@<sha> # <tag>
      - uses: docker/login-action@<sha> # <tag>
        with: { registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@<sha> # <tag>
        with:
          context: .
          push: true
          tags: ${{ env.IMAGE }}:${{ github.sha }},${{ env.IMAGE }}:latest
          build-args: |
            NEXT_PUBLIC_SITE_URL=${{ vars.SITE_URL }}
            SITE_ENV=production
  deploy:
    needs: build
    if: always() && (needs.build.result == 'success' || needs.build.result == 'skipped')
    runs-on: ubuntu-latest
    environment: production
    env:
      TAG: ${{ inputs.image_tag || github.sha }}
    steps:
      - uses: actions/checkout@<sha> # <tag>
      - name: Configure SSH (host key pinned via VPS_KNOWN_HOSTS)
        env:
          VPS_SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
          VPS_KNOWN_HOSTS: ${{ secrets.VPS_KNOWN_HOSTS }}
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "$VPS_SSH_KEY" > ~/.ssh/id_ed25519 && chmod 600 ~/.ssh/id_ed25519
          printf '%s\n' "$VPS_KNOWN_HOSTS" > ~/.ssh/known_hosts
      - name: Upload compose files
        run: scp docker-compose.yml Caddyfile "${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/opt/studio-jhwa/"
      - name: Pull and restart
        run: |
          ssh "${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}" \
            "cd /opt/studio-jhwa && IMAGE_TAG='${TAG}' docker compose pull app && IMAGE_TAG='${TAG}' docker compose up -d --no-build && docker image prune -f"
      - name: Smoke check
        run: ssh "${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}" "curl -fsS https://\$(grep ^SITE_DOMAIN= /opt/studio-jhwa/.env | cut -d= -f2)/api/health"
```
`vars.SITE_URL` is a repository variable (not secret). The server's `/opt/studio-jhwa/.env` holds `SITE_DOMAIN`, `NEXT_PUBLIC_SITE_URL` (never committed).

- [ ] **Step 7: Local verification**

```bash
npm run test
command -v docker && docker info >/dev/null 2>&1 && {
  docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t studio-jhwa:local .
  docker run -d --rm -p 3200:3000 --name sj studio-jhwa:local; sleep 6
  curl -fsS localhost:3200/api/health; curl -s -o /dev/null -w '%{http_code}\n' localhost:3200/en
  docker exec sj node -e "require('sharp'); console.log('sharp ok')"
  docker inspect --format '{{.State.Health.Status}}' sj
  docker stop sj
} || echo "Docker not available: docker build NOT verified"
```
Expected with Docker: `{"status":"ok"}`, `200`, `sharp ok`, `healthy` (after start period). Record which case happened for the final report. (The `console.log` here is a shell one-liner, not app code.)

- [ ] **Step 8: Deployment docs (append to `docs/DEPLOYMENT.md`)**

Sections, with this content:
- **Vercel (active):** import the GitHub repo in Vercel; framework preset Next.js; Production Branch = `main`; Preview deployments for PRs and `develop` (Vercel default for non-production branches). Env vars: Production → `NEXT_PUBLIC_SITE_URL=https://<domain>`, `SITE_ENV=production`; Preview → `SITE_ENV=preview`, `NEXT_PUBLIC_SITE_URL` optional (unset falls back to `http://localhost:3000` in canonicals; acceptable because previews send `X-Robots-Tag: noindex` and `robots.txt` disallows all). Domain: add apex + `www` in Vercel → Domains, create the DNS records Vercel shows, redirect `www` → apex. No `vercel.json` needed (headers/redirects live in `next.config.ts`). Note D3 (plan tier). Vercel's preview toolbar script is blocked by our CSP on previews — acceptable.
- **VPS (prepared, not active):** server prerequisites (Docker Engine + compose plugin, ports 80/443 open, DNS A/AAAA to the VPS), create `/opt/studio-jhwa/.env` with `SITE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, `SITE_ENV=production`; `docker login ghcr.io` on the server with a PAT that has only `read:packages`; GitHub secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (dedicated ed25519 deploy key, user limited to docker group), `VPS_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <host>` verified out-of-band); repository variable `SITE_URL`; run **Actions → Deploy to VPS → Run workflow**.
- **Rollback:** Vercel → Deployments → previous production deployment → "Promote to Production" (instant). VPS → list tags `gh api /orgs/ferivision/packages/container/studio-jhwa/versions --jq '.[].metadata.container.tags[]'`, re-run **Deploy to VPS** with `image_tag=<previous sha>`; verify `/api/health`. Code rollback: revert PR into `develop`, release as usual.

- [ ] **Step 9: Commit**

```bash
npm run validate && npm run test:e2e
git add -A && git commit -m "chore(deploy): add health route, Docker/Caddy VPS setup and deployment docs (#14)"
```
PR title: `chore(deploy): prepare Vercel and VPS deployment`.

---

## Task 14 (issue #15): docs: README

**Issue:** Goal — a README that lets a new maintainer run, edit, release and deploy the site without asking. Scope — README only (+ CLAUDE.md link check). Acceptance — contains every section listed below; commands copy-paste correctly; no real contact data. Label `docs`. Branch `docs/15-readme`.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write `README.md` with these sections, in order**

1. Title + one-paragraph overview (studioJHWA, interior design & build, Surabaya & Malang; EN/ID; image-first; classification line `**Classification: INTERNAL**`).
2. **Tech stack** table — columns *Area | Choice | Why*:
   - Framework: Next.js 16 App Router — static generation per locale, image optimisation, metadata API.
   - Language: TypeScript 6 strict — catches content/prop mistakes at build; pinned to 6.0 because typescript-eslint does not support 7 yet.
   - Styling: Tailwind CSS 4 — tokens defined once in `@theme`; no CSS files per component.
   - Content: JSON + Zod 4 — non-developers edit JSON; the build fails with a readable error on mistakes.
   - Fonts/images: `next/font` (Jost, self-hosted), `next/image` — no layout shift, responsive sizes.
   - Tests: Vitest (unit, content), Playwright (smoke, a11y, SEO, headers).
   - Quality: ESLint 9 + jsx-a11y, Prettier + Tailwind plugin, Husky + lint-staged, commitlint.
   - Release: semantic-release — versions and changelog from Conventional Commits.
   - Hosting: Vercel now; Docker + Caddy on a VPS prepared.
3. **Features**: pages (Home with its 9 sections + contact, Projects with filter, Project detail), i18n (`/en`, `/id`, language switch keeps path), SEO (titles incl. "Jasa Desain Interior Surabaya", canonical, hreflang, OG images, sitemap, robots, JSON-LD), accessibility (skip link, focus rings, reduced motion, 44px targets), security (headers, gitleaks, audit, Dependabot, CodeQL-when-available), CI/CD, release, deployment.
4. **Architecture & folder structure**: the tree from the plan's File Structure, trimmed to directories + key files, each with a one-line purpose.
5. **Design patterns and why**: repository pattern (`lib/content` is the only JSON reader → swap to a CMS by changing repositories only), schema-first content (Zod), server/client split (the four client components and why each is client), composition (sections from `ui/` primitives), single source of truth (tokens / `site.json` / `i18n`), typed config (`config/env.ts`).
6. **Editing content** with examples: change WhatsApp/email/address in `content/site.json` (show the JSON snippet with `6281234567890`-style format and the rule "digits only, starts with 62"); add a project (copy `content/projects/rs-house.json`, rename file = slug, images under `public/images/projects/<slug>/`, set `order`, `featured`); change copy in both `content/i18n/en.json` and `id.json` (test enforces matching keys); what `[PLACEHOLDER]` means and that placeholders are hidden from JSON-LD and links.
7. **Scripts**: table of every `npm run` script.
8. **Git workflow & release**: issue first, branch naming, Conventional Commits, PR template, squash into `develop`, release PR `develop → main` with merge commit, what semantic-release does, `RELEASE_TOKEN`.
9. **Environment variables**: `NEXT_PUBLIC_SITE_URL`, `SITE_ENV` (+ build-only `BUILD_STANDALONE`) with defaults and where to set them.
10. **Deployment**: Vercel (active) and VPS (prepared) summary linking `docs/DEPLOYMENT.md`.
11. **Security**: summary linking `SECURITY.md`.
12. **Contributing**: prerequisites (`nvm use`), `npm ci`, `npm run dev`, Definition of Done.
13. **License**: `[LICENSE — to be decided by studioJHWA]`.

- [ ] **Step 2: Verify and commit**

```bash
npx prettier --check README.md
grep -nE '\b(TODO|TBD)\b' README.md && echo "fix these" || echo ok
npm run validate
git add README.md && git commit -m "docs: write README (#15)"
```

---

## Task 15: Release PR, Lighthouse, final report (no new issue)

- [ ] **Step 1: Lighthouse on a production-like local build (mobile, default form factor)**

```bash
npm view lighthouse version --no-update-notifier
NEXT_PUBLIC_SITE_URL=http://localhost:3100 SITE_ENV=production npm run build
NEXT_PUBLIC_SITE_URL=http://localhost:3100 SITE_ENV=production npm run start -- -p 3100 & sleep 5
CHROME=$(node -e "console.log(require('@playwright/test').chromium.executablePath())")
for route in en en/projects en/projects/rh-house id; do
  npx lighthouse@<version> "http://localhost:3100/$route" --chrome-path="$CHROME" --chrome-flags="--headless=new" \
    --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=".lighthouseci/${route//\//-}.json" --quiet
  node -e "const r=require('./.lighthouseci/${route//\//-}.json').categories;console.log('$route',Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Math.round(v.score*100)])))"
done
kill %1
```
`SITE_ENV=production` so robots allow crawling (SEO audit), `http` URL so HSTS/upgrade-insecure-requests are off locally. Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100. If a target is missed, open a `fix` issue per cause and run the per-issue loop before Step 2. `.lighthouseci/` is git-ignored.

- [ ] **Step 2: Open (do not merge) the release PR**

```bash
git checkout develop && git pull
gh pr create --base main --head develop --title "release: v1.0.0" --body "$(cat <<'EOF'
First release. Merge with **Create a merge commit** (not squash). semantic-release will tag v1.0.0.

Included: #2 … #15 (see milestone v1.0.0).
EOF
)"
gh pr checks --watch
```
Stop. Do not merge; wait for the user's approval.

- [ ] **Step 3: Final report to the user** — issues + PR links (`gh issue list --milestone v1.0.0 --state all`, `gh pr list --state all --base develop`), remaining placeholders (`grep -rn '\[[^]]*\]' content/`), Lighthouse table, manual steps (RELEASE_TOKEN, branch protection per D1, Vercel project + env + domain, Google Search Console verification + sitemap submit, HSTS preload decision, VPS secrets when activated), known limitations (OG images use default font; CSP uses `'unsafe-inline'` for scripts per D2; CodeQL inactive while private; low-res sample images; `docker build` verified or not).

---

## Self-review (done while writing)

- Spec coverage: §0 prerequisites (checked in session, Node/gh fixed) · §1.1–1.5 → Task 0 · §3 items 1–14 → Tasks 1–14 · §4 quality bar → Global Constraints + e2e (alt, lazy, 360px, keyboard) + Task 15 Lighthouse · §5 rules → Global Constraints, D1–D5 · §6 report → Task 15 Step 3.
- Brief item 11 lists `config/env.ts` under security; it is created in Task 10 because SEO needs the base URL first, and hardened/linted in Task 11.
- Home "Contact CTA" is rendered by the shared footer (Task 6) on every page, which also satisfies the detail page's "contact CTA".
- Type names used across tasks: `Site`, `Home`, `Project`, `Category`, `ImageContent`, `Localized`, `Dictionary`, `Locale`; functions `getSite/getHome/getProjects/getProject/getFeaturedProjects/getNextProject/getDictionary/whatsappHref/emailHref/pick/localizedPath/swapLocale/format/buildMetadata/alternatesFor/businessJsonLd/breadcrumbJsonLd/withoutPlaceholders/serializeJsonLd/renderOgImage/securityHeaders/parseEnv` — consistent.
