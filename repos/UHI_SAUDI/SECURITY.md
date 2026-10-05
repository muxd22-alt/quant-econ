# Security Policy

## Supported versions

This project is a static, zero-backend web application. Only the latest commit
on `main` is supported.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Any tag, fork or older commit | ❌ |

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Report privately using one of these GitHub-native channels:

1. **Preferred** — [Report a vulnerability](https://github.com/muxd22-alt/UHI_SAUDI/security/advisories/new)
   (GitHub Security Advisories / private vulnerability reporting).
2. If that is unavailable, contact the maintainers through the private contact
   options on the [maintainer's GitHub profile](https://github.com/muxd22-alt).

### What to include

- Description of the issue and its impact
- Steps to reproduce, or a proof of concept
- Affected file(s) and, if known, a suggested fix
- Your preferred credit handle if you want to be acknowledged

### What to expect

| Stage | Target |
|-------|--------|
| Acknowledgement | within **7 days** |
| Assessment & triage | within **14 days** |
| Fix or mitigation plan | case by case, coordinated disclosure |

You will receive updates as the report progresses. Please keep the details
confidential until a fix is released or we agree on a disclosure date.

## Scope

**In scope**

- XSS, script injection or supply-chain issues in `docs/index.html`
  (including unsafe handling of URL-hash scenario state or query parameters)
- Unsafe deserialisation of `macro_data.json` / World Bank API responses
- Workflow or CI secrets exposure in `.github/workflows/`
- Dependency vulnerabilities reachable from the shipped page

**Out of scope**

- The upstream [World Bank API](https://api.worldbank.org) itself
- Denial of service against GitHub Pages or the CDN (Chart.js / Google Fonts)
- Social engineering, and reports that require modifying a user's browser
  extensions or OS configuration
- The accuracy of economic projections — the simulator is indicative modelling,
  not financial advice

## Non-security bugs

Use the [bug report form](https://github.com/muxd22-alt/UHI_SAUDI/issues/new/choose).
