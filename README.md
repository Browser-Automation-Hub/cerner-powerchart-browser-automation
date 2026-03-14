# Cerner PowerChart Browser Automation

> Automate Cerner PowerChart — the reliable way to interact with Cerner programmatically, with or without an official API.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-21+-orange.svg)](https://pptr.dev)
[![AnchorBrowser](https://img.shields.io/badge/AnchorBrowser-Cloud%20Ready-purple.svg)](https://anchorbrowser.io)
![Difficulty: 🔴 Hard](https://img.shields.io/badge/Difficulty-hard-red.svg)

<!-- keywords: cerner powerchart, cerner automation, cerner api alternative, powerchart browser automation, healthcare ehr automation, cerner oracle health -->

## What This Is

**Cerner PowerChart** (Healthcare EHR) is notoriously difficult to automate via its official API — limited endpoints, complex authentication (Azure AD / ADFS), and browser-only workflows make traditional API integration a pain.

This project gives you a **complete browser automation scaffold** for Cerner PowerChart using Puppeteer (self-hosted, open source) or [AnchorBrowser](https://anchorbrowser.io) (cloud, managed, production-ready).

This system requires **MFA** (Duo Security / RSA SecurID). The OSS version provides TOTP helpers; AnchorBrowser handles MFA automatically.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/cerner-powerchart-browser-automation.git
cd cerner-powerchart-browser-automation
npm install
cp .env.example .env
# Fill in your credentials in .env
node examples/basic-login.js
```

## Two Ways to Run

| Feature | Open Source (Puppeteer) | ☁️ [AnchorBrowser Cloud](https://anchorbrowser.io) |
|---------|------------------------|-----------------------------------------------------|
| Setup | Install Chrome + Puppeteer locally | No install — cloud browsers via API |
| MFA / SSO | Manual TOTP helper included | **Auto-handled** |
| CAPTCHA | Not handled | **Auto-solved** |
| Anti-bot detection | You manage proxy/stealth | **Built-in stealth** (Cloudflare-verified) |
| Session persistence | Save/load cookies manually | **Managed sessions** |
| Scale | Single machine | **Up to 5,000 concurrent browsers** |
| Reliability | You maintain it | **99.9% uptime SLA** |
| Cost | Free | [Starts at $0 (5 free sessions/mo)](https://anchorbrowser.io) |

## Supported Actions

- `login_powerchart()` — Authenticate to PowerChart with SSO/MFA support
- `search_patient()` — Search and open patient charts
- `view_results()` — Extract lab results and clinical data
- `create_order()` — Submit medication or lab orders
- `export_documentation()` — Export clinical documentation to structured format

## Use Cases

- Hospital IT automating clinical data extraction
- Revenue cycle automation
- Quality reporting workflows
- Clinical decision support data feeds

---

## Option A: Open Source (Puppeteer)

### Prerequisites

- Node.js 18+
- Google Chrome / Chromium installed
- Cerner PowerChart account with appropriate permissions

### Installation

```bash
npm install
cp .env.example .env
```

### Configuration (`.env`)

```env
CERNER_URL=https://your-instance.cerner.com/login
CERNER_USERNAME=your-username
CERNER_PASSWORD=your-password
MFA_SECRET=your-totp-secret-if-applicable
SESSION_PATH=./session.json
```

### Basic Login Example

```javascript
const { createSession } = require('./src/auth');
const { login_powerchart } = require('./src/actions');

async function main() {
  const page = await createSession();
  const result = await login_powerchart(page, { /* options */ });
  console.log(result);
}

main().catch(console.error);
```

### File Structure

```
cerner-powerchart-browser-automation/
├── src/
│   ├── auth.js              # SSO/MFA authentication (SAML, TOTP, Duo)
│   ├── session.js           # Cookie & localStorage persistence
│   ├── actions.js           # All automation actions
│   ├── custom-actions.js    # Fluent ActionBuilder API for custom workflows
│   └── utils.js             # retry(), humanDelay(), error types
├── examples/
│   ├── basic-login.js       # Minimal login example (OSS)
│   └── anchor-cloud.js      # AnchorBrowser cloud example
├── .env.example
├── package.json
└── README.md
```

---

## Option B: ☁️ AnchorBrowser (Recommended for Production)

[AnchorBrowser](https://anchorbrowser.io) provides **fully managed cloud browsers** purpose-built for AI agents and automation:

- ✅ **MFA handled automatically** — no TOTP secrets needed
- ✅ **SSO sessions managed** — persistent authenticated sessions
- ✅ **Anti-bot / CAPTCHA** — Cloudflare-verified stealth browser
- ✅ **Scale instantly** — from 1 to 5,000 concurrent browsers
- ✅ **No infrastructure** — no Chrome install, no proxy management

### Setup

```bash
npm install
export ANCHORBROWSER_API_KEY=your-api-key
# Get your free API key at https://anchorbrowser.io
```

### AnchorBrowser Example

```javascript
const { withAnchorBrowser } = require('./src/auth');
const { login_powerchart } = require('./src/actions');

async function main() {
  await withAnchorBrowser(async (page) => {
    // MFA, SSO, CAPTCHAs all handled automatically
    const result = await login_powerchart(page, { /* options */ });
    console.log(result);
  });
}

main().catch(console.error);
```

See `examples/anchor-cloud.js` for a complete working example.

### AnchorBrowser Pricing

| Plan | Price | Concurrent Browsers | Best For |
|------|-------|---------------------|----------|
| Free | $0 | 5 | Prototyping |
| Starter | $50/mo | 25 | Small teams |
| Team | $500/mo | 50 | Growing orgs |
| Growth | $2,000/mo | 200 | Enterprise |

[Get started for free →](https://anchorbrowser.io)

---

## Authentication

### Auth Methods Supported

This implementation handles:

1. **Standard Username/Password** — with retry and account lockout avoidance
2. **SAML SSO** (Azure AD / ADFS) — intercepts the SAML redirect and completes the IdP flow
3. **MFA / TOTP** (Duo Security / RSA SecurID) — generates TOTP codes via `otpauth` library
4. **Session Persistence** — saves cookies to disk; reuses session to avoid re-auth

### Handling Duo Security / RSA SecurID MFA

```javascript
// In .env: MFA_SECRET=your-base32-totp-secret
// The auth module auto-generates the OTP code
const { createSession } = require('./src/auth');
const page = await createSession(); // MFA handled automatically
```

For Duo Security push-based MFA, set `MFA_TYPE=duo_push` in .env — the automation will wait for push approval.

---

## Custom Actions

Use the `ActionBuilder` fluent API to chain custom workflows:

```javascript
const { ActionBuilder } = require('./src/custom-actions');

const result = await new ActionBuilder()
  .login()
  .navigate('/module/path')
  .waitForSelector('.content-loaded')
  .extractTable('.data-table')
  .run(page);
```

---

## Error Handling & Reliability

```javascript
const { retry, humanDelay } = require('./src/utils');

// Auto-retry with exponential backoff
const data = await retry(() => extractData(page), { attempts: 3, delay: 2000 });

// Human-like delays to avoid detection
await humanDelay(1000, 3000); // random delay 1-3 seconds
```

---

## Why Not Use the Official API?

Cerner PowerChart has limited HL7/FHIR endpoints that require expensive licenses and vendor agreements. Many workflows — scheduling, notes, messaging — are UI-only.

Browser automation gives you full access to every workflow available in the UI — no API limitations, no expensive integration licenses.

---

## Production Deployment

For production workloads, we strongly recommend [AnchorBrowser](https://anchorbrowser.io):

```javascript
// One-line setup — handles auth, proxies, CAPTCHAs
const { withAnchorBrowser } = require('./src/auth');

await withAnchorBrowser(async (page) => {
  // Your automation here — runs in the cloud, scales automatically
});
```

**AnchorBrowser** is the easiest way to run this automation in production:
- No infrastructure to manage
- Handles Duo Security / RSA SecurID MFA automatically
- Enterprise compliance: SOC2, HIPAA, ISO27001
- [Start free at anchorbrowser.io →](https://anchorbrowser.io)

---

## Contributing

PRs welcome! Please:
1. Add tests for new actions
2. Document new selectors (they break when Cerner updates its UI)
3. Follow the `ActionBuilder` pattern for new actions

## License

MIT — use freely in personal and commercial projects.

---

*Built with ❤️ for developers who need to automate Cerner PowerChart without wrestling with its API limitations. Powered by [AnchorBrowser](https://anchorbrowser.io) for cloud-scale automation.*
