# Branch protection

**Classification: INTERNAL**

Status: **not applied**. The repository is private on the GitHub Free organization plan, where
branch protection and rulesets are unavailable (API returns 403). Apply these settings once the
repo is public or the org is on GitHub Team.

## Settings for `main` and `develop`

| Setting                               | Value                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Require a pull request before merging | on (0 required approvals; 1 when a second maintainer joins)                                   |
| Require status checks to pass         | on, "require branches to be up to date" on                                                    |
| Required checks                       | `validate`, `e2e`, `audit`, `gitleaks`, `pr-title` (`codeql` once code scanning is available) |
| Allow force pushes                    | off                                                                                           |
| Allow deletions                       | off                                                                                           |
| Bypass list                           | the account that owns `RELEASE_TOKEN` (release bot), see docs/DEPLOYMENT.md#release           |

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
