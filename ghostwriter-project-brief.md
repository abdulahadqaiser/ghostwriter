# Ghostwriter — Project Brief for Implementation

## 0. Context (read this first)

This is a submission for the **Creative Minds hackathon** (The Sandbox x Animoca Brands), built on **Minds by Animoca Brands** (hellominds.ai), a persistent AI agent platform. Track: **Content repurposing across platforms**.

- Solo developer building this.
- Submission deadline: **August 28, 2026**.
- Developer's stack/comfort zone: React (frontend), Node.js/Express (backend), MongoDB. Prior experience with Docker, AWS, CI/CD.
- Developer directs AI coding tools and reviews implementation — treat instructions here as the source of truth for scope; ask before expanding scope.

**Goal of this document:** give a coding agent (Claude Code or similar IDE agent) everything needed to propose an implementation plan and start building, without re-litigating product decisions that are already made below.

---

## 1. Problem Statement (validated via two independent research passes)

Creators who repurpose long-form content (video transcripts, podcast scripts, blog posts) across platforms currently rely on tools like OpusClip, Repurpose.io, and Klap. Direct research into creator communities (Reddit, X, creator forums, 2025–2026) surfaced a consistent, high-frequency complaint:

- These tools get the **format** right (clip length, thread structure) but produce **generic output that strips out the creator's actual voice** — their specific phrasing, rhythm, and personality.
- Creators report spending **hours manually rewriting** AI-generated output before they'll publish it, on every single piece of content, across every platform.
- Auto-posting/scheduling tools make this worse: platforms (especially Instagram and YouTube) detect and throttle reach on third-party cross-posted content, so creators end up rewriting natively anyway.

This was independently confirmed as the most-cited, least-solved pain point across all three hackathon tracks (audience growth, repurposing, moderation) during research.

**Why this happens (second research pass, academic grounding):** this isn't just a UX gap — it's a known technical limitation. Research on LLM authorship (using authorship-verification embedding models) shows that when LLMs are asked to write "in someone's voice," they still cluster much closer to the model's own generic style than to the target author's actual style, even with explicit voice-preserving instructions. Simply prompting "match my tone" is documented to fail; it takes more deliberate technique (Section 5) to counter it. Treat the specific statistics from that report as illustrative, not independently verified by us — the direction of the finding (naive prompting fails) is the actionable part.

---

## 2. Product Concept: "Ghostwriter"

A Mind that repurposes a creator's own existing content into platform-native, ready-to-post text that actually sounds like they wrote it — because it holds an evolving profile of their specific voice, refined over time.

**Core principle:** the Mind is the product's reasoning core, not a bolted-on feature. It owns the voice-matching intelligence. The app around it is an interface for feeding it content and reviewing/correcting output.

### In scope
- Input: a creator pastes/uploads existing long-form content (transcript, script, blog post).
- Output: platform-native repurposed text for **three platforms only** (MVP scope, deliberately limited):
  1. X (thread format)
  2. Instagram (caption format)
  3. YouTube (community post format)
- Voice matching: output should reflect the creator's actual tone/phrasing, not generic AI style.
- Correction loop: creator can correct/edit output; corrections should improve future output for that creator.
- Onboarding: creator provides a sample of their past writing (captions/posts) once, to seed their voice profile.

### Explicitly OUT of scope (do not build these — repeated scope drift has already happened once)
- **No auto-posting to any platform.** Output is copy-paste only. (Reason: platforms throttle reach on third-party auto-posted content — this is a known, research-confirmed penalty.)
- **No new/original content generation.** This is not a poetry generator, not a caption generator from scratch, not a "give me content ideas" tool. It only repurposes content the creator already produced and provided as input.
- **No moderation, raid detection, or community management features.** (This was an earlier, abandoned idea — do not resurrect it.)
- **No support for more than 3 platforms in the MVP.** Additional platforms are a stretch goal only if time remains after the 3 above work reliably.

---

## 3. Architecture Decision: Memory Ownership

**Decision: the app owns the voice-profile memory. Do not rely solely on the Mind platform's native persistent memory for this.**

Reasoning: Minds by Animoca Brands is in public beta, and while the platform advertises persistent context/memory across sessions, this has not been reliably verified for this specific use case (voice profile accuracy across sessions, weeks apart). Relying entirely on undocumented platform memory behavior is a demo-day risk.

