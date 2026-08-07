# LOVABLE VERSION - Atelier — AI Art Teacher for Neurodivergent Creators

# NOTE THIS IS THE OLD README AND NOT FULLY UPDATED, REAL VERSION IN LOVABLE
https://lovable.dev/projects/3fbfa346-8366-4a67-b1b4-4bea828bb050
https://artistic-companion.lovable.app

An AI-powered art critique tool designed **with** neurodivergent learners in mind, not as an afterthought. Built for the IncludEDU Neurodiversity Hackathon (Track 3: AI Creative Amplifier), with the goal of showcasing at the Stanford Neurodiversity Summit 2026.

The core thesis: **the tool adapts to the student, not the student to the tool.**

---

## What It Does

Students upload their artwork and receive personalized, encouraging AI critique. Every aspect of the feedback delivery — tone, length, structure, pacing, and modality (text vs. audio) — adapts to the student's learning profile.

### Key Features

- **Learning Profile System** — Students select a neurodivergent profile (ADHD, autism, dyslexia, sensory processing, anxiety) or customize their own. The AI edge function receives this profile and adapts its feedback style accordingly.
- **Step-by-Step Feedback** — Parses AI feedback into digestible sections presented one at a time with navigation controls. Students process at their own pace.
- **Focus Mode** — Full-screen distraction-free view that hides everything except the feedback.
- **Sensory Check-In** — A gentle pre-critique mood check that tailors an encouragement message to the student's current emotional state.
- **Accessibility Panel** — Sensory mode controls (full / reduced / calm), dyslexia-friendly font (Lexend), high contrast, text size scaling, and keyboard focus outlines.
- **Audio Narration** — Browser-native speech synthesis reads feedback aloud with selectable voice styles (warm, clear, calm) and speeds. Auto-narration option for hands-free listening.
- **Achievements & Badges** — 13 earnable badges tracking uploads, streaks, follow-up questions, medium exploration, and token milestones. Toast notifications on unlock.
- **Token Shop** — 8 purchasable items across categories (backgrounds, tools, cosmetic) including masterpiece generation, golden frames, and ambient sounds.
- **Portfolio Gallery** — Cloud-persisted portfolio of past artworks with skill progression tracking.
- **Preferred Medium Selection** — Students pick their medium; the AI tailors advice and grants bonus tokens for medium-matched work.
- **Seasonal Backgrounds** — Dynamic, animated backgrounds that change with the season (spring, summer, autumn, winter) with toggle control.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 (custom design system, no purple/violet hues) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Supabase (Postgres, Edge Functions, Storage) |
| AI | Google Gemini (via Supabase Edge Function) |
| Persistence | Supabase for portfolio/artwork data; localStorage for user preferences (accessibility, profile, achievements) |

---

## Project Structure

