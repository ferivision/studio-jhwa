# Deployment and release

**Classification: INTERNAL**

## Release

1. Open a PR `develop → main` titled `release: vX.Y.Z` (the version semantic-release will compute; the title is informational). PR-title lint is skipped for PRs into `main`, because commitlint rejects the `release` type. The merge-commit title is not read by semantic-release, which analyzes the squashed commits that come through the merge.
2. CI must be green. Merge with **"Create a merge commit"** (not squash) so every Conventional Commit reaches `main`.
3. `release.yml` runs on the push to `main`: validates, runs semantic-release (bumps `package.json`, updates `CHANGELOG.md`, commits `chore(release): X.Y.Z [skip ci]`, tags `vX.Y.Z`, publishes a GitHub Release), then fast-forwards `develop` to `main` (or opens a sync PR if `develop` moved on).

### `RELEASE_TOKEN`

Fine-grained personal access token owned by a repo admin, stored as an Actions secret `RELEASE_TOKEN`.

| Setting           | Value                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Resource owner    | `ferivision`                                                                              |
| Repository access | only `ferivision/studio-jhwa`                                                             |
| Permissions       | Contents: read & write; Issues: read & write; Pull requests: read & write; Metadata: read |
| Expiry            | ≤ 1 year; calendar a rotation reminder                                                    |

The workflow's own `GITHUB_TOKEN` permissions are `contents: read` only; every write (release commit, tag, GitHub Release, `develop` push, sync PR) uses the PAT.

Why not `GITHUB_TOKEN`: pushes made with it do not trigger other workflows and cannot bypass branch protection.

### Branch protection and the release bot

When protection is applied (docs/BRANCH_PROTECTION.md), keep `enforce_admins: false` or add the token owner to the bypass list, otherwise the release commit on `main` and the fast-forward of `develop` are rejected.

### Release tooling is not a project dependency

`release.yml` fetches `semantic-release`, `@semantic-release/changelog` and `@semantic-release/git` at release time with `npx --yes -p <pkg>@<exact version>`. They are not in `package.json`, so their bundled `npm` never enters the project's dependency tree or `npm audit --audit-level=high`. Bump the pinned versions in `release.yml` deliberately (verify with `npm view`). The tooling resolves its transitive dependencies fresh at release time, and Dependabot cannot see the pins in `release.yml`, so bump them by hand.

## Build-time environment (read this first)

`NEXT_PUBLIC_SITE_URL` and `SITE_ENV` are read **at build time**. Security headers (HSTS, `upgrade-insecure-requests`) and indexability (`X-Robots-Tag`, `robots.txt`) are computed during `next build`. `src/config/env.ts` also fails the build if `SITE_ENV=production` and `NEXT_PUBLIC_SITE_URL` is empty.

Set **both** for the Production environment (Vercel) or as build args (VPS). If they are missing or wrong, the site ships `noindex` and without HSTS. Changing them requires a new build or deployment, not just a restart.

## Vercel (active)

1. Import the GitHub repo in Vercel; framework preset Next.js.
2. Production Branch = `main`. PRs and `develop` get Preview deployments (Vercel default for non-production branches).
3. Environment variables:
   - Production: `NEXT_PUBLIC_SITE_URL=https://<domain>`, `SITE_ENV=production`.
   - Preview: `SITE_ENV=preview`; `NEXT_PUBLIC_SITE_URL` optional. Unset falls back to `http://localhost:3000` in canonicals, which is acceptable because previews send `X-Robots-Tag: noindex` and `robots.txt` disallows all.
4. Domain: add apex and `www` in Vercel, Domains; create the DNS records Vercel shows; redirect `www` to apex.
5. No `vercel.json` is needed; headers and redirects live in `next.config.ts`.

Notes:

- ASSUMPTION: Vercel Hobby is limited to personal, non-commercial use, so a company site likely needs Pro (paid). Verify against Vercel's current terms.
- Vercel's preview toolbar script is blocked by our CSP on previews. Acceptable.

## VPS (prepared, not active)

Files: `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.github/workflows/deploy-vps.yml` (manual `workflow_dispatch` only). Standalone output is opt-in through `BUILD_STANDALONE=1`, which only the Dockerfile sets.

Server prerequisites:

- Docker Engine with the compose plugin; ports 80 and 443 open; DNS A/AAAA pointing to the VPS.
- `/opt/studio-jhwa/.env` (never committed) containing `SITE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, `SITE_ENV=production`.
- `docker login ghcr.io` on the server with a PAT that has only `read:packages`.

GitHub configuration:

| Name              | Kind                | Value                                                              |
| ----------------- | ------------------- | ------------------------------------------------------------------ |
| `VPS_HOST`        | secret              | server hostname                                                    |
| `VPS_USER`        | secret              | deploy user, limited to the docker group                           |
| `VPS_SSH_KEY`     | secret              | dedicated ed25519 deploy key                                       |
| `VPS_KNOWN_HOSTS` | secret              | `ssh-keyscan -t ed25519 <host>` output, verified out-of-band       |
| `SITE_URL`        | repository variable | `https://<domain>`; passed as the build arg `NEXT_PUBLIC_SITE_URL` |

The workflow also uses a GitHub Environment named `production`; create it (optionally with required reviewers).

Deploy: **Actions, Deploy to VPS, Run workflow** (leave `image_tag` empty to build the current commit). The job builds and pushes to `ghcr.io/ferivision/studio-jhwa`, uploads the compose files, restarts and smoke-checks `/api/health`.

Local image check (does not push):

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 -t studio-jhwa:local .
```

Caddy: the app sets the security headers itself. The `Caddyfile` uses `?` (set only if the upstream did not), which Caddy defers automatically.

## Rollback

- **Vercel:** Deployments, pick the previous production deployment, "Promote to Production" (instant).
- **VPS:** list tags with `gh api /orgs/ferivision/packages/container/studio-jhwa/versions --jq '.[].metadata.container.tags[]'`, then re-run **Deploy to VPS** with `image_tag=<previous sha>`. Verify `/api/health`. The image bakes in build-time env, so a rollback restores the earlier build's headers and indexing too.
- **Code:** revert PR into `develop`, then release as usual.
