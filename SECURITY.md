# Security policy

**Classification: INTERNAL**

## Reporting a vulnerability

Email **[SECURITY CONTACT EMAIL]** with a description and steps to reproduce. Do not open a public
issue. We aim to acknowledge within [X] business days.

## Supported versions

Only the latest release on `main` is supported.

## Measures in place

| Risk area                      | Control                                                                                                                                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets management             | No secrets in the repo; `.env*` git-ignored; `.env.example` lists keys only; gitleaks scans every PR                                                                                                     |
| HTTP security headers          | CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Powered-By` removed, all set in `src/config/security-headers.ts` |
| Output encoding / XSS          | No `dangerouslySetInnerHTML` except the JSON-LD helper, which escapes `<`                                                                                                                                |
| Dependency security            | Committed lockfile + `npm ci`; `npm audit --audit-level=high` in CI; Dependabot weekly; CodeQL (when available on the repo plan)                                                                         |
| Input validation               | No user input today; any future form must validate with Zod on the server and add rate limiting before going live                                                                                        |
| Personal data (UU PDP 27/2022) | The site publishes only public business contact data from `content/site.json`; no client or staff personal data, no analytics or cookies                                                                 |