```
src/
├── App.tsx                          # Main app shell, provider tree, state orchestration
├── main.tsx                         # React entry point
├── index.css                        # Tailwind + custom design tokens + accessibility CSS
│
├── context/
│   ├── AccessibilityContext.tsx     # Sensory mode, font size, dyslexia font, contrast, narration settings
│   ├── AchievementContext.tsx       # Badges, streaks, milestone tracking (localStorage-persisted)
│   ├── LearningProfileContext.tsx   # Neurodivergent profile selection + AI prompt adaptation string builder
│   ├── MediumContext.tsx            # Preferred art medium selection
│   ├── RewardContext.tsx            # Token economy (earning, spending, shop purchases)
│   └── SeasonContext.tsx            # Seasonal background state
│
├── components/
│   ├── AccessibilityPanel.tsx       # Full accessibility settings modal
│   ├── AchievementBadge.tsx         # Badge collection modal with stats and progress bar
│   ├── AudioNarration.tsx           # Web Speech API narration control with play/pause/stop
│   ├── BadgeToast.tsx               # Toast notification when a new badge is earned
│   ├── CritiquePinsOverlay.tsx      # Visual pins overlaid on artwork pointing to specific feedback
│   ├── FollowupChat.tsx             # Conversational follow-up Q&A about the artwork
│   ├── FocusMode.tsx                # Distraction-free full-screen feedback viewer + StepNavigation
│   ├── JourneyTracker.tsx          # Skill progression timeline visualization
│   ├── LoadingAnalysis.tsx         # Animated loading state during AI analysis
│   ├── MarkdownRenderer.tsx        # Custom markdown-to-JSX renderer for AI feedback
│   ├── MasterpieceModal.tsx        # AI-generated masterpiece display modal
│   ├── Portfolio.tsx               # Gallery view of saved artworks
│   ├── PremiumBackground.tsx       # Unlocked premium background themes
│   ├── SeasonalBackground.tsx      # Seasonal animated background (particles, colors)
│   ├── SeasonalControl.tsx         # Season toggle button
│   ├── SensoryCheckIn.tsx          # Pre-critique mood/emotion check-in modal
│   ├── StepByStepFeedback.tsx      # Parses feedback into navigable one-at-a-time sections
│   ├── Stickers.tsx                # Decorative sticker elements
│   ├── TokenHud.tsx                # Token balance display in header
│   ├── TokenShop.tsx               # Shop modal with categorized purchasable items
│   ├── UnlockToast.tsx             # Toast for unlocked features
│   └── UploadZone.tsx              # Drag-and-drop artwork upload area
│
├── hooks/
│   └── usePortfolio.ts             # Portfolio CRUD hook (Supabase storage + DB)
│
└── lib/
    ├── scoring.ts                  # Token calculation logic, skill level normalization
    └── supabase.ts                 # Supabase client initialization

supabase/
├── migrations/
│   └── 20260723012340_create_portfolio_system.sql  # Portfolio table, RLS policies, storage bucket
└── functions/
    └── analyze-artwork/
        └── index.ts                # AI critique edge function (Gemini vision API)
                                   # Accepts: image, mimeType, preferredMedium, profilePrompt
                                   # profilePrompt injects neurodivergent accommodation instructions
                                   # into the AI's system prompt
```

---

## How the Learning Profile Adapts the AI

The `LearningProfileContext` builds a prompt-adaptation string via `buildProfilePromptString()` and sends it as `profilePrompt` in the API call to the `analyze-artwork` edge function. The edge function injects it into the Gemini system prompt under a `NEURODIVERGENT LEARNER ACCOMMODATION` header.

**Profile → AI behavior mapping:**

| Profile | AI Feedback Behavior |
|---------|---------------------|
| ADHD | Short, structured, one action at a time, energetic tone, most important point first |
| Autism | Explicit, literal, detailed, numbered steps, no metaphors or vague language |
| Dyslexia | Short sentences, plain language, bolded key terms, bullet points over paragraphs |
| Sensory | Minimal, calm, grounding tone, 1-2 key points only |
| Anxiety | Extra warm, strengths front and center, growth framed as exciting possibilities |

**Customization toggles** (independent of profile, can be mixed):
- Pacing separators (visual `---` breaks between sections)
- Strengths first (always lead with praise)
- One thing at a time (single growth suggestion)
- Plain language (define technical terms)
- Detail level (minimal / balanced / detailed)
- Custom free-text note for personal preferences

---

## Design System

- **Palette**: Warm earth tones (cream, sand, deep earth, warm taupe) with accent ramps in amber, coral, rose, sage, sky, lavender — no purple/violet hues.
- **Fonts**: Outfit (body), Fraunces (display/headings), Lexend (dyslexia-friendly mode).
- **Spacing**: 8px grid system.
- **Animations**: Framer Motion throughout, with three sensory levels (full / reduced / none) controllable from the accessibility panel.
- **Accessibility CSS**: Body-level classes (`sensory-reduced`, `sensory-minimal`, `font-dyslexic`, `contrast-high`, `text-sm-base` through `text-xl-base`) applied via `useEffect` in App.tsx.

---

## Supabase Setup

The project uses a pre-provisioned Supabase instance. Credentials are in `.env` (do not modify).

