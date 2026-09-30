# Deployment and release

**Classification: INTERNAL**

## Release

1. Open a PR `develop → main` titled `release: vX.Y.Z` (the version semantic-release will compute; the title is informational).
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

Why not `GITHUB_TOKEN`: pushes made with it do not trigger other workflows and cannot bypass branch protection.

### Branch protection and the release bot

When protection is applied (docs/BRANCH_PROTECTION.md), keep `enforce_admins: false` or add the token owner to the bypass list, otherwise the release commit on `main` and the fast-forward of `develop` are rejected.

### Dependency audit scope

CI runs `npm audit --omit=dev --audit-level=high`. `semantic-release` (dev-only) bundles its own `npm`, whose bundled `undici`/`ip-address`/`brace-expansion` have advisories that `npm audit fix` cannot resolve (verified 2026-09-30). This tooling runs only in the release job and is not shipped. Re-audit the full tree after each `semantic-release` upgrade and drop `--omit=dev` once a fixed bundled `npm` is released.
