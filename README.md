# Zapocalypse — Vertical AI Content Factory

> Sequential AI pipeline: one long-form input → platform-specific content across Twitter/X, LinkedIn, Newsletter, Veo script, and Dark Social — powered by Gemini on Vertex AI.

This is a personal portfolio project showcasing the use of multi-agent AI tooling (Claude Code, Cursor, Gemini Antigravity) to plan, implement, and ship a production Next.js application. It also demonstrates the [LLM Project Wiki](https://github.com/akash-r34/llm-project-wiki) second-brain pattern — a structured Obsidian vault that serves as the authoritative reference for all agents working on the codebase.

🔗 **Live:** [zapocalypse--zapocalypse-8cd8b.us-central1.hosted.app](https://zapocalypse--zapocalypse-8cd8b.us-central1.hosted.app/) (single-user gated; sign-in restricted to the project owner)

![Landing hero](public/screenshots/01-landing-hero.png)

---

## What it does

1. You paste a URL, text, or file.
2. A 5-agent pipeline runs sequentially (Ingest → Analyze → Extract → Synthesize → Authenticate).
3. You get platform-ready content with tone fingerprinting, cost tracking, C2PA provenance, and selective regeneration.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Cloud Firestore · Firebase App Hosting · Gemini 2.5 Flash (Vertex AI, ADC)

---

## Screenshots

### The problem it solves
![The problem with generic AI slop](public/screenshots/03-problem.png)

### Built-for-creators feature set
Additive tone fingerprinting, selective regeneration, hook leaderboards, C2PA provenance, and GEO/dark-social formatting:
![Feature grid](public/screenshots/04-features.png)

### One input → an entire week of content
![Output platforms](public/screenshots/05-output-how-it-works.png)

### Tiered pricing with refund logic
![Pricing](public/screenshots/06-pricing.png)

### FAQ
![FAQ](public/screenshots/07-faq.png)

### Single-user auth gate
The app is locked to one verified Google account. Anyone reaching a workspace route hits this card; an unauthorized email is signed out immediately.

![Sign-in card](public/screenshots/09-signin-card.png)

### Mobile
![Mobile landing](public/screenshots/08-mobile-landing.png)

---

## Portfolio highlights

- **Multi-agent workflow** — Claude Code + Cursor + Gemini Antigravity all share one set of rules, commands, and memory (`.claude/`, `.cursor/`, `.gemini/`, `.agents/`).
- **Second-brain wiki** — `Obsidian Vault/Zapocalypse/` is a structured knowledge base auto-synced from project memory. Inspired by [llm-project-wiki](https://github.com/akash-r34/llm-project-wiki).
- **Budget protection** — hard kill-switch at $95/month; every Gemini call is gated and cost-tracked.
- **Fire-and-forget pipeline** — route returns `202` immediately; pipeline runs async; real-time status via Firestore listeners.
- **Tone fingerprinting + reflexion loop** — additive similarity scoring with per-platform regeneration.
- **C2PA provenance** — ECDSA-signed manifests for each output.

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

## Setup (fork & run)

### Prerequisites
- Node.js 20+
- Firebase project with Firestore (Native mode) and Firebase App Hosting enabled
- Google Cloud project with Vertex AI API enabled
- `gcloud` CLI + `firebase-tools`

### 1. Clone and install

```bash
git clone https://github.com/<you>/zapocalypse
cd zapocalypse
npm install
git config core.hooksPath .githooks   # activate pre-commit secret scanner
```

### 2. Configure Firebase

```bash
# Set your Firebase project
firebase use --add   # select your project, alias as "default"
```

### 3. Set environment variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions
```

Key variables:
| Variable | Where to find it |
|----------|-----------------|
| `GOOGLE_CLOUD_PROJECT` | GCP console → project ID |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase console → Project Settings → Web app config |
| `NEXT_PUBLIC_ALLOWED_USER_EMAIL` | Your Google account email (client-side gate) |
| `ALLOWED_USER_EMAIL` | Same email (server-side gate, RUNTIME only) |

### 4. Set up Vertex AI auth

```bash
gcloud auth application-default login
gcloud config set project your-firebase-project-id
```

### 5. Deploy Firestore rules

Edit `firestore.rules` — replace `<owner-email>` with your Google account email, then:

```bash
firebase deploy --only firestore:rules
```

### 6. Run locally

```bash
npm run dev
```

---

## AI agent setup

The `.claude/settings.example.json` file contains hooks for Claude Code (typecheck on save, budget guard). Copy it:

```bash
cp .claude/settings.example.json .claude/settings.json
```

---

## Architecture

See `Obsidian Vault/Zapocalypse/Wiki/` for the full second-brain wiki, including:

- [Architecture Overview](Obsidian%20Vault/Zapocalypse/Wiki/Architecture/Architecture%20Overview.md)
- [Pipeline Orchestrator](Obsidian%20Vault/Zapocalypse/Wiki/Pipeline/Orchestrator.md)
- [Budget Protection](Obsidian%20Vault/Zapocalypse/Wiki/Concepts/Budget%20Protection%20Layers.md)
- [Firestore Schema](Obsidian%20Vault/Zapocalypse/Wiki/Data/Firestore%20Schema.md)

---

## License

MIT — see [LICENSE](LICENSE).
