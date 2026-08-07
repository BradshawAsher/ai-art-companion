# Atelier — AI Art Teacher for Neurodivergent Creators

An AI-powered art critique tool designed **with** neurodivergent learners in mind, not as an afterthought. Built for the IncludEDU Neurodiversity Hackathon (Track 3: AI Creative Amplifier), with the goal of showcasing at the Stanford Neurodiversity Summit 2026.

The core thesis: **the tool adapts to the student, not the student to the tool.**

---

## What It Does

Students upload their artwork and receive personalized, encouraging AI critique. Every aspect of the feedback delivery — tone, length, structure, pacing, and modality (text vs. audio) — adapts to the student's learning profile.

### Key Features

- **Learning Profile System** — Students select a neurodivergent profile (ADHD, autism, dyslexia, sensory processing, anxiety) or customize their own. The profile is compiled into a prompt fragment sent with every critique request.
- **Step-by-Step Feedback** — Parses AI feedback into digestible sections presented one at a time with navigation controls.
- **Focus Mode** — Full-screen distraction-free view that hides everything except the feedback.
- **Sensory Check-In** — A gentle pre-critique mood check that tailors an encouragement message to the student's current emotional state.
- **Accessibility Panel** — Sensory mode controls (full / reduced / calm), dyslexia-friendly font (Lexend), high contrast, text size scaling, and keyboard focus outlines.
- **Audio Narration** — Browser-native speech synthesis reads feedback aloud with selectable voice styles and speeds.
- **Follow-up Chat** — Conversational Q&A about the same artwork; the artwork, the notepad and the sketchpad drawing are all attached so the teacher can reference them.
- **Workspace Panel** — A notepad and sketchpad. Notes are woven into the critique prompt; the sketch can be shared with the follow-up chat.
- **Achievements & Badges** — Earnable badges tracking uploads, streaks, follow-up questions, medium exploration, and token milestones, with toast notifications.
- **Token Shop** — Purchasable backgrounds, tools and cosmetics, including AI masterpiece generation.
- **Sticker Canvas** — Unlockable sticker packs students can place freely on the page.
- **Portfolio Gallery** — Cloud-persisted portfolio of past artworks with skill progression tracking.
- **Preferred Medium Selection** — Students pick their medium; the AI tailors advice and grants bonus tokens for medium-matched work.
- **Seasonal Backgrounds** — Animated backgrounds that change with the season, with manual override.
- **Admin / Demo Mode** — A stage-ready demo switch (see below).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start v1 (React 19, SSR + server routes) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 via `src/styles.css` (custom design tokens, no purple/violet hues) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Lovable Cloud (Postgres, Storage) |
| AI | Google Gemini through the Lovable AI Gateway — **no API key needed** |
| Persistence | Cloud database + storage for portfolio artwork; `localStorage` for preferences (accessibility, profile, achievements, tokens) |
| Package manager | Bun |

There is no Supabase Edge Function and no `GEMINI_API_KEY`. All AI work happens in a TanStack server route that calls the gateway with the project's managed `LOVABLE_API_KEY`.

---

## AI Model Fallback Chain — confirmed set up

Implemented in `src/routes/api/analyze-artwork.ts`. Requests start on the cheapest, fastest model and escalate automatically, resending the **identical conversation** so no context is lost.

Text / vision chain (in order):

1. `google/gemini-3.1-flash-lite`
2. `google/gemini-2.5-flash-lite`
3. `google/gemini-3-flash-preview`
4. `google/gemini-3.5-flash`
5. `google/gemini-3.6-flash`
6. `google/gemini-2.5-flash`
7. `google/gemini-3.1-pro-preview`
8. `google/gemini-2.5-pro`

Image generation chain: `google/gemini-3.1-flash-image` → `google/gemini-3-pro-image`.

Escalation rules:

