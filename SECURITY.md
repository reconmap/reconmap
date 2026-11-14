# Reconmap Vulnerability Disclosure Policy

Reconmap is committed to maintaining the security and privacy of its users. We recognise the important role that security researchers and the wider community play in achieving this goal. This document describes our policy for reporting vulnerabilities in line with the [ISO/IEC 29147:2018 standard](https://www.iso.org/standard/72311.html).

## 1. Purpose

This policy outlines the procedure for reporting potential security vulnerabilities to the Reconmap team. It aims to provide clear guidelines for vulnerability disclosure and handling, to ensure timely mitigation and responsible publication when appropriate.

## 2. Scope

This policy applies to:
- The Reconmap platform (web application, API, CLI tools)
- All associated open-source code maintained under the [Reconmap GitHub organisation](https://github.com/reconmap)

## 3. Reporting a Vulnerability

We encourage security researchers to report any suspected vulnerabilities by contacting us privately. Do **not** create public GitHub issues for security-related concerns.

**Contact Methods:**
- [Confidential issue](https://github.com/reconmap/reconmap/security/advisories)
- Gitter: [https://gitter.im/reconmap/community](https://gitter.im/reconmap/community)
- Email (upon request or via a secure channel)

### Report Contents
Please include the following information to help us triage and resolve the issue:
- Description of the vulnerability
- Affected component(s) and version(s)
- Impact and potential severity
- Steps to reproduce (PoC if applicable)
- Suggested mitigation or remediation (optional)

For secure communication, we can provide a PGP key upon request.

## 4. Acknowledgement and Response

We will:
- Acknowledge receipt of your report within **2 business days**
- Provide regular status updates throughout the resolution process
- Inform you when the issue has been resolved and publicly disclosed (if applicable)

## 5. Resolution Timeframes

| Severity | Target Resolution Time |
|----------|------------------------|
| Critical | Within 2 calendar days |
| High     | Within 5 calendar days |
| Medium   | Within 14 calendar days |
| Low      | Within 31 calendar days |

These targets may vary depending on complexity and impact.

## 6. Disclosure

We support coordinated vulnerability disclosure. After validation and resolution:
- We may publish a public advisory with credit to the reporter (with consent)
- We may delay disclosure if a coordinated release is necessary

We request that reporters do **not** publicly disclose vulnerabilities prior to mutual agreement.

## 7. Recognition

We publicly recognise individuals who responsibly disclose security vulnerabilities. With the reporter’s permission, their name or handle will be listed in our Hall of Fame.

## 8. Hall of Fame

Reconmap would like to thank the following contributors for their responsible disclosure efforts:

- 2021 Ioan Iuga (cyberlegion.io)
- 2023 Guilherme Rodrigues (@guilhermesgi)
- 2024 Brute Bee ([Twitter](https://twitter.com/BruteBee))
- 2026-06-21 George Chen (https://github.com/geo-chen)
- 2026-11-14 Iain (https://github.com/NotAFlightRisk)