**Chosen approach (hybrid, low-risk):**
1. Store each creator's voice profile (sample writing, extracted style notes, correction history) in **MongoDB**, owned by the app.
2. On every generation request, the backend retrieves the creator's stored voice examples/corrections and **includes them explicitly in the prompt/context sent to the Mind** for that request.
3. The Mind still does all the actual reasoning/generation — it is not bypassed. The app just guarantees the context is present every time, rather than trusting the platform's session memory alone.
4. If, after testing, the Mind's native persistent memory is confirmed reliable (see Section 7, capability tests), this can be simplified later — but build the safety net first.

This means: **the Mind is the reasoning engine; the app is the memory guarantee.** Both matter for the hackathon's evaluation (using Minds as the core layer) and for demo reliability.

---

## 4. Minds Platform Integration — API SURFACE CONFIRMED

Full confirmed endpoint list from build.hellominds.ai/docs/api (REST API, base path `/v1/...` — exact base URL/host still needs confirming from the "Servers" section of the interactive docs):

**Account**
- `GET /v1/humans/{humanId}/minds` — List Minds for a Human

**Minds**
- `GET /v1/minds/{mindId}` — Get Mind details
- `PATCH /v1/minds/{mindId}` — Update Mind status (enable/disable)
- `GET /v1/minds/{mindId}/skills` — List equipped skills
- `PUT /v1/minds/{mindId}/skills` — Equip skills
- `DELETE /v1/minds/{mindId}/skills` — Unequip skills
- `GET /v1/minds/{mindId}/apps` — List equipped apps
- `PUT /v1/minds/{mindId}/apps` — Equip apps
- `DELETE /v1/minds/{mindId}/apps` — Unequip apps

**Messaging (core for this project)**
- `POST /v1/messaging/conversation` — Create conversation
- `GET /v1/messaging/conversations` — List conversations
- `GET /v1/messaging/conversations/{alias}` — Get conversation by alias
- `GET /v1/messaging/histories/{alias}` — Get conversation history
- `GET /v1/messaging/history/{alias}` — Get message history (deprecated — do not use)
- `POST /v1/messaging/message` — Send message