- **429 (rate limited)** — short backoff, one retry on the same model, then escalate.
- **Transient errors / 5xx** — escalate to the next model.
- **`finish_reason: "length"`** (answer truncated) — escalate to a higher-capacity model.
- **402 (credits) and 500 (misconfiguration)** — terminal, surfaced to the UI immediately.
- **Unparseable critique JSON** — the whole chain is retried starting one model higher, then prose is salvaged so the student still gets feedback.

The client (`src/lib/api-client.ts`) adds its own timeout plus retry-with-backoff on 429/5xx, and records every call (status, latency, model, error) into the in-memory debug log.

---

## Admin / Demo Mode

An **Admin** button sits in the bottom-left corner. Its panel provides:

- **Admin toggle** (persisted in `localStorage`) — unlimited tokens, every badge earned, every shop item, background and sticker pack unlocked, all purchases succeed, and AI-artwork rejection is skipped so a live demo never dead-ends.
- **Seed demo entries** — paints three sample artworks and stores them as gallery entries so the portfolio is never empty on stage.
- **Model fallback chain** readout.
- **AI request log** — the last requests with status, mode, latency, model used, and any error.

---

## Project Structure

```
src/
├── AtelierApp.tsx                   # Main app shell, provider tree, state orchestration
├── router.tsx                       # TanStack Router setup
├── styles.css                       # Tailwind v4 theme tokens + accessibility CSS
│
├── routes/
│   ├── __root.tsx                   # Root document, head metadata, fonts
│   ├── index.tsx                    # "/" route rendering AtelierApp
│   └── api/analyze-artwork.ts       # Server route: critique, follow-up, style analysis,
│                                    # masterpiece generation, model fallback chain
│
├── context/
│   ├── AccessibilityContext.tsx     # Sensory mode, font size, dyslexia font, contrast, narration
│   ├── AchievementContext.tsx       # Badges, streaks, milestones (admin-aware)
│   ├── AdminContext.tsx             # Admin/demo mode state
│   ├── LearningProfileContext.tsx   # Profile selection + AI prompt adaptation builder
│   ├── MediumContext.tsx            # Preferred art medium
│   ├── RewardContext.tsx            # Token economy and shop unlocks (admin-aware)
│   ├── SeasonContext.tsx            # Seasonal background state
│   ├── StickerPlacementContext.tsx  # Placed stickers
│   └── WorkspaceContext.tsx         # Notepad + sketchpad state
│
├── components/                      # UI (AdminPanel, WorkspacePanel, FocusMode,
│                                    # StepByStepFeedback, Portfolio, TokenShop, …)
├── hooks/usePortfolio.ts            # Portfolio CRUD (storage upload + DB rows + signed URLs)
└── lib/
    ├── api-client.ts                # Fetch wrapper: timeout, retries, debug logging
    ├── atelier-ai.server.ts         # System prompts, medium prompts, output format, parser
    ├── debug-log.ts                 # In-memory AI request log for the admin panel
    ├── image-utils.ts               # Client-side image conversion/compression
    ├── scoring.ts                   # Token calculation, skill level normalization
    └── supabase.ts                  # Cloud client + bucket name
```

---

## How the Learning Profile Adapts the AI

`LearningProfileContext` builds a prompt-adaptation string and sends it as `profilePrompt` to `/api/analyze-artwork`, which appends it to the system prompt after the medium prompt and before the output format. Keep that ordering when editing.

| Profile | AI Feedback Behavior |
|---------|---------------------|
| ADHD | Short, structured, one action at a time, energetic tone, most important point first |
| Autism | Explicit, literal, detailed, numbered steps, no metaphors or vague language |
| Dyslexia | Short sentences, plain language, bolded key terms, bullet points over paragraphs |
| Sensory | Minimal, calm, grounding tone, 1-2 key points only |
| Anxiety | Extra warm, strengths front and center, growth framed as exciting possibilities |

**Customization toggles** (mixable, independent of profile): pacing separators, strengths first, one thing at a time, plain language, detail level (minimal / balanced / detailed), and a custom free-text note.

