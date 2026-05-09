# Zapocalypse: Vertical AI Content Factory

> One long-form input. Five platform-ready outputs. Built in a week.

Paste a URL, text, or file and a 5-agent pipeline produces an entire week of content for X/Twitter, LinkedIn, Newsletter, Veo script, and Dark Social, all in your voice.

Built as a one-week portfolio sprint to explore multi-agent AI development with Claude Code, Cursor, and Gemini Antigravity sharing a single set of rules and memory. Also demonstrates the [LLM Project Wiki](https://github.com/akash-r34/llm-project-wiki) pattern: a structured Obsidian vault that serves as the authoritative reference for every agent working on the codebase.


![Landing](public/screenshots/01-landing-hero.png)

---

## What it does

1. Paste a URL, text block, or file.
2. A 5-agent pipeline runs: Ingest, Analyze, Extract, Synthesize, Authenticate.
3. Get platform-ready content with tone fingerprinting, cost tracking, C2PA provenance, and selective regeneration.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Cloud Firestore · Firebase App Hosting · Gemini 2.5 Flash (Vertex AI)

---

## Marketing site

| | |
|---|---|
| ![Problem](public/screenshots/03-problem.png) | ![Features](public/screenshots/04-features.png) |
| ![How it works](public/screenshots/05-output-how-it-works.png) | ![Pricing](public/screenshots/06-pricing.png) |

<details>
<summary>More: FAQ, auth gate, mobile</summary>

![FAQ](public/screenshots/07-faq.png)

![Sign-in card](public/screenshots/09-signin-card.png)

![Mobile](public/screenshots/08-mobile-landing.png)

</details>

---

## App

### Dashboard and project list
![Dashboard](public/screenshots/10-dashboard.png)

### New project input
![Create](public/screenshots/11-create.png)

---

## Platform outputs

Each run produces five outputs. Every platform has a default view (editable content) and a native preview.

### X / Twitter

| Default | Native |
|---------|--------|
| ![Twitter default](public/screenshots/platform-twitter-normal.png) | ![Twitter native](public/screenshots/platform-twitter-native-x.png) |

### LinkedIn

| Default | Native |
|---------|--------|
| ![LinkedIn default](public/screenshots/platform-linkedin-normal.png) | ![LinkedIn native](public/screenshots/platform-linkedin-native-linkedin.png) |

### Newsletter

| Default | Native |
|---------|--------|
| ![Newsletter default](public/screenshots/platform-newsletter-normal.png) | ![Newsletter native](public/screenshots/platform-newsletter-native-newsletter.png) |

### Dark Social (Discord + Slack)

| Default | Discord | Slack |
|---------|---------|-------|
| ![Dark Social](public/screenshots/platform-dark-social-normal.png) | ![Discord](public/screenshots/platform-dark-social-native-discord.png) | ![Slack](public/screenshots/platform-dark-social-native-slack.png) |

### Veo Script
![Veo](public/screenshots/platform-veo-normal.png)

### Hook Leaderboard and Cost Breakdown

| Hook scores | Pipeline cost |
|-------------|---------------|
| ![Leaderboard](public/screenshots/platform-leaderboard-normal.png) | ![Cost](public/screenshots/15-cost-breakdown.png) |

---

## Dark and Light mode

| Dark | Light |
|------|-------|
| ![Dark landing](public/screenshots/01-landing-hero.png) | ![Light landing](public/screenshots/light-01-landing-hero.png) |
| ![Dark dashboard](public/screenshots/10-dashboard.png) | ![Light dashboard](public/screenshots/light-10-dashboard.png) |
| ![Dark Twitter](public/screenshots/platform-twitter-native-x.png) | ![Light Twitter](public/screenshots/light-platform-twitter-native-x.png) |
| ![Dark LinkedIn](public/screenshots/platform-linkedin-native-linkedin.png) | ![Light LinkedIn](public/screenshots/light-platform-linkedin-native-linkedin.png) |

---

## Portfolio highlights

- **Multi-agent workflow:** Claude Code + Cursor + Gemini Antigravity share one set of rules, commands, and memory (`.claude/`, `.cursor/`, `.gemini/`, `.agents/`).
- **Second-brain wiki:** `Obsidian Vault/Zapocalypse/` is a structured knowledge base auto-synced from project memory. Inspired by [llm-project-wiki](https://github.com/akash-r34/llm-project-wiki).
- **Budget protection:** Hard kill-switch at $95/month; every Gemini call is gated and cost-tracked.
- **Fire-and-forget pipeline:** Route returns `202` immediately; pipeline runs async with real-time status via Firestore listeners.
- **Tone fingerprinting:** Additive similarity scoring with per-platform reflexion loop and selective regeneration.
- **C2PA provenance:** ECDSA-signed manifests for each output.

---

## Project structure

```
.agents/          # Shared agent skills
.claude/          # Claude Code rules, commands, memory, skills
.cursor/          # Cursor rules (point back to .claude/)
.gemini/          # Gemini Antigravity skills
Obsidian Vault/   # Second-brain wiki (Markdown, Obsidian-compatible)
app/              # Next.js App Router pages and layouts
src/
  lib/
    ai/           # Gemini client, schemas, agents
    budget/       # Cost tracker + pricing map
    firebase/     # Client + Admin SDK singletons
    firestore/    # Typed Firestore helpers
    pipeline/     # Orchestrator + per-agent modules
  components/     # React components
  hooks/          # Custom React hooks
  types/          # Shared TypeScript types
```

---

## Setup (fork and run)

### Prerequisites
- Node.js 20+
- Firebase project with Firestore (Native mode) and Firebase App Hosting enabled
- Google Cloud project with Vertex AI API enabled
- `gcloud` CLI and `firebase-tools`

### 1. Clone and install

```bash
git clone https://github.com/<you>/zapocalypse
cd zapocalypse
npm install
git config core.hooksPath .githooks
```

### 2. Configure Firebase

```bash
firebase use --add   # select your project, alias as "default"
```

### 3. Set environment variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions
```

| Variable | Where to find it |
|----------|-----------------|
| `GOOGLE_CLOUD_PROJECT` | GCP console, project ID |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase console, Project Settings, Web app config |
| `NEXT_PUBLIC_ALLOWED_USER_EMAIL` | Your Google account email (client-side gate) |
| `ALLOWED_USER_EMAIL` | Same email (server-side gate, RUNTIME only) |

### 4. Set up Vertex AI auth

```bash
gcloud auth application-default login
gcloud config set project your-firebase-project-id
```

### 5. Deploy Firestore rules

Edit `firestore.rules`, replace `<owner-email>` with your Google account email, then:

```bash
firebase deploy --only firestore:rules
```

### 6. Run locally

```bash
npm run dev
```

### AI agent setup

Copy the Claude Code hooks file:

```bash
cp .claude/settings.example.json .claude/settings.json
```

---

## Architecture

See `Obsidian Vault/Zapocalypse/Wiki/` for the full second-brain wiki:

- [Architecture Overview](Obsidian%20Vault/Zapocalypse/Wiki/Architecture/Architecture%20Overview.md)
- [Pipeline Orchestrator](Obsidian%20Vault/Zapocalypse/Wiki/Pipeline/Orchestrator.md)
- [Budget Protection](Obsidian%20Vault/Zapocalypse/Wiki/Concepts/Budget%20Protection%20Layers.md)
- [Firestore Schema](Obsidian%20Vault/Zapocalypse/Wiki/Data/Firestore%20Schema.md)

---

## License

MIT. See [LICENSE](LICENSE).