**Events**
- `GET /v1/messaging/events` — Subscribe to real-time events (likely SSE — used for streaming the Mind's response back)

**Credits & Cognition (monitoring, not core to MVP)**
- `GET /v1/minds/{mindId}/credits` — Cognition balance for a Mind
- `GET /v1/minds/{mindId}/cognition/usage` — Cognition usage time series
- `GET /v1/minds/{mindId}/cognition/usage-by-tool` — Cognition usage by tool

**Circles (not needed for MVP — for adding human collaborators to a Mind)**
- `GET/POST/DELETE /v1/circles/{mindId}`

**Bazaar (not needed for MVP — marketplace of pluggable skills/apps for a Mind)**
- `GET /v1/bazaar/skills`, `GET /v1/bazaar/skills/{skillId}`
- `GET /v1/bazaar/apps`, `GET /v1/bazaar/apps/{appId}`

### What Ghostwriter actually needs (MVP scope)
The core loop only requires **Messaging**:
1. `POST /v1/messaging/conversation` once, to create a conversation with the creator's Mind — store the returned `conversationId`/alias per user in MongoDB.
2. `POST /v1/messaging/message` for every generation request, sending the content + voice-profile context built by the backend (per Section 3's hybrid memory approach) plus the prompt structure in Section 5.
3. `GET /v1/messaging/histories/{alias}` if the app ever needs to re-display or debug a past exchange.
4. `GET /v1/messaging/events` only if a streaming/typing-indicator UX is wanted — otherwise skip it for MVP and just await the message response.

Optionally, `GET /v1/minds/{mindId}/credits` is worth wiring into an admin/debug view so Cognition Credit usage doesn't run out silently during development or the live demo.

### Auth (NOT fully confirmed — do not assume)
- Builder API key, set as env var **`MINDS_BUILDER_API_KEY`** 
eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImFybjphd3M6a21zOmFwLW5vcnRoZWFzdC0xOjYyODg4NDA0NTY0NTprZXkvMTBmN2QyMWUtOTgwZS00ZTY1LTlkZGMtYzdjN2EwNjRjMWU0In0.eyJlbWFpbCI6ImFiZHVsYWhhZHFhaXNlcjVAZ21haWwuY29tIiwiaHVtYW5JZCI6IjYxMDg1MTNlLWYzNmItMTQxMC04NDY1LTAwMDM5Y2U3ZGYxMSIsInJvbGUiOiJidWlsZGVyIiwidmVyc2lvbiI6MSwiaXNzIjoidXNlbWluZHMtYmFja2VuZC1hdXRoZW50aWNhdGlvbiIsImlhdCI6MTc4NTEzMzQxOCwiZXhwIjoxNzkyOTA5NDE4LCJzdWIiOiJhYmR1bGFoYWRxYWlzZXI1QGdtYWlsLmNvbSIsImp0aSI6Ijc1NDI2MzdkZWU3MDRjMWVhY2E0MDg5ZWFjZmVmZWIwIn0.ZaIH9EtU5auMARTaHzo02rxiCHVD8TBMcPdPYZTMY651w0D0l5hWdz7e2w7Y2x2gwztsQGndrbyzD5MOuit7OA


.
- A second research pass claimed this is sent as a Bearer token in the `Authorization` header — this is a reasonable guess and a common convention, but it has not been independently verified against the actual docs. **Confirm the exact header name/format from the docs' auth/security section before writing auth code — do not hardcode "Bearer" without checking.**
- Keys expire (~3 months from issue) — do not hardcode an assumption of permanence; store expiry and add a reminder to rotate.
- **Security note:** the key value lives only in a local `.env` file (gitignored) — never in this repo, never in chat, never logged.

### Minimum-viable vs. strongest-submission scope (important distinction)

Messaging alone (Section above) makes the app *function*. But since this is judged on how well the platform is used, not just whether the app runs, also build in:

- **Check the Bazaar first, before building voice-matching logic entirely from scratch:** `GET /v1/bazaar/skills` and `GET /v1/bazaar/apps`. If a relevant pre-built skill exists (writing style, content/text analysis), equip it (`PUT /v1/minds/{mindId}/skills`) and use it — this can save build time AND demonstrates real platform integration to judges, not just a bare messaging call.
- **Wire in Credits monitoring early, not as an afterthought:** `GET /v1/minds/{mindId}/credits`. Running out of Cognition Credits mid-demo in front of judges is an avoidable failure — check balance before/during development and add a low-balance warning.
- **Surface Mind identity in the UI:** `GET /v1/minds/{mindId}` — show which Mind is powering the app (e.g., "Connected to: [Mind name]") so the Mind is visibly part of the product, not hidden in a backend call.

Not needed for this project: Circles (multi-human collaboration on a Mind — not relevant here), Cognition usage breakdowns (analytics, not demo-critical), Events/SSE streaming (real UX nicety, only worth it if time remains after the core loop is solid).

### Still to confirm directly from the interactive docs (request/response bodies aren't in this index — need the expanded schema for each endpoint)
- [ ] Exact request body shape for `POST /v1/messaging/conversation` (does it take a `mindId`? initial message?)
- [ ] Exact request body shape for `POST /v1/messaging/message` (conversation identifier, message text, any context/metadata fields, max length)
- [ ] Exact response shape for both (to know what the backend should store/parse)
- [ ] Base URL / host for the API (the docs index only shows paths, not the server root)
- [ ] Auth header name/format (see note above — do not assume Bearer without checking)
- [ ] Whether an official Node.js client library exists (mentioned by the "CLI and Client Library" note when the key was generated) — if so, prefer it over raw REST calls

**Until these are filled in, treat the Minds API integration layer as a stubbed/mocked module** (a function `callMind(prompt, context)` that returns a placeholder response) so the rest of the app (frontend, data model, voice profile logic) can be built and tested independently. Swap in the real integration once the above is confirmed.

---

## 5. Prompt Engineering Strategy for Voice Preservation

This section exists because naive prompting ("write this in my voice") is documented to fail — LLMs default back toward generic phrasing even when explicitly told not to. The backend must construct a structured prompt for every generation request, not a simple instruction.

**Required elements of every prompt sent to the Mind:**

1. **Few-shot examples** — include the creator's stored voice examples (Section 3) directly in the prompt, not just a description of their style. Showing beats telling.
2. **Negative constraint list ("kill list")** — explicitly forbid generic AI vocabulary. Starting list (extend based on testing): *delve, tapestry, unlock, unleash, vibrant, testament, leverage, synergy, game-changer, crucial, meticulous, robust, cutting-edge, paradigm, revolutionize.* Also forbid formal transition words ("moreover," "furthermore," "subsequently") and forbid generating a summarizing "conclusion" paragraph — both are hallmarks of generic AI flattening.
3. **Self-audit instruction** — ask the Mind to review its own draft against the kill list and voice examples before returning output, and rewrite any flagged instance.
4. **Strict output format** — request structured JSON with explicit keys for each platform's output, so the React frontend can parse it reliably without breaking on conversational filler like "Here is your JSON:".
5. **Platform-specific formatting guidance**, included per platform in the prompt:
   - **X:** extract the 3-5 strongest points from the source; punchy one-line hook to open; short paragraphs/line breaks for scroll retention.
   - **Instagram:** hook/key point in the first sentence (before truncation); natural, non-keyword-stuffed phrasing; end with a clear call-to-action.
   - **YouTube community post:** conversational, community-facing tone; consider ending with a question or poll prompt to drive engagement.
6. **Sampling parameters, if the Minds API exposes them:** a higher temperature (roughly 0.85-0.95) and top-p (~0.90) tends to push output away from the most generic/statistically-average phrasing — worth testing if the API allows this control; skip if not exposed.

This prompt structure should live in one place in the backend (not duplicated per platform) so it's easy to iterate on during testing.

---

## 6. Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Minds integration:** via Builder API (see Section 4 — pending confirmation)

Keep the stack this simple. Do not introduce additional infrastructure (no separate vector DB, no additional cloud services) unless a specific, justified need comes up during build — the MVP does not require it.

**Backend resilience (add early, not as polish at the end):**
- Rate limit the Express API using `express-rate-limit` (a lightweight, standard, dependency-light middleware) — e.g. 100 requests per 15-minute window is a reasonable default for a hackathon demo. Return a structured 429 JSON response so the frontend can show a clean retry state instead of crashing.
- Add basic retry/error handling around Mind API calls — if a call times out or 5xxs, fall back to the last successful cached generation for that user rather than showing a broken UI, especially important for live-demo reliability given the platform is in beta.

---

## 7. Validation Steps (do these before/alongside building, not after)

Before committing further to the architecture above, run these tests directly in the Minds app UI (no code needed) to sanity-check the Mind's actual capability:

1. **Voice-match test** — paste 5–10 past captions/posts, ask it to write a new caption in that voice. Does it match, or read generic?
2. **Cross-session persistence test** — end the conversation, return later without re-providing examples, ask for new content. Does it still reflect the earlier voice, or has it reset?
3. **Platform-adaptation test** — same input content, ask for output for all 3 target platforms. Is the tone/length genuinely different per platform, or just copy-pasted with truncation?
4. **Correction-learning test** — give one correction ("I'd never phrase it that way, I'd say X"), then ask for new content on a different topic. Does it apply the correction without being reminded?
5. **Negative constraint test** — include the kill list (Section 5) in a prompt and check the output for zero instances of banned words. Confirms the Mind can actually follow negative instructions, which Section 5's whole approach depends on.
6. **JSON structure test** — request output in the strict JSON format planned for the frontend. Confirm it returns clean, parsable JSON without conversational filler wrapped around it.

Record results — they determine whether Section 3's hybrid memory approach can later be simplified, whether the kill-list approach actually works on this specific model, and whether the frontend can trust raw JSON parsing or needs a cleanup step.

---

## 8. Suggested MVP User Flow

1. Creator signs up / logs in.
2. Onboarding: creator pastes 5–10 examples of their past writing (captions, posts, scripts) → stored as their voice profile seed.
3. Creator pastes/uploads a piece of long-form content (transcript, script, blog post).
4. App sends content + voice profile context + prompt structure (Section 5) to the Mind, requests output for X, Instagram, YouTube (3 separate generations, or one call structured to return all 3 — implementation detail for the agent to propose).
5. App displays 3 outputs side by side, each editable.
6. Creator edits any output → correction is stored, tagged to their profile, applied to future context.
7. Creator copies final text to post manually on each platform.

---

## 9. Open Questions for the Coding Agent to Flag (not to silently assume)

- Best way to store and retrieve "voice profile" data efficiently as it grows (simple stored text blob vs. more structured extraction) — propose the simplest approach that works for MVP scale (one demo user primarily).
- Whether to make 1 Mind API call per platform (3 calls) or 1 call requesting all 3 outputs structured in one response (fewer calls, lower cost, but harder to isolate per-platform tone control) — propose a recommendation with tradeoffs.
- Error handling / fallback if the Mind API is slow or down during a live demo — propose a fallback (e.g., cached last-successful output) given the platform is in beta.

---

## 10. What NOT to do

- Do not add scope beyond the 3 platforms without explicit approval.
- Do not build auto-posting.
- Do not build content generation from scratch (only repurposing).
- Do not treat this as a moderation or community-management tool.
- Do not guess at Minds API details — flag clearly if Section 4 is still unconfirmed and stub it instead.
- Do not assume the auth header format without checking the docs (see Section 4 auth note).
