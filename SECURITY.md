# Security Policy

## Supported versions

Only the latest `main` branch is supported for security fixes.

## What this project is

`轮盘人生（Wheel of Life）` is a **client-side only** browser game. There is no official backend.
Secrets embedded in the frontend (including optional pack HMAC keys) **must not**
be treated as security boundaries.

## Reporting a vulnerability

Please open a GitHub Security Advisory (preferred) or a private report to the
repository maintainers. Include:

1. Impact (data loss, XSS, supply-chain, etc.)
2. Reproduction steps
3. Affected commit / release if known

## Out of scope

- Malicious **user-chosen** content packs (installing arbitrary zip is intentional)
- Social engineering via third-party pack text
- Issues that only appear after disabling browser security features