### Database
- **Table**: `portfolio_entries` — stores artwork metadata, skill level, tokens earned, feedback, critique pins, medium.
- **RLS**: Enabled with per-user CRUD policies (`auth.uid() = user_id`).
- **Storage**: `artwork-images` bucket for uploaded artwork files.

### Edge Function
- **`analyze-artwork`** — Accepts an image (base64), preferred medium, and neurodivergent profile prompt. Calls Google Gemini's vision API to analyze the artwork and return structured critique. Deployed via Supabase MCP tool.

### Required Secrets (pre-configured)
- `GEMINI_API_KEY` — Google Gemini API key for the AI vision model.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

---

## Agent Handoff Notes

If you are another AI agent picking up this project, here's what you need to know:

### Architecture decisions
- **Provider tree order** (outermost → innermost): `SeasonProvider` → `MediumProvider` → `AccessibilityProvider` → `LearningProfileProvider` → `AchievementProvider` → `RewardProvider` → `AppContent`. This order matters because `AppContent` consumes all of them.
- **State persistence**: User preferences (accessibility, learning profile, achievements, tokens) are in `localStorage`, NOT Supabase. Only portfolio artwork data goes to Supabase. This was intentional — preferences are client-side and don't need sync.
- **No auth**: The app currently has no authentication. Portfolio entries use a `user_id` column with RLS policies ready for when auth is added, but the current flow generates a client-side ID. If adding auth, wire up Supabase email/password auth and replace the client-side ID with `auth.uid()`.

### When modifying the AI edge function
- Read `supabase/functions/analyze-artwork/index.ts` first — it's a large file with the system prompt, medium-specific prompts, and output format all defined as string constants.
- The `profilePrompt` parameter is injected into the system prompt after the medium prompt and before the output format. Keep this ordering.
- Deploy changes using the `mcp__supabase__deploy_edge_function` MCP tool with `slug: "analyze-artwork"` and `verify_jwt: false`. Do NOT use the Supabase CLI.
- The function handles both artwork analysis AND follow-up chat questions (same endpoint, different request shape).

### When adding new accessibility features
- Add new state fields to `AccessibilityContext.tsx` or `LearningProfileContext.tsx` depending on whether they're sensory/visual or learning/feedback related.
- Add corresponding CSS classes in `src/index.css` under the `@layer base` block.
- Apply the classes in the `useEffect` in `AppContent` that manages body class names.

### When adding new achievements/badges
- Add badge definitions to the `ALL_BADGES` array in `AchievementContext.tsx`.
- Add the earn condition logic in the `checkBadges()` function.
- Add the icon mapping in `AchievementBadge.tsx` (`BADGE_ICONS` object).
- The `BadgeToast` component automatically displays when `newlyEarnedBadge` is set — no wiring needed.

### When adding shop items
- Add item definitions to the `SHOP_ITEMS` array in `TokenShop.tsx`.
- Background-type items need a corresponding entry in `RewardContext.tsx` (`ShopBackground` type and `PREMIUM_BACKGROUNDS` set).
- Item-type purchases just need a `ShopItem` type entry in `RewardContext.tsx`.

### Known considerations
- The bundle is ~630KB (177KB gzipped). If this becomes an issue, consider code-splitting with dynamic imports for the modal components.
- The `SensoryCheckIn` only triggers if the student has a learning profile set (`profile !== "none"`). Students without a profile go straight to analysis.
- `AudioNarration` uses the browser's `SpeechSynthesisAPI` — no external API or key needed, but voice availability varies by browser/OS.
- The `StepByStepFeedback` parser splits on markdown headings (`#`, `##`, `###`). If the AI output format changes, update the parser accordingly.

### Hackathon context
- **Track**: Track 3 — AI Creative Amplifier
- **Event**: IncludEDU Neurodiversity Hackathon
- **Showcase**: Stanford Neurodiversity Summit, September 2026
- **Design principle**: "Designed WITH, not just FOR" — the hackathon requires involvement of at least one real neurodivergent user in design or testing. Document any user testing feedback and how it changed the build.