---

## Design System

- **Palette**: Warm earth tones (cream, sand, deep earth, warm taupe) with accent ramps in amber, coral, rose, sage, sky, lavender — no purple/violet hues.
- **Fonts**: Outfit (body), Fraunces (display/headings), Lexend (dyslexia-friendly mode), loaded via a `<link>` in `__root.tsx`.
- **Animations**: Framer Motion throughout, with three sensory levels controllable from the accessibility panel.
- **Accessibility CSS**: Body-level classes (`sensory-reduced`, `sensory-minimal`, `font-dyslexic`, `contrast-high`, text-size scales) applied via `useEffect` in `AtelierApp.tsx`.

---

## Backend

Provisioned automatically by Lovable Cloud; credentials live in `.env` (do not edit).

- **Table `portfolio_entries`** — artwork metadata, skill level, tokens earned, feedback, critique pins, medium, experimentation level. RLS enabled with open policies (the app has no auth yet).
- **Storage bucket `artworks`** — private; images are read through time-limited signed URLs.
- **Server route `/api/analyze-artwork`** — one endpoint, four modes: default artwork analysis, `followup`, `analyze-style`, and `generate-masterpiece`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Preview the production build |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

---

## Agent Handoff Notes

### Architecture decisions
- **Provider tree order** (outermost → innermost): `AdminProvider` → `SeasonProvider` → `MediumProvider` → `AccessibilityProvider` → `LearningProfileProvider` → `AchievementProvider` → `RewardProvider` → `StickerPlacementProvider` → `WorkspaceProvider` → `AppContent`. `AdminProvider` must stay outermost because reward and achievement state read from it.
- **State persistence**: preferences, tokens and achievements are `localStorage`; only portfolio artwork goes to the cloud. Intentional — preferences don't need sync.
- **No auth**: RLS policies are currently open. If auth is added, scope the policies to `auth.uid()` and add a `user_id` column.

### When modifying the AI route
- Prompts live in `src/lib/atelier-ai.server.ts`; the HTTP/fallback logic lives in `src/routes/api/analyze-artwork.ts`. Keep them separated.
- Never call the gateway from browser code — `LOVABLE_API_KEY` is server-only and read inside the handler.
- Adding a model means adding an exact `vendor/model` id to `TEXT_MODELS` or `IMAGE_MODELS`, and mirroring it in `MODEL_CHAIN` in `AdminPanel.tsx` for the readout.

### When adding accessibility features
Add state to `AccessibilityContext.tsx` (sensory/visual) or `LearningProfileContext.tsx` (feedback style), add CSS in `src/styles.css`, and apply the class in the body-class `useEffect` in `AtelierApp.tsx`.

### When adding badges or shop items
- Badges: definitions in `ALL_BADGES` plus earn logic in `checkBadges()` (`AchievementContext.tsx`), and an icon in `AchievementBadge.tsx`. `BadgeToast` renders automatically.
- Shop: items in `TokenShop.tsx`; background items also need a `ShopBackground` entry in `RewardContext.tsx`. Admin mode's "unlock all" lists in `RewardContext.tsx` must include new ids.

### Known considerations
- `SensoryCheckIn` only triggers when a learning profile is set; otherwise analysis starts immediately.
- `AudioNarration` uses the browser Speech Synthesis API — no key needed, but voice availability varies by browser/OS.
- `StepByStepFeedback` splits on markdown headings; update the parser if the AI output format changes.
- Artwork images are compressed client-side before upload to keep gateway payloads small.

### Hackathon context
- **Track**: Track 3 — AI Creative Amplifier
- **Event**: IncludEDU Neurodiversity Hackathon
- **Showcase**: Stanford Neurodiversity Summit, September 2026
- **Design principle**: "Designed WITH, not just FOR" — document any neurodivergent user testing and how it changed the build.
