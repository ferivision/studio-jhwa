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

### Release tooling is not a project dependency

`release.yml` fetches `semantic-release`, `@semantic-release/changelog` and `@semantic-release/git` at release time with `npx --yes -p <pkg>@<exact version>`. They are not in `package.json`, so their bundled `npm` never enters the project's dependency tree or `npm audit --audit-level=high`. Bump the pinned versions in `release.yml` deliberately (verify with `npm view`).
